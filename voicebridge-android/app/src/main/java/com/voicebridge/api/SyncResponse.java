package com.voicebridge.api;

import com.google.gson.annotations.SerializedName;
import com.voicebridge.models.Board;

import java.util.List;

/** Matches the JSON shape returned by GET /api/v1/boards/sync/ */
public class SyncResponse {
    @SerializedName("boards")
    public List<Board> boards;

    @SerializedName("synced_at")       // backend sends snake_case
    public String syncedAt;

    /** Required by Gson — do not remove. */
    public SyncResponse() {}
}
