// Copyright (c) 2026 Afsara Saima Mannan
// Licensed under the PolyForm Noncommercial License 1.0. 
// See the LICENSE.txt file in the project root for full terms.

package com.voicebridge.api;

import android.content.Context;
import android.content.SharedPreferences;
import androidx.annotation.Nullable;
import androidx.security.crypto.EncryptedSharedPreferences;
import androidx.security.crypto.MasterKey;

public class TokenStore {
    private static final String PREF_NAME = "vb_secure_prefs";
    private static final String KEY_ACCESS  = "access";
    private static final String KEY_REFRESH = "refresh";
    private static final String KEY_BASE_URL = "base_url";
    private final SharedPreferences prefs;

    public TokenStore(Context context) {
        SharedPreferences p;
        try {
            MasterKey master = new MasterKey.Builder(context)
                .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
                .build();
            p = EncryptedSharedPreferences.create(
                    context, PREF_NAME, master,
                    EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
                    EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM);
        } catch (Exception e) {
            p = context.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE);
        }
        this.prefs = p;
    }

    public void saveTokens(String access, String refresh) {
        prefs.edit().putString(KEY_ACCESS, access).putString(KEY_REFRESH, refresh).apply();
    }

    public void clear() {
        prefs.edit().remove(KEY_ACCESS).remove(KEY_REFRESH).apply();
    }

    @Nullable public String getAccess()  { return prefs.getString(KEY_ACCESS,  null); }
    public boolean isLoggedIn() { return getAccess() != null; }

    public String getBaseUrl() {
        return prefs.getString(KEY_BASE_URL, "http://192.168.72.19:8000/");
    }
    public void setBaseUrl(String url) {
        if (!url.endsWith("/")) url += "/";
        prefs.edit().putString(KEY_BASE_URL, url).apply();
    }
}
