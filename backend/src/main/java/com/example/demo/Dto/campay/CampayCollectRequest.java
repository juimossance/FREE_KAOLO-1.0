package com.example.demo.Dto.campay;

public class CampayCollectRequest {
    private String amount;
    private String currency = "XAF";
    private String from; // format 2376XXXXXXXX
    private String description;
    private String external_reference;

    public CampayCollectRequest(String amount, String from, String description, String externalReference) {
        this.amount = amount;
        this.from = from;
        this.description = description;
        this.external_reference = externalReference;
    }

    public String getAmount() { return amount; }
    public String getCurrency() { return currency; }
    public String getFrom() { return from; }
    public String getDescription() { return description; }
    public String getExternal_reference() { return external_reference; }
    public record CampayTokenResponse(String token) {}
}


