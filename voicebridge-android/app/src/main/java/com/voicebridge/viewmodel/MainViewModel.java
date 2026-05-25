package com.voicebridge.viewmodel;

import android.app.Application;
import androidx.annotation.NonNull;
import androidx.lifecycle.AndroidViewModel;
import androidx.lifecycle.LiveData;

import com.voicebridge.models.Board;
import com.voicebridge.models.Icon;
import com.voicebridge.repository.BoardRepository;

import java.util.List;

public class MainViewModel extends AndroidViewModel {
    private final BoardRepository repository;
    private final LiveData<List<Board>> activeBoards;

    public MainViewModel(@NonNull Application application) {
        super(application);
        repository = new BoardRepository(application);
        activeBoards = repository.getActiveBoards();
    }

    public LiveData<List<Board>> getActiveBoards() {
        return activeBoards;
    }

    public LiveData<List<Icon>> getIconsForBoard(String boardId) {
        return repository.getIconsForBoard(boardId);
    }
}
