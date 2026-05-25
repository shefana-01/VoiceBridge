// Copyright (c) 2026 Afsara Saima Mannan
// Licensed under the PolyForm Noncommercial License 1.0. 
// See the LICENSE.txt file in the project root for full terms.

package com.voicebridge.models;

import androidx.annotation.NonNull;
import androidx.room.ColumnInfo;
import androidx.room.Entity;
import androidx.room.Ignore;
import androidx.room.PrimaryKey;

import com.google.gson.annotations.SerializedName;
import com.voicebridge.api.BoardItemDto;

import java.util.List;

@Entity(tableName = "boards")
public class Board {

    @PrimaryKey
    @NonNull
    @ColumnInfo(name = "id")
    public String id = "";

    @SerializedName("name")
    @ColumnInfo(name = "name")
    public String name;

    // Backend sends child as an integer ID; we store it as a string
    @SerializedName("child")
    @ColumnInfo(name = "childId")
    public String childId;

    @SerializedName("rows")
    @ColumnInfo(name = "rows")
    public int rows = 4;

    @SerializedName("cols")
    @ColumnInfo(name = "cols")
    public int cols = 4;

    @SerializedName("background_color")
    @ColumnInfo(name = "backgroundColor")
    public String backgroundColor;

    @SerializedName("is_active")
    @ColumnInfo(name = "isActive")
    public boolean isActive = true;

    @SerializedName("updated_at")
    @ColumnInfo(name = "updatedAt")
    public String updatedAt;

    /**
     * The icons placed on this board, as sent by the backend
     * (BoardSerializer.items). This is a TRANSIENT field:
     *   - {@code @Ignore} tells Room NOT to create a column for it
     *     (Room can't store a list), and
     *   - Gson still populates it from the JSON via reflection.
     *
     * SyncManager reads this list and flattens it into Room Icon rows.
     * THIS FIELD WAS MISSING BEFORE — which is why the icons inside a
     * board were silently dropped and the child's grid was empty.
     */
    @Ignore
    @SerializedName("items")
    public List<BoardItemDto> items;

    /** Required by Room and Gson — do not remove. */
    public Board() {}
}
