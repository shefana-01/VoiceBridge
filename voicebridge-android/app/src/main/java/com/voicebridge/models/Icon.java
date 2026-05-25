// Copyright (c) 2026 Afsara Saima Mannan
// Licensed under the PolyForm Noncommercial License 1.0. 
// See the LICENSE.txt file in the project root for full terms.

package com.voicebridge.models;

import androidx.annotation.NonNull;
import androidx.room.ColumnInfo;
import androidx.room.Entity;
import androidx.room.ForeignKey;
import androidx.room.Index;
import androidx.room.PrimaryKey;

@Entity(
    tableName = "icons",
    foreignKeys = @ForeignKey(
        entity = Board.class,
        parentColumns = "id",
        childColumns = "boardId",
        onDelete = ForeignKey.CASCADE
    ),
    indices = {@Index("boardId")}
)
public class Icon {
    @PrimaryKey
    @NonNull
    @ColumnInfo(name = "id")
    public String id = "";

    @ColumnInfo(name = "boardId")
    public String boardId;

    @ColumnInfo(name = "label")
    public String label;

    @ColumnInfo(name = "category")
    public String category;

    @ColumnInfo(name = "ttsText")
    public String ttsText;

    @ColumnInfo(name = "localImagePath")
    public String localImagePath;

    @ColumnInfo(name = "localAudioPath")
    public String localAudioPath;

    @ColumnInfo(name = "remoteImageUrl")
    public String remoteImageUrl;

    @ColumnInfo(name = "remoteAudioUrl")
    public String remoteAudioUrl;

    @ColumnInfo(name = "row")
    public int row;

    @ColumnInfo(name = "col")
    public int col;

    @ColumnInfo(name = "isActive")
    public boolean isActive = true;

    @ColumnInfo(name = "updatedAt")
    public String updatedAt;

    /** Required by Room and Gson — do not remove. */
    public Icon() {}
}
