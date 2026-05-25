package com.voicebridge;

import android.app.Application;
import android.content.SharedPreferences;
import com.voicebridge.sync.PeriodicSyncWorker;

/**
 * Custom Application subclass for VoiceBridge.
 *
 * Bootstraps the WorkManager background sync scheduler at startup if the caregiver
 * has already logged in and linked a child profile on this device.
 */
public class VoiceBridgeApp extends Application {

    @Override
    public void onCreate() {
        super.onCreate();

        SharedPreferences childPrefs = getSharedPreferences("vb_child_prefs", MODE_PRIVATE);
        String childId = childPrefs.getString("child_id", null);
        if (childId != null) {
            PeriodicSyncWorker.scheduleIfNeeded(this, childId);
        }
    }
}
