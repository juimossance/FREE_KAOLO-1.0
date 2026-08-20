package com.example.demo.Dto;

import java.time.LocalDateTime;

public class TransactionDto {
    private Long id;
    private String type;
    private String label;
    private Double montant;
    private LocalDateTime date;
    private String methode;
    private String statut;
    private String facture;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getLabel() { return label; }
    public void setLabel(String label) { this.label = label; }
    public Double getMontant() { return montant; }
    public void setMontant(Double montant) { this.montant = montant; }
    public LocalDateTime getDate() { return date; }
    public void setDate(LocalDateTime date) { this.date = date; }
    public String getMethode() { return methode; }
    public void setMethode(String methode) { this.methode = methode; }
    public String getStatut() { return statut; }
    public void setStatut(String statut) { this.statut = statut; }
    public String getFacture() { return facture; }
    public void setFacture(String facture) { this.facture = facture; }
}