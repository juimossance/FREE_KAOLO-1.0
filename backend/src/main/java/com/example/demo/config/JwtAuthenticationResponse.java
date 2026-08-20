package com.example.demo.config;

public class JwtAuthenticationResponse {
    public String getAccessToken() {
        return accessToken;
    }

    public void setAccessToken(String accessToken) {
        this.accessToken = accessToken;
    }

    private String accessToken;

    public String getTokenType() {
        return tokenType;
    }

    public void setTokenType(String tokenType) {
        this.tokenType = tokenType;
    }

    private String tokenType = "Bearer";
    public JwtAuthenticationResponse(String accessToken){
        this.accessToken=accessToken;
    }


}
