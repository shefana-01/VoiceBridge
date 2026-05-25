// Copyright (c) 2026 Afsara Saima Mannan
// Licensed under the PolyForm Noncommercial License 1.0. 
// See the LICENSE.txt file in the project root for full terms.

package com.voicebridge.sync;

import android.content.Context;
import android.util.Log;

import androidx.annotation.NonNull;
import androidx.work.Constraints;
import androidx.work.ExistingPeriodicWorkPolicy;
import androidx.work.NetworkType;
import androidx.work.PeriodicWorkRequest;
import androidx.work.WorkManager;
import androidx.work.Worker;
import androidx.work.WorkerParameters;

import com.voicebridge.api.SyncManager;

import java.util.concurrent.TimeUnit;

/**
 * Periodic background sync for VoiceBridge.
 *
 * Why WorkManager (not a simple Service / AlarmManager)?
 *   - Survives reboots
 *   - Respects Doze / battery-saver
 *   - Built-in network-constraint handling (only run when online)
 *   - Single API across Android 5 → 14
 *
 * The minimum WorkManager interval is 15 minutes. We use 60 minutes —
 * caregivers rarely make changes more often than that, and longer
 * intervals are kinder to battery. Manual sync (the "Sync" button in
 * BoardListActivity) is still available for an immediate refresh.
 *
 * Use case:
 *   In your Application onCreate(), call:
 *       PeriodicSyncWorker.scheduleIfNeeded(this);
 *
 * Per-child sync target: we don't pass child_id to this worker because
 * WorkManager is global; the worker pulls every active child's boards
 * for whoever is signed in. If you want per-child throttling, pass the
 * id via WorkRequest.setInputData() and read it in doWork().
 */
public class PeriodicSyncWorker extends Worker {

    private static final String TAG = "PeriodicSyncWorker";
    private static final String UNIQUE_WORK_NAME = "voicebridge_periodic_sync";

    public PeriodicSyncWorker(@NonNull Context context,
                              @NonNull WorkerParameters params) {
        super(context, params);
    }

    @NonNull
    @Override
    public Result doWork() {
        try {
            // SyncManager is async (Retrofit enqueue), so we just kick it off
            // and let Result.success() unblock the worker. If the network
            // request itself fails, SyncManager will log it and the data
            // simply won't change — the worker doesn't need to retry the
            // entire background run.
            SyncManager mgr = new SyncManager(getApplicationContext());
            String childId = getInputData().getString("child_id");
            if (childId == null) {
                // No child selected → nothing to sync yet (caregiver hasn't
                // finished setup on this device). Treat as success.
                Log.d(TAG, "No child_id in input data — skipping this run.");
                return Result.success();
            }
            mgr.syncData(childId);
            return Result.success();
        } catch (Exception e) {
            Log.w(TAG, "Periodic sync threw", e);
            return Result.retry();
        }
    }

    /**
     * Schedule the periodic worker, replacing any existing one with the
     * same unique name. Safe to call repeatedly (it's idempotent).
     */
    public static void scheduleIfNeeded(Context context, String childId) {
        Constraints constraints = new Constraints.Builder()
                .setRequiredNetworkType(NetworkType.CONNECTED)
                .setRequiresBatteryNotLow(true)
                .build();

        androidx.work.Data input = new androidx.work.Data.Builder()
                .putString("child_id", childId)
                .build();

        PeriodicWorkRequest request = new PeriodicWorkRequest.Builder(
                PeriodicSyncWorker.class, 1, TimeUnit.HOURS)
                .setConstraints(constraints)
                .setInputData(input)
                .setBackoffCriteria(
                        androidx.work.BackoffPolicy.LINEAR,
                        15, TimeUnit.MINUTES)
                .build();

        WorkManager.getInstance(context.getApplicationContext())
                .enqueueUniquePeriodicWork(
                        UNIQUE_WORK_NAME,
                        ExistingPeriodicWorkPolicy.UPDATE,
                        request);

        Log.d(TAG, "Scheduled periodic sync for child=" + childId);
    }

    /** Call from logout / device de-link. */
    public static void cancel(Context context) {
        WorkManager.getInstance(context.getApplicationContext())
                .cancelUniqueWork(UNIQUE_WORK_NAME);
    }
}
