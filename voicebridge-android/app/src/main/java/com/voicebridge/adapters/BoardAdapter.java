// Copyright (c) 2026 Afsara Saima Mannan
// Licensed under the PolyForm Noncommercial License 1.0. 
// See the LICENSE.txt file in the project root for full terms.

package com.voicebridge.adapters;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.TextView;
import android.os.Handler;
import android.os.Looper;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.bumptech.glide.Glide;
import com.bumptech.glide.load.engine.DiskCacheStrategy;
import com.voicebridge.R;
import com.voicebridge.db.AppDatabase;
import com.voicebridge.models.Board;
import com.voicebridge.models.Icon;

import java.io.File;

import java.util.ArrayList;
import java.util.List;

public class BoardAdapter extends RecyclerView.Adapter<BoardAdapter.BoardViewHolder> {

    private List<Board> boards = new ArrayList<>();
    private final OnBoardClickListener listener;

    public interface OnBoardClickListener {
        void onBoardClick(Board board);
    }

    public BoardAdapter(OnBoardClickListener listener) {
        this.listener = listener;
    }

    public void setBoards(List<Board> boards) {
        if (boards == null) {
            this.boards = new ArrayList<>();
        } else {
            this.boards = boards;
        }
        notifyDataSetChanged();
    }

    @NonNull
    @Override
    public BoardViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext())
                .inflate(R.layout.item_board, parent, false);
        return new BoardViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull BoardViewHolder holder, int position) {
        Board board = boards.get(position);
        holder.tvBoardName.setText(board.name);
        
        // Reset to default folder icon while loading
        holder.imageViewFolder.setImageResource(android.R.drawable.ic_menu_agenda);
        
        if (board.coverIconLocalPath != null && !board.coverIconLocalPath.isEmpty()) {
            Glide.with(holder.itemView.getContext())
                    .load(new File(board.coverIconLocalPath))
                    .diskCacheStrategy(DiskCacheStrategy.NONE)
                    .into(holder.imageViewFolder);
        } else if (board.coverIconRemoteUrl != null && !board.coverIconRemoteUrl.isEmpty()) {
            Glide.with(holder.itemView.getContext())
                    .load(board.coverIconRemoteUrl)
                    .diskCacheStrategy(DiskCacheStrategy.ALL)
                    .into(holder.imageViewFolder);
        }

        holder.itemView.setOnClickListener(v -> listener.onBoardClick(board));
    }

    @Override
    public int getItemCount() { return boards.size(); }

    static class BoardViewHolder extends RecyclerView.ViewHolder {
        final TextView tvBoardName;
        final ImageView imageViewFolder;

        BoardViewHolder(View itemView) {
            super(itemView);
            tvBoardName = itemView.findViewById(R.id.tv_board_name);
            imageViewFolder = itemView.findViewById(R.id.image_view_folder);
        }
    }
}
