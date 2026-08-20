package com.example.demo.Dto;

public class InitierPaiementDto {
    private Long candidatureId;
    private Double montant;
    private String methodePaiement; // Orange Money, MTN, Virement

    public Long getCandidatureId() { return candidatureId; }
    public void setCandidatureId(Long candidatureId) { this.candidatureId = candidatureId; }
    public Double getMontant() { return montant; }
    public void setMontant(Double montant) { this.montant = montant; }
    public String getMethodePaiement() { return methodePaiement; }
    public void setMethodePaiement(String methodePaiement) { this.methodePaiement = methodePaiement; }
}