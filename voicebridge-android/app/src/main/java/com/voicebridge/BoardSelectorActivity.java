// Copyright (c) 2026 Afsara Saima Mannan
// Licensed under the PolyForm Noncommercial License 1.0. 
// See the LICENSE.txt file in the project root for full terms.

package com.voicebridge;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.ProgressBar;
import android.widget.TextView;

import androidx.appcompat.app.AppCompatActivity;
import androidx.lifecycle.ViewModelProvider;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.voicebridge.adapters.BoardAdapter;
import com.voicebridge.api.SyncManager;
import com.voicebridge.models.Board;
import com.voicebridge.viewmodel.MainViewModel;

/**
 * The board selection screen — shows the list of boards available for this child.
 * e.g. "Mealtime", "School", "Bathroom", "Emotions".
 *
 * The child (or caregiver) taps a board to open MainActivity with that board's icons.
 * A background sync runs so any new boards from the caregiver appear here.
 */
public class BoardSelectorActivity extends AppCompatActivity {

    private MainViewModel viewModel;
    private SyncManager syncManager;
    private BoardAdapter boardAdapter;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_board_selector);

        String childId = getIntent().getStringExtra("child_id");

        RecyclerView recyclerView = findViewById(R.id.recycler_boards);
        ProgressBar progressBar = findViewById(R.id.progress_bar);
        TextView tvEmpty = findViewById(R.id.tv_empty);

        recyclerView.setLayoutManager(new androidx.recyclerview.widget.GridLayoutManager(this, 2));

        boardAdapter = new BoardAdapter(board -> {
            // Child tapped a board — open the icon grid
            Intent intent = new Intent(this, MainActivity.class);
            intent.putExtra("board_id", board.id);
            intent.putExtra("board_name", board.name);
            intent.putExtra("board_cols", board.cols);
            intent.putExtra("board_rows", board.rows);
            intent.putExtra("board_bg_color", board.backgroundColor);
            startActivity(intent);
        });
        recyclerView.setAdapter(boardAdapter);

        viewModel = new ViewModelProvider(this).get(MainViewModel.class);
        viewModel.getActiveBoards().observe(this, boards -> {
            progressBar.setVisibility(View.GONE);
            if (boards == null || boards.isEmpty()) {
                tvEmpty.setVisibility(View.VISIBLE);
                recyclerView.setVisibility(View.GONE);
            } else if (boards.size() == 1) {
                // Auto-skip phase 1 logic: If exactly 1 board, jump straight to it.
                Board board = boards.get(0);
                Intent intent = new Intent(this, MainActivity.class);
                intent.putExtra("board_id", board.id);
                intent.putExtra("board_name", board.name);
                intent.putExtra("board_cols", board.cols);
                intent.putExtra("board_rows", board.rows);
                intent.putExtra("board_bg_color", board.backgroundColor);
                startActivity(intent);
                finish(); // Prevent going back to this screen
            } else {
                tvEmpty.setVisibility(View.GONE);
                recyclerView.setVisibility(View.VISIBLE);
                boardAdapter.setBoards(boards);
            }
        });

        // Background sync — won't block the UI
        syncManager = new SyncManager(this);
        if (childId != null) {
            syncManager.syncData(childId);
        }
    }
}
