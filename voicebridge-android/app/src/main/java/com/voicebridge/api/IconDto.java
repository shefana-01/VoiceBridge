// Copyright (c) 2026 Afsara Saima Mannan
// Licensed under the PolyForm Noncommercial License 1.0. 
// See the LICENSE.txt file in the project root for full terms.

package com.voicebridge.api;

import com.google.gson.annotations.SerializedName;

/**
 * Network DTO for the icon object embedded in each board item.
 *
 * The backend BoardSerializer nests icons as  items[].icon , and the
 * IconSerializer sends these exact field names. This DTO is ONLY for
 * parsing JSON — it is mapped into the Room {@code Icon} entity inside
 * SyncManager. Keeping the network shape separate from the database
 * entity is what was missing before (the Icon entity had no
 * {@code @SerializedName} annotations, so every field came back null).
 */
public class IconDto {

    @SerializedName("id")
    public String id;

    @SerializedName("label")
    public String label;

    @SerializedName("category")
    public String category;

    // Absolute URLs (IconSerializer uses use_url=True)
    @SerializedName("image")
    public String image;

    @SerializedName("audio")
    public String audio;          // may be null now that audio is optional

    @SerializedName("tts_text")
    public String ttsText;        // spoken when there is no recorded audio

    @SerializedName("updated_at")
    public String updatedAt;

    public IconDto() {}
}
