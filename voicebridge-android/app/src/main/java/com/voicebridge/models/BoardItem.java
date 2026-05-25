package com.voicebridge.models;

import com.google.gson.annotations.SerializedName;

/**
 * Wire-format object — matches the Django backend's BoardItemSerializer JSON shape.
 *
 *   {
 *     "id": 17,
 *     "icon": { ... full Icon object ... },
 *     "row": 0,
 *     "col": 2
 *   }
 *
 * This is NOT a Room entity — we flatten this into the {@link Icon} table on sync
 * (Icon already has its own row/col + boardId fields, so we don't need a separate
 * through-table on the client).
 */
public class BoardItem {

    @SerializedName("id")
    public long id;

    @SerializedName("icon")
    public IconDto icon;

    @SerializedName("row")
    public int row;

    @SerializedName("col")
    public int col;

    /**
     * Wire-format Icon — same JSON keys the backend sends, but kept separate
     * from the Room {@link Icon} entity so we can map fields cleanly.
     */
    public static class IconDto {
        @SerializedName("id")         public long   id;
        @SerializedName("label")      public String label;
        @SerializedName("category")   public String category;
        @SerializedName("tts_text")   public String ttsText;
        @SerializedName("image")      public String image;  // absolute URL
        @SerializedName("audio")      public String audio;  // absolute URL
        @SerializedName("updated_at") public String updatedAt;
    }
}
