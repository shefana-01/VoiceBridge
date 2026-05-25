package com.voicebridge.api;

import com.google.gson.annotations.SerializedName;

/**
 * Network DTO for one cell on a board.
 *
 * Matches the backend BoardItemSerializer:  { "row", "col", "icon": {...} }
 * SyncManager flattens these into Room {@code Icon} rows (one per cell),
 * stamping each with its parent board's id plus the row/col position.
 */
public class BoardItemDto {

    @SerializedName("row")
    public int row;

    @SerializedName("col")
    public int col;

    @SerializedName("icon")
    public IconDto icon;

    public BoardItemDto() {}
}
