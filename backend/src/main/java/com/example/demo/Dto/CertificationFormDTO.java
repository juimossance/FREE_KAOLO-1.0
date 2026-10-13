package com.example.demo.Dto;

import com.example.demo.Enum.CertType;
import jakarta.persistence.EnumType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public class CertificationFormDTO {

    @NotNull(message = "Le type est obligatoire")
    private CertType type = CertType.CERTIFICATION;

    @NotBlank(message = "Le nom est obligatoire")
    private String nom;

    @NotBlank(message = "L'organisme est obligatoire")
    private String organisme;

    // Optionnel : un diplôme n'a pas toujours de numéro
    private String credentialId;

    @NotBlank(message = "La catégorie est obligatoire")
    private String categorie;

    @NotNull(message = "La date d'obtention est obligatoire")
    private LocalDate dateObtention;

    private LocalDate dateExpiration;

    @NotBlank(message = "Le document justificatif est obligatoire")
    private String documentUrl;
    public CertType getType() {
        return type;
    }

    public void setType(CertType type) {
        this.type = type;
    }

    public String getNom() {
        return nom;
    }

    public void setNom(String nom) {
        this.nom = nom;
    }

    public String getOrganisme() {
        return organisme;
    }

    public void setOrganisme(String organisme) {
        this.organisme = organisme;
    }

    public String getCredentialId() {
        return credentialId;
    }

    public void setCredentialId(String credentialId) {
        this.credentialId = credentialId;
    }

    public String getCategorie() { return categorie; }
    public void setCategorie(String categorie) { this.categorie = categorie; }

    public LocalDate getDateObtention() { return dateObtention; }
    public void setDateObtention(LocalDate dateObtention) { this.dateObtention = dateObtention; }

    public LocalDate getDateExpiration() { return dateExpiration; }
    public void setDateExpiration(LocalDate dateExpiration) { this.dateExpiration = dateExpiration; }

    public String getDocumentUrl() { return documentUrl; }
    public void setDocumentUrl(String documentUrl) { this.documentUrl = documentUrl; }
}
