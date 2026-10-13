package com.example.demo.Dto.campay;

public class CampayWithdrawRequest {
    private String amount;
    private String to; // format 2376XXXXXXXX
    private String description;
    private String external_reference;

    public CampayWithdrawRequest(String amount, String to, String description, String externalReference) {
        this.amount = amount;
        this.to = to;
        this.description = description;
        this.external_reference = externalReference;
    }

    public String getAmount() { return amount; }
    public String getTo() { return to; }
    public String getDescription() { return description; }
    public String getExternal_reference() { return external_reference; }
}