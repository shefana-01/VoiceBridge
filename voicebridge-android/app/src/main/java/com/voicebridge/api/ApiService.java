// Copyright (c) 2026 Afsara Saima Mannan
// Licensed under the PolyForm Noncommercial License 1.0. 
// See the LICENSE.txt file in the project root for full terms.

package com.voicebridge.api;

import com.voicebridge.models.Board;
import com.voicebridge.models.Icon;

import java.util.List;
import java.util.Map;

import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.GET;
import retrofit2.http.Header;
import retrofit2.http.POST;
import retrofit2.http.Query;

public interface ApiService {

    /**
     * Called once at login time to get a JWT access + refresh token pair.
     * Body: {"username": "...", "password": "..."}
     */
    @POST("api/v1/auth/login/")
    Call<Map<String, String>> login(@Body Map<String, String> credentials);

    /**
     * Bulk sync endpoint — returns all active boards for a child, with icons embedded.
     * Pass modified_since to only download what changed since last sync.
     * Authorization header: "Bearer <access_token>"
     */
    @GET("api/v1/boards/sync/")
    Call<SyncResponse> syncBoards(
        @Header("Authorization") String bearerToken,
        @Query("child") String childId,
        @Query("modified_since") String modifiedSince   // null = full sync
    );
}
