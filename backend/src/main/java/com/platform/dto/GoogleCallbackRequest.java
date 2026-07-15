package com.platform.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GoogleCallbackRequest {
    private String googleId;   // Google sub / user ID
    private String email;
    private String name;
    private String picture;    // Google profile photo URL
    private String idToken;    // Google ID token for verification (optional)
}
