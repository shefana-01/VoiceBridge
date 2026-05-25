// Copyright (c) 2026 Afsara Saima Mannan
// Licensed under the PolyForm Noncommercial License 1.0. 
// See the LICENSE.txt file in the project root for full terms.

package com.voicebridge.api;

import android.content.Context;
import android.content.SharedPreferences;
import android.util.Log;

import com.voicebridge.db.AppDatabase;
import com.voicebridge.models.Board;
import com.voicebridge.models.Icon;
import com.voicebridge.utils.FileDownloader;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;

/**
 * Handles background synchronisation with the Django backend.
 *
 * Flow:
 *   1. GET /api/v1/boards/sync/?child=<id>&modified_since=<ts>
 *   2. Save each board to Room.
 *   3. **Flatten each board's items[] into Room Icon rows** (THE FIX).
 *   4. Trigger FileDownloader to cache image + audio for offline use.
 *   5. Store synced_at so the next sync is incremental.
 *
 * Previously step 3 was missing: boards were saved but their icons never
 * were, so the child's grid (getIconsForBoard) came back empty — the board
 * opened to nothing. This version maps the embedded items into Icon rows.
 */
public class SyncManager {
    private static final String TAG = "SyncManager";
    private static final String PREF_SYNC = "vb_sync_prefs";
    private static final String KEY_LAST_SYNC = "last_synced_at";

    private final ApiService apiService;
    private final AppDatabase db;
    private final TokenStore tokenStore;
    private final FileDownloader fileDownloader;
    private final ExecutorService executor;
    private final SharedPreferences syncPrefs;

    public SyncManager(Context context) {
        this.tokenStore = new TokenStore(context);
        this.db = AppDatabase.getDatabase(context);
        this.fileDownloader = new FileDownloader(context);
        this.executor = Executors.newSingleThreadExecutor();
        this.syncPrefs = context.getSharedPreferences(PREF_SYNC, Context.MODE_PRIVATE);

        Retrofit retrofit = new Retrofit.Builder()
                .baseUrl(tokenStore.getBaseUrl())
                .addConverterFactory(GsonConverterFactory.create())
                .build();
        this.apiService = retrofit.create(ApiService.class);
    }

    /**
     * Trigger a sync for a specific child's boards.
     *
     * @param childId the ID of the child whose boards to sync
     */
    public void syncData(String childId) {
        String token = tokenStore.getAccess();
        if (token == null) {
            Log.w(TAG, "No access token — skipping sync. User must set up device first.");
            return;
        }
        String bearerToken = "Bearer " + token;
        // Force a full sync to ensure any missing icons are downloaded,
        // ignoring the lastSynced timestamp.
        String lastSynced = null;

        apiService.syncBoards(bearerToken, childId, lastSynced)
                .enqueue(new Callback<SyncResponse>() {
                    @Override
                    public void onResponse(Call<SyncResponse> call, Response<SyncResponse> response) {
                        if (response.isSuccessful() && response.body() != null) {
                            SyncResponse body = response.body();
                            int boardCount = body.boards != null ? body.boards.size() : 0;
                            Log.d(TAG, "Sync received " + boardCount + " boards.");

                            executor.execute(() -> {
                                processBoardsFromSync(body, childId, bearerToken);
                                if (body.syncedAt != null) {
                                    syncPrefs.edit()
                                            .putString(KEY_LAST_SYNC + "_" + childId, body.syncedAt)
                                            .apply();
                                }
                            });
                        } else {
                            Log.w(TAG, "Sync failed — HTTP " + response.code());
                        }
                    }

                    @Override
                    public void onFailure(Call<SyncResponse> call, Throwable t) {
                        Log.e(TAG, "Sync network error — app will use offline cache", t);
                    }
                });
    }

    /**
     * Save boards AND their icons to Room.
     *
     * Because insertBoards uses OnConflictStrategy.REPLACE and the Icon table
     * has an ON DELETE CASCADE foreign key to boards, re-inserting a changed
     * board first clears its old icons; we then insert the fresh set. This
     * keeps each board's grid exactly matching the server, even when a
     * caregiver removes an icon.
     */
    private void processBoardsFromSync(SyncResponse body, String childId, String bearerToken) {
        if (body.boards == null || body.boards.isEmpty()) {
            Log.d(TAG, "Sync returned no board changes.");
            return;
        }

        List<Board> roomBoards = new ArrayList<>();
        List<Icon> roomIcons = new ArrayList<>();

        for (Board board : body.boards) {
            if (board == null || board.id == null) continue;
            board.childId = childId;
            roomBoards.add(board);

            // ---- THE FIX: flatten items[] into Room Icon rows ----
            if (board.items != null) {
                for (BoardItemDto item : board.items) {
                    if (item == null || item.icon == null) continue;
                    IconDto dto = item.icon;

                    Icon icon = new Icon();
                    // Composite id: same backend icon can appear on many boards
                    // without primary-key collisions in Room.
                    icon.id            = board.id + "_" + dto.id;
                    icon.boardId       = board.id;
                    icon.label         = dto.label;
                    icon.category      = dto.category;
                    icon.ttsText       = dto.ttsText;
                    icon.remoteImageUrl = dto.image;
                    icon.remoteAudioUrl = dto.audio;   // may be null → AudioPlayer uses TTS
                    icon.row           = item.row;
                    icon.col           = item.col;
                    icon.isActive      = true;
                    icon.updatedAt     = dto.updatedAt != null ? dto.updatedAt : board.updatedAt;

                    roomIcons.add(icon);
                }
            }
        }

        // Replacing a board cascades-deletes its old icons (FK ON DELETE CASCADE),
        // so this order naturally drops stale icons before inserting the new set.
        db.iconDao().insertBoards(roomBoards);
        if (!roomIcons.isEmpty()) {
            db.iconDao().insertIcons(roomIcons);
            Log.d(TAG, "Inserted " + roomIcons.size() + " icons across "
                    + roomBoards.size() + " boards.");
        } else {
            Log.w(TAG, "Boards synced but contained no items — check the backend "
                    + "BoardSerializer is returning the items array.");
        }

        // Cache image + audio for offline use (icons with no audio fall back to TTS)
        for (Board board : roomBoards) {
            fileDownloader.downloadPendingFiles(board.id, bearerToken);
        }
    }
}
