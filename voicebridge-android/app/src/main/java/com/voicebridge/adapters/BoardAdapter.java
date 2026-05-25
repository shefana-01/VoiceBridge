package com.voicebridge.adapters;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.voicebridge.R;
import com.voicebridge.models.Board;

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
        this.boards = boards;
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
        holder.tvBoardSize.setText(board.rows + " × " + board.cols + " grid");
        holder.itemView.setOnClickListener(v -> listener.onBoardClick(board));
    }

    @Override
    public int getItemCount() { return boards.size(); }

    static class BoardViewHolder extends RecyclerView.ViewHolder {
        final TextView tvBoardName;
        final TextView tvBoardSize;

        BoardViewHolder(View itemView) {
            super(itemView);
            tvBoardName = itemView.findViewById(R.id.tv_board_name);
            tvBoardSize = itemView.findViewById(R.id.tv_board_size);
        }
    }
}
