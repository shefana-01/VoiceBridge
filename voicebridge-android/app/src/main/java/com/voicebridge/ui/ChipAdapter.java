package com.voicebridge.ui;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.bumptech.glide.Glide;
import com.voicebridge.R;
import com.voicebridge.models.Icon;

import java.io.File;
import java.util.List;

/**
 * Renders each strip entry as a small chip (image + label). Tapping a
 * chip removes it from the strip.
 */
public class ChipAdapter extends RecyclerView.Adapter<ChipAdapter.VH> {

    public interface OnChipTap {
        void onTap(int position);
    }

    private final List<Icon> data;
    private final OnChipTap tap;

    public ChipAdapter(List<Icon> data, OnChipTap tap) {
        this.data = data;
        this.tap  = tap;
    }

    @NonNull @Override
    public VH onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View v = LayoutInflater.from(parent.getContext())
                    .inflate(R.layout.item_sentence_chip, parent, false);
        return new VH(v);
    }

    @Override
    public void onBindViewHolder(@NonNull VH h, int pos) {
        Icon ic = data.get(pos);
        h.label.setText(ic.label);

        if (ic.localImagePath != null && !ic.localImagePath.isEmpty()) {
            Glide.with(h.image).load(new File(ic.localImagePath))
                 .centerCrop().into(h.image);
        } else {
            h.image.setImageDrawable(null);
        }

        h.itemView.setContentDescription("Remove " + ic.label + " from strip");
        h.itemView.setFocusable(true);
        h.itemView.setOnClickListener(v -> tap.onTap(h.getAdapterPosition()));
    }

    @Override public int getItemCount() { return data.size(); }

    static class VH extends RecyclerView.ViewHolder {
        final ImageView image;
        final TextView  label;
        VH(@NonNull View item) {
            super(item);
            image = item.findViewById(R.id.chip_image);
            label = item.findViewById(R.id.chip_label);
        }
    }
}
