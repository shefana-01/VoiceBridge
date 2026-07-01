// Copyright (c) 2026 Afsara Saima Mannan
// Licensed under the PolyForm Noncommercial License 1.0. 
// See the LICENSE.txt file in the project root for full terms.

package com.voicebridge.utils;

import android.content.Context;
import android.util.Log;

import com.voicebridge.db.AppDatabase;
import com.voicebridge.models.Icon;
import com.voicebridge.models.Board;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;

/**
 * Downloads image and audio files from the Django backend to local device storage.
 * This is what makes the app truly offline — once downloaded, the child never needs
 * Wi-Fi for the audio to play.
 *
 * Files are stored in:
 *   /data/data/com.voicebridge/files/icons/images/<icon_id>.jpg
 *   /data/data/com.voicebridge/files/icons/audio/<icon_id>.mp3
 */
public class FileDownloader {
    private static final String TAG = "FileDownloader";
    private final Context context;
    private final AppDatabase db;
    private final OkHttpClient httpClient;
    private final ExecutorService executor;

    public FileDownloader(Context context) {
        this.context = context.getApplicationContext();
        this.db = AppDatabase.getDatabase(context);
        this.httpClient = new OkHttpClient();
        this.executor = Executors.newFixedThreadPool(2); // 2 parallel downloads
    }

    /**
     * Downloads any missing image/audio files for icons in a given board.
     * Call this after syncing board data from the server.
     * Runs entirely on background threads — safe to call from main thread.
     *
     * @param boardId   the board whose icons need files downloaded
     * @param authToken "Bearer <token>" — needed if media is protected
     */
    public void downloadPendingFiles(String boardId, String authToken) {
        executor.execute(() -> {
            // 1. Download Board Cover if needed
            Board board = db.iconDao().getBoardById(boardId);
            if (board != null && board.coverIconRemoteUrl != null && !board.coverIconRemoteUrl.isEmpty()
                    && (board.coverIconLocalPath == null || board.coverIconLocalPath.isEmpty())) {
                String coverPath = downloadFile(board.coverIconRemoteUrl, "images", "board_" + board.id + "_cover.jpg", authToken);
                if (coverPath != null) {
                    db.iconDao().updateBoardLocalPath(board.id, coverPath);
                }
            }

            // 2. Download Icons
            List<Icon> pending = db.iconDao().getIconsPendingDownload(boardId);
            Log.d(TAG, pending.size() + " icons pending download for board " + boardId);

            for (Icon icon : pending) {
                String imagePath = null;
                String audioPath = null;

                if (icon.remoteImageUrl != null && !icon.remoteImageUrl.isEmpty()) {
                    imagePath = downloadFile(icon.remoteImageUrl, "images", icon.id + ".jpg", authToken);
                }
                if (icon.remoteAudioUrl != null && !icon.remoteAudioUrl.isEmpty()) {
                    audioPath = downloadFile(icon.remoteAudioUrl, "audio", icon.id + ".mp3", authToken);
                }

                if (imagePath != null || audioPath != null) {
                    db.iconDao().updateLocalPaths(icon.id, imagePath, audioPath);
                    Log.d(TAG, "Downloaded files for icon: " + icon.label);
                }
            }
        });
    }

    /**
     * Downloads a single file from a URL and saves it to local app storage.
     *
     * @param url       full URL of the file
     * @param subfolder "images" or "audio"
     * @param filename  what to name the file on disk
     * @param authToken "Bearer <token>" — pass null if not required
     * @return absolute path of saved file, or null if download failed
     */
    private String downloadFile(String url, String subfolder, String filename, String authToken) {
        try {
            File dir = new File(context.getFilesDir(), "icons/" + subfolder);
            if (!dir.exists()) dir.mkdirs();

            File outFile = new File(dir, filename);
            if (outFile.exists()) {
                return outFile.getAbsolutePath(); // already cached, skip
            }

            Request.Builder requestBuilder = new Request.Builder().url(url);
            if (authToken != null && !authToken.isEmpty()) {
                requestBuilder.addHeader("Authorization", authToken);
            }

            Response response = httpClient.newCall(requestBuilder.build()).execute();
            if (!response.isSuccessful() || response.body() == null) {
                Log.w(TAG, "Failed to download " + url + " — HTTP " + response.code());
                return null;
            }

            try (InputStream in = response.body().byteStream();
                 FileOutputStream out = new FileOutputStream(outFile)) {
                byte[] buf = new byte[4096];
                int len;
                while ((len = in.read(buf)) != -1) {
                    out.write(buf, 0, len);
                }
            }

            return outFile.getAbsolutePath();

        } catch (IOException e) {
            Log.e(TAG, "Error downloading file: " + url, e);
            return null;
        }
    }

    public void shutdown() {
        executor.shutdown();
    }
}
