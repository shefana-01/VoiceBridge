// Copyright (c) 2026 Afsara Saima Mannan
// Licensed under the PolyForm Noncommercial License 1.0. 
// See the LICENSE.txt file in the project root for full terms.

package com.voicebridge;

import android.os.Bundle;
import android.widget.TextView;

import androidx.appcompat.app.AppCompatActivity;
import androidx.lifecycle.ViewModelProvider;
import androidx.recyclerview.widget.GridLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.voicebridge.adapters.IconAdapter;
import com.voicebridge.models.Icon;
import com.voicebridge.utils.AudioPlayer;
import com.voicebridge.viewmodel.MainViewModel;

import java.util.ArrayList;
import java.util.List;

/**
 * The child's main AAC screen.
 * Shows a grid of tap-to-speak icons for the selected board.
 *
 * The child only taps — no menus, no visible back button, no distractions.
 * Tapping an icon plays its recorded audio, or speaks its TTS text if no
 * audio was recorded.
 */
public class MainActivity extends AppCompatActivity {

    private AudioPlayer audioPlayer;
    private MainViewModel viewModel;
    private IconAdapter iconAdapter;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        String boardId   = getIntent().getStringExtra("board_id");
        String boardName = getIntent().getStringExtra("board_name");
        String bgColor   = getIntent().getStringExtra("board_bg_color");
        // Use the board's real column and row count.
        int cols = getIntent().getIntExtra("board_cols", 4);
        int rows = getIntent().getIntExtra("board_rows", 4);
        if (cols < 1) cols = 4;
        if (rows < 1) rows = 4;

        if (bgColor != null && !bgColor.isEmpty()) {
            try {
                findViewById(android.R.id.content).setBackgroundColor(android.graphics.Color.parseColor(bgColor));
            } catch (IllegalArgumentException e) {
                // Ignore invalid colors
            }
        }

        TextView tvBoardTitle = findViewById(R.id.tv_board_title);
        if (tvBoardTitle != null && boardName != null) {
            tvBoardTitle.setText(boardName);
        }

        audioPlayer = new AudioPlayer(this);

        RecyclerView recyclerView = findViewById(R.id.recycler_view_icons);
        recyclerView.setLayoutManager(new GridLayoutManager(this, cols));

        iconAdapter = new IconAdapter(icon -> {
            // Child tapped an icon — play recorded audio, or TTS the text/label.
            String fallback = (icon.ttsText != null && !icon.ttsText.isEmpty())
                    ? icon.ttsText : icon.label;
            audioPlayer.playAudio(icon.localAudioPath, fallback);
        });
        iconAdapter.setRows(rows);
        recyclerView.setAdapter(iconAdapter);

        viewModel = new ViewModelProvider(this).get(MainViewModel.class);

        if (boardId != null) {
            final int finalCols = cols;
            final int finalRows = rows;
            viewModel.getIconsForBoard(boardId).observe(this, icons -> {
                if (icons != null) {
                    List<Icon> paddedIcons = new ArrayList<>();
                    int totalSlots = finalRows * finalCols;
                    
                    // Initialize with empty icons
                    for (int i = 0; i < totalSlots; i++) {
                        Icon emptyIcon = new Icon();
                        emptyIcon.id = "empty_" + i;
                        emptyIcon.label = "";
                        paddedIcons.add(emptyIcon);
                    }
                    
                    // Place real icons in their designated grid slots
                    for (Icon icon : icons) {
                        int slotIndex = (icon.row * finalCols) + icon.col;
                        if (slotIndex >= 0 && slotIndex < totalSlots) {
                            paddedIcons.set(slotIndex, icon);
                        }
                    }
                    iconAdapter.setIcons(paddedIcons);
                }
            });
        }
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        audioPlayer.release();
    }
}
