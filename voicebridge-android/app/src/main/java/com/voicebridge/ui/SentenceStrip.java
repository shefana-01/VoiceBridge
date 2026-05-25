// Copyright (c) 2026 Afsara Saima Mannan
// Licensed under the PolyForm Noncommercial License 1.0. 
// See the LICENSE.txt file in the project root for full terms.

package com.voicebridge.ui;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.voicebridge.models.Icon;
import com.voicebridge.utils.AudioPlayer;

import java.util.ArrayList;
import java.util.List;

/**
 * Sentence-strip controller.
 *
 * In a real AAC product the child taps icons in sequence to *compose a
 * phrase* — e.g. [I want] [eat] — then taps **Speak** to play the
 * sequence aloud. This is the canonical PECS-style interaction; without
 * it, the app feels like a soundboard, not a communication device.
 *
 * Responsibilities:
 *   - Hold an ordered list of icons added to the strip
 *   - Render the strip as a horizontal RecyclerView
 *   - Speak the queued sequence with a small inter-clip delay so each
 *     word is intelligible
 *   - Allow individual chip removal (tap a chip → it goes away) and a
 *     "clear all" affordance
 */
public class SentenceStrip {

    /** Listener for the host activity to react to strip state changes. */
    public interface OnStripChange {
        void onChanged(int size);
    }

    private final RecyclerView recyclerView;
    private final AudioPlayer audioPlayer;
    private final OnStripChange listener;
    private final List<Icon> sequence = new ArrayList<>();
    private ChipAdapter adapter;

    public SentenceStrip(@NonNull RecyclerView recyclerView,
                         @NonNull AudioPlayer audioPlayer,
                         @NonNull OnStripChange listener) {
        this.recyclerView = recyclerView;
        this.audioPlayer  = audioPlayer;
        this.listener     = listener;

        LinearLayoutManager lm = new LinearLayoutManager(
                recyclerView.getContext(), LinearLayoutManager.HORIZONTAL, false);
        recyclerView.setLayoutManager(lm);

        adapter = new ChipAdapter(sequence, position -> {
            // Tap a chip to remove it from the strip
            if (position >= 0 && position < sequence.size()) {
                sequence.remove(position);
                adapter.notifyItemRemoved(position);
                listener.onChanged(sequence.size());
            }
        });
        recyclerView.setAdapter(adapter);
    }

    /** Append an icon to the strip and play its audio immediately. */
    public void add(Icon icon) {
        sequence.add(icon);
        adapter.notifyItemInserted(sequence.size() - 1);
        recyclerView.smoothScrollToPosition(sequence.size() - 1);
        listener.onChanged(sequence.size());

        // Discoverability: tapping an icon should give *immediate* feedback,
        // even if the caregiver intends to compose a phrase before "Speak".
        audioPlayer.playAudio(icon.localAudioPath,
            icon.ttsText != null && !icon.ttsText.isEmpty() ? icon.ttsText : icon.label);
    }

    /** Play every queued clip in sequence with a 200ms inter-clip gap. */
    public void speakAll() {
        if (sequence.isEmpty()) return;
        audioPlayer.stop();
        for (int i = 0; i < sequence.size(); i++) {
            final Icon ic = sequence.get(i);
            recyclerView.postDelayed(() ->
                audioPlayer.playAudio(ic.localAudioPath,
                    ic.ttsText != null && !ic.ttsText.isEmpty() ? ic.ttsText : ic.label),
                i * 700L);   // 700ms cadence — enough to articulate each word
        }
    }

    /** Wipe the strip — bound to the × button. */
    public void clear() {
        int n = sequence.size();
        if (n == 0) return;
        sequence.clear();
        adapter.notifyItemRangeRemoved(0, n);
        listener.onChanged(0);
    }

    public int size() { return sequence.size(); }
}
