// Copyright (c) 2026 Afsara Saima Mannan
// Licensed under the PolyForm Noncommercial License 1.0. 
// See the LICENSE.txt file in the project root for full terms.

package com.voicebridge;

import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import com.voicebridge.sync.PeriodicSyncWorker;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.voicebridge.api.ApiService;
import com.voicebridge.api.TokenStore;

import java.util.HashMap;
import java.util.Map;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;

/**
 * One-time device setup screen for the caregiver.
 * After successful login, the caregiver enters the child's UUID,
 * the app syncs and then locks into child-only mode.
 * The child never sees this screen again.
 */
public class LoginActivity extends AppCompatActivity {

    private static final String PREF_CHILD = "vb_child_prefs";
    private static final String KEY_CHILD_ID = "child_id";

    private TokenStore tokenStore;
    private EditText urlInput, userInput, passInput, childIdInput;
    private Button btnSync;
    private ProgressBar progressBar;
    private TextView tvStatus;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_login);

        tokenStore = new TokenStore(this);

        // If already set up, go straight to the child's board
        SharedPreferences childPrefs = getSharedPreferences(PREF_CHILD, MODE_PRIVATE);
        if (tokenStore.isLoggedIn() && childPrefs.contains(KEY_CHILD_ID)) {
            launchChildApp(childPrefs.getString(KEY_CHILD_ID, null));
            return;
        }

        urlInput    = findViewById(R.id.input_server_url);
        userInput   = findViewById(R.id.input_username);
        passInput   = findViewById(R.id.input_password);
        childIdInput = findViewById(R.id.input_child_id);
        btnSync     = findViewById(R.id.btn_login);
        progressBar = findViewById(R.id.progress_bar);
        tvStatus    = findViewById(R.id.tv_status);

        urlInput.setText(tokenStore.getBaseUrl());

        btnSync.setOnClickListener(v -> performLogin());
    }

    private void performLogin() {
        String url      = urlInput.getText().toString().trim();
        String username = userInput.getText().toString().trim();
        String password = passInput.getText().toString().trim();
        String childId  = childIdInput.getText().toString().trim();

        if (username.isEmpty() || password.isEmpty() || childId.isEmpty()) {
            Toast.makeText(this, "Please fill all fields", Toast.LENGTH_SHORT).show();
            return;
        }

        if (!url.isEmpty()) tokenStore.setBaseUrl(url);

        setLoading(true, "Connecting to server…");

        Retrofit retrofit = new Retrofit.Builder()
                .baseUrl(tokenStore.getBaseUrl())
                .addConverterFactory(GsonConverterFactory.create())
                .build();

        ApiService api = retrofit.create(ApiService.class);

        Map<String, String> credentials = new HashMap<>();
        credentials.put("username", username);
        credentials.put("password", password);

        api.login(credentials).enqueue(new Callback<Map<String, String>>() {
            @Override
            public void onResponse(Call<Map<String, String>> call,
                                   Response<Map<String, String>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    Map<String, String> tokens = response.body();
                    tokenStore.saveTokens(
                            tokens.getOrDefault("access", ""),
                            tokens.getOrDefault("refresh", "")
                    );

                    // Save child ID for all future launches
                    getSharedPreferences(PREF_CHILD, MODE_PRIVATE)
                            .edit().putString(KEY_CHILD_ID, childId).apply();

                    // Start periodic sync background worker immediately
                    PeriodicSyncWorker.scheduleIfNeeded(LoginActivity.this, childId);

                    setLoading(false, "");
                    Toast.makeText(LoginActivity.this,
                            "Setup complete! Entering child mode…", Toast.LENGTH_SHORT).show();
                    launchChildApp(childId);
                } else {
                    setLoading(false, "");
                    Toast.makeText(LoginActivity.this,
                            "Login failed — check username and password",
                            Toast.LENGTH_LONG).show();
                }
            }

            @Override
            public void onFailure(Call<Map<String, String>> call, Throwable t) {
                setLoading(false, "");
                Toast.makeText(LoginActivity.this,
                        "Cannot reach server. Check the URL.",
                        Toast.LENGTH_LONG).show();
            }
        });
    }

    private void launchChildApp(String childId) {
        Intent intent = new Intent(this, BoardSelectorActivity.class);
        intent.putExtra("child_id", childId);
        startActivity(intent);
        finish();
    }

    private void setLoading(boolean loading, String message) {
        progressBar.setVisibility(loading ? View.VISIBLE : View.GONE);
        btnSync.setEnabled(!loading);
        tvStatus.setText(message);
    }
}
