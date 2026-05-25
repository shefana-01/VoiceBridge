package com.voicebridge.repository;

import android.app.Application;
import androidx.lifecycle.LiveData;
import com.voicebridge.db.AppDatabase;
import com.voicebridge.db.IconDao;
import com.voicebridge.models.Board;
import com.voicebridge.models.Icon;
import java.util.List;

public class BoardRepository {
    private IconDao iconDao;
    private LiveData<List<Board>> allActiveBoards;

    public BoardRepository(Application application) {
        AppDatabase db = AppDatabase.getDatabase(application);
        iconDao = db.iconDao();
        allActiveBoards = iconDao.getActiveBoards();
    }

    public LiveData<List<Board>> getActiveBoards() {
        return allActiveBoards;
    }

    public LiveData<List<Icon>> getIconsForBoard(String boardId) {
        return iconDao.getIconsForBoard(boardId);
    }
}
