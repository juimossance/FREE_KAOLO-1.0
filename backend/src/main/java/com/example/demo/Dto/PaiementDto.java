package com.example.demo.Dto;

import java.time.LocalDateTime;

public class PaiementDto {
    private Long id;
    private Double montant;
    private String statut;
    private String methodePaiement;
    private String referenceExterne;
    private LocalDateTime datePaiement;
    private LocalDateTime dateLiberation;
    private Long candidatureId;
    private String freelancerNom;
    private String entrepriseNom;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Double getMontant() { return montant; }
    public void setMontant(Double montant) { this.montant = montant; }
    public String getStatut() { return statut; }
    public void setStatut(String statut) { this.statut = statut; }
    public String getMethodePaiement() { return methodePaiement; }
    public void setMethodePaiement(String methodePaiement) { this.methodePaiement = methodePaiement; }
    public String getReferenceExterne() { return referenceExterne; }
    public void setReferenceExterne(String referenceExterne) { this.referenceExterne = referenceExterne; }
    public LocalDateTime getDatePaiement() { return datePaiement; }
    public void setDatePaiement(LocalDateTime datePaiement) { this.datePaiement = datePaiement; }
    public LocalDateTime getDateLiberation() { return dateLiberation; }
    public void setDateLiberation(LocalDateTime dateLiberation) { this.dateLiberation = dateLiberation; }
    public Long getCandidatureId() { return candidatureId; }
    public void setCandidatureId(Long candidatureId) { this.candidatureId = candidatureId; }
    public String getFreelancerNom() { return freelancerNom; }
    public void setFreelancerNom(String freelancerNom) { this.freelancerNom = freelancerNom; }
    public String getEntrepriseNom() { return entrepriseNom; }
    public void setEntrepriseNom(String entrepriseNom) { this.entrepriseNom = entrepriseNom; }
}