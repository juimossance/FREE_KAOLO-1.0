package com.example.demo.Dto.campay;



public class CamPayWebhookPayload {

    private String reference;
    private String status;
    private String externalReference;
    private String amount;
    private String operator;

    public String getReference() { return reference; }
    public void setReference(String reference) { this.reference = reference; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getExternalReference() { return externalReference; }
    public void setExternalReference(String externalReference) { this.externalReference = externalReference; }

    public String getAmount() { return amount; }
    public void setAmount(String amount) { this.amount = amount; }

    public String getOperator() { return operator; }
    public void setOperator(String operator) { this.operator = operator; }
}
