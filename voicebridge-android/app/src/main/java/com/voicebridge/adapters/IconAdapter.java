// Copyright (c) 2026 Afsara Saima Mannan
// Licensed under the PolyForm Noncommercial License 1.0. 
// See the LICENSE.txt file in the project root for full terms.

package com.voicebridge.adapters;

import android.graphics.Color;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.DiffUtil;
import androidx.recyclerview.widget.RecyclerView;

import com.bumptech.glide.Glide;
import com.bumptech.glide.load.engine.DiskCacheStrategy;
import com.voicebridge.R;
import com.voicebridge.models.Icon;

import java.io.File;
import java.util.ArrayList;
import java.util.List;

public class IconAdapter extends RecyclerView.Adapter<IconAdapter.IconViewHolder> {

    private List<Icon> icons = new ArrayList<>();
    private int rows = 4;
    private final OnIconClickListener listener;

    public interface OnIconClickListener {
        void onIconClick(Icon icon);
    }

    public IconAdapter(OnIconClickListener listener) {
        this.listener = listener;
        setHasStableIds(true); // for smoother RecyclerView animations
    }

    public void setRows(int rows) {
        if (rows > 0) this.rows = rows;
    }

    public void setIcons(List<Icon> newIcons) {
        if (newIcons == null) newIcons = new ArrayList<>();
        final List<Icon> finalNewIcons = newIcons;
        DiffUtil.DiffResult diff = DiffUtil.calculateDiff(new DiffUtil.Callback() {
            @Override public int getOldListSize() { return icons.size(); }
            @Override public int getNewListSize() { return finalNewIcons.size(); }
            @Override public boolean areItemsTheSame(int o, int n) {
                return icons.get(o).id.equals(finalNewIcons.get(n).id);
            }
            @Override public boolean areContentsTheSame(int o, int n) {
                if (icons.get(o).updatedAt == null && finalNewIcons.get(n).updatedAt == null) return true;
                if (icons.get(o).updatedAt == null || finalNewIcons.get(n).updatedAt == null) return false;
                return icons.get(o).updatedAt.equals(finalNewIcons.get(n).updatedAt);
            }
        });
        this.icons = finalNewIcons;
        diff.dispatchUpdatesTo(this);
    }

    @Override
    public long getItemId(int position) {
        return icons.get(position).id.hashCode();
    }

    @NonNull
    @Override
    public IconViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext())
                .inflate(R.layout.item_icon, parent, false);
        return new IconViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull IconViewHolder holder, int position) {
        Icon icon = icons.get(position);
        
        // Handle empty padded slots to preserve grid layout mathematically
        if (icon.label == null || (icon.label.isEmpty() && icon.remoteImageUrl == null && icon.localImagePath == null)) {
            holder.itemView.setVisibility(View.INVISIBLE);
            holder.itemView.setOnClickListener(null);
            return;
        } else {
            holder.itemView.setVisibility(View.VISIBLE);
        }

        holder.textViewLabel.setText(icon.label);

        // Load image with Glide — handles local files and remote URLs
        if (icon.localImagePath != null && !icon.localImagePath.isEmpty()) {
            // Local cached file (offline mode)
            Glide.with(holder.itemView.getContext())
                    .load(new File(icon.localImagePath))
                    .diskCacheStrategy(DiskCacheStrategy.NONE) // file is already local
                    .placeholder(R.drawable.ic_icon_placeholder)
                    .error(R.drawable.ic_icon_placeholder)
                    .fitCenter()
                    .into(holder.imageViewIcon);
        } else if (icon.remoteImageUrl != null && !icon.remoteImageUrl.isEmpty()) {
            // Remote URL (fallback when file not yet downloaded)
            Glide.with(holder.itemView.getContext())
                    .load(icon.remoteImageUrl)
                    .diskCacheStrategy(DiskCacheStrategy.ALL)
                    .placeholder(R.drawable.ic_icon_placeholder)
                    .error(R.drawable.ic_icon_placeholder)
                    .fitCenter()
                    .into(holder.imageViewIcon);
        } else {
            holder.imageViewIcon.setImageResource(R.drawable.ic_icon_placeholder);
        }

        // Colour-code by category for quick visual recognition
        holder.itemView.setContentDescription(icon.label + " icon");
        holder.itemView.setFocusable(true);
        
        holder.itemView.setOnClickListener(new View.OnClickListener() {
            private long lastClickTime = 0;
            @Override
            public void onClick(View v) {
                long currentTime = System.currentTimeMillis();
                if (currentTime - lastClickTime > 500) {
                    lastClickTime = currentTime;
                    listener.onIconClick(icon);
                }
            }
        });
    }

    @Override
    public int getItemCount() {
        return icons.size();
    }

    static class IconViewHolder extends RecyclerView.ViewHolder {
        final TextView textViewLabel;
        final ImageView imageViewIcon;

        IconViewHolder(View itemView) {
            super(itemView);
            textViewLabel = itemView.findViewById(R.id.text_view_label);
            imageViewIcon = itemView.findViewById(R.id.image_view_icon);
        }
    }
}
