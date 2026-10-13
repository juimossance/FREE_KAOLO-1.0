package com.example.demo.Dto.campay;

public class CampayTransactionStatusResponse {
    private String reference;
    private String status;
    private String amount;
    private String operator;

    public String getReference() { return reference; }
    public void setReference(String reference) { this.reference = reference; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getAmount() { return amount; }
    public void setAmount(String amount) { this.amount = amount; }
    public String getOperator() { return operator; }
    public void setOperator(String operator) { this.operator = operator; }
}