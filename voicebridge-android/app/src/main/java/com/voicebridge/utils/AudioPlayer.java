// Copyright (c) 2026 Afsara Saima Mannan
// Licensed under the PolyForm Noncommercial License 1.0. 
// See the LICENSE.txt file in the project root for full terms.

package com.voicebridge.utils;

import android.content.Context;
import android.media.AudioAttributes;
import android.media.SoundPool;
import android.speech.tts.TextToSpeech;
import android.util.Log;

import java.io.File;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

/**
 * Zero-latency audio player for VoiceBridge.
 *
 * Uses {@link SoundPool} instead of MediaPlayer because the gap between tap
 * and sound is critical for a non-verbal child — MediaPlayer has a ~50ms
 * "preparing" delay; SoundPool keeps clips memory-resident and starts in
 * effectively zero time.
 *
 * Trade-offs we accept:
 *  - SoundPool caps individual clips at ~1 MB. Caregiver-recorded voice
 *    clips are typically 30–300 KB, so this is fine. If a clip is too
 *    large, we fall back to TTS rather than failing silently.
 *  - SoundPool holds samples in memory until released; we don't try to
 *    preload everything at app start. Clips are loaded on first reference
 *    and reused thereafter.
 *
 * Public API mirrors the old MediaPlayer-backed AudioPlayer so callers
 * (e.g. {@code MainActivity}) don't need refactoring beyond the
 * constructor name.
 */
public class AudioPlayer {

    private static final String TAG = "AudioPlayer";

    private final Context context;
    private final SoundPool soundPool;
    private TextToSpeech tts;
    private final Map<String, Integer> loadedSounds = new HashMap<>();
    private boolean ttsReady = false;

    public AudioPlayer(Context context) {
        this.context = context.getApplicationContext();

        AudioAttributes attrs = new AudioAttributes.Builder()
                .setUsage(AudioAttributes.USAGE_ASSISTANCE_ACCESSIBILITY)
                .setContentType(AudioAttributes.CONTENT_TYPE_SPEECH)
                .build();

        // maxStreams=5 lets the child rapid-tap up to five icons in quick succession
        // without one playback truncating the previous.
        this.soundPool = new SoundPool.Builder()
                .setMaxStreams(5)
                .setAudioAttributes(attrs)
                .build();

        // Fallback engine. Speaks the icon's label if no audio file is present
        // or if the file failed to load into SoundPool.
        this.tts = new TextToSpeech(this.context, status -> {
            if (status == TextToSpeech.SUCCESS) {
                tts.setLanguage(Locale.getDefault());
                ttsReady = true;
            } else {
                Log.w(TAG, "TextToSpeech failed to initialise (status=" + status + ")");
            }
        });
    }

    /**
     * Play the audio clip at {@code filePath}. If the file is missing,
     * empty, or fails to load, fall back to TTS using {@code fallbackText}.
     */
    public void playAudio(String filePath, String fallbackText) {
        if (filePath != null && !filePath.isEmpty() && new File(filePath).exists()) {
            Integer soundId = loadedSounds.get(filePath);
            if (soundId == null) {
                // First time — load it. SoundPool.load() is asynchronous, so we
                // register a one-shot OnLoadCompleteListener that plays the clip
                // the moment loading finishes.
                final int id = soundPool.load(filePath, 1);
                loadedSounds.put(filePath, id);
                soundPool.setOnLoadCompleteListener((sp, sampleId, status) -> {
                    if (sampleId == id) {
                        if (status == 0) {
                            sp.play(id, 1.0f, 1.0f, /*priority*/ 1, /*loop*/ 0, /*rate*/ 1.0f);
                        } else {
                            Log.w(TAG, "SoundPool load failed for " + filePath
                                       + " (status=" + status + ") — falling back to TTS");
                            loadedSounds.remove(filePath);
                            speakTts(fallbackText);
                        }
                    }
                });
            } else {
                // Cached — play instantly.
                soundPool.play(soundId, 1.0f, 1.0f, 1, 0, 1.0f);
            }
        } else {
            speakTts(fallbackText);
        }
    }

    private void speakTts(String text) {
        if (text == null || text.isEmpty()) return;
        if (!ttsReady) {
            Log.w(TAG, "TTS not ready — dropping utterance: " + text);
            return;
        }
        tts.speak(text, TextToSpeech.QUEUE_ADD, null,
                  "vb_" + System.currentTimeMillis());
    }

    /**
     * Optional helper: pre-load a clip so the very first tap is also instant.
     * Call this when the board first loads, after sync finishes.
     */
    public void preload(String filePath) {
        if (filePath == null || filePath.isEmpty()) return;
        if (loadedSounds.containsKey(filePath)) return;
        if (!new File(filePath).exists()) return;
        int id = soundPool.load(filePath, 0);
        loadedSounds.put(filePath, id);
    }

    /** Stops anything currently playing and flushes the TTS queue. */
    public void stop() {
        for (Integer id : loadedSounds.values()) {
            if (id != null) soundPool.stop(id);
        }
        if (ttsReady) tts.stop();
    }

    /** Release everything — call from Activity.onDestroy(). */
    public void release() {
        soundPool.release();
        loadedSounds.clear();
        if (tts != null) {
            tts.stop();
            tts.shutdown();
        }
    }
}
