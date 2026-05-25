package com.voicebridge;

import android.os.Bundle;
import android.widget.TextView;

import androidx.appcompat.app.AppCompatActivity;
import androidx.lifecycle.ViewModelProvider;
import androidx.recyclerview.widget.GridLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.voicebridge.adapters.IconAdapter;
import com.voicebridge.utils.AudioPlayer;
import com.voicebridge.viewmodel.MainViewModel;

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
        // Use the board's real column count so a 4×4 board shows 4 columns.
        // Falls back to 4 if not provided.
        int cols = getIntent().getIntExtra("board_cols", 4);
        if (cols < 1) cols = 4;

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
        recyclerView.setAdapter(iconAdapter);

        viewModel = new ViewModelProvider(this).get(MainViewModel.class);

        if (boardId != null) {
            viewModel.getIconsForBoard(boardId).observe(this, icons -> {
                if (icons != null) {
                    iconAdapter.setIcons(icons);
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
