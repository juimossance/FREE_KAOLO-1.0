package com.example.demo.Dto.campay;

public class CampayCollectResponse {
    private String reference;
    private String external_reference;
    private String status; // PENDING, SUCCESSFUL, FAILED
    private String amount;
    private String currency;
    private String operator;
    private String code;
    private String operator_reference;

    // getters + setters
    public String getReference() { return reference; }
    public void setReference(String reference) { this.reference = reference; }
    public String getExternal_reference() { return external_reference; }
    public void setExternal_reference(String v) { this.external_reference = v; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getAmount() { return amount; }
    public void setAmount(String amount) { this.amount = amount; }
    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }
    public String getOperator() { return operator; }
    public void setOperator(String operator) { this.operator = operator; }
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public String getOperator_reference() { return operator_reference; }
    public void setOperator_reference(String v) { this.operator_reference = v; }
}
