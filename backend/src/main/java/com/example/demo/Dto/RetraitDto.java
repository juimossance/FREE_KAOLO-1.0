package com.example.demo.Dto;

import java.time.LocalDateTime;

public class RetraitDto {
    private Double montant;
    private String methode;
    private String telephone;

    public Double getMontant() { return montant; }
    public void setMontant(Double montant) { this.montant = montant; }
    public String getMethode() { return methode; }
    public void setMethode(String methode) { this.methode = methode; }
    public String getTelephone() { return telephone; }
    public void setTelephone(String telephone) { this.telephone = telephone; }
}