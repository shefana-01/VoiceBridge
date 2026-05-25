package com.voicebridge.db;

import androidx.lifecycle.LiveData;
import androidx.room.Dao;
import androidx.room.Insert;
import androidx.room.OnConflictStrategy;
import androidx.room.Query;

import com.voicebridge.models.Board;
import com.voicebridge.models.Icon;

import java.util.List;

@Dao
public interface IconDao {

    // ---- Board queries -------------------------------------------------------

    @Query("SELECT * FROM boards WHERE isActive = 1 ORDER BY name")
    LiveData<List<Board>> getActiveBoards();

    @Query("SELECT * FROM boards WHERE id = :boardId LIMIT 1")
    Board getBoardById(String boardId);

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    void insertBoards(List<Board> boards);

    @Query("DELETE FROM boards")
    void deleteAllBoards();

    // ---- Icon queries -------------------------------------------------------

    @Query("SELECT * FROM icons WHERE boardId = :boardId AND isActive = 1 ORDER BY row, col")
    LiveData<List<Icon>> getIconsForBoard(String boardId);

    /** Used by FileDownloader to find icons still needing local files. */
    @Query("SELECT * FROM icons WHERE (localAudioPath IS NULL OR localAudioPath = '') AND boardId = :boardId")
    List<Icon> getIconsPendingDownload(String boardId);

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    void insertIcons(List<Icon> icons);

    /** Update the local file paths after downloading from the server. */
    @Query("UPDATE icons SET localImagePath = :imgPath, localAudioPath = :audioPath WHERE id = :iconId")
    void updateLocalPaths(String iconId, String imgPath, String audioPath);

    @Query("DELETE FROM icons WHERE boardId = :boardId")
    void deleteIconsForBoard(String boardId);
}
