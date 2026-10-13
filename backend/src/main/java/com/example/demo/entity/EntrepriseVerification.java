package com.example.demo.entity;

import com.example.demo.Enum.VerificationStatus;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "entreprise_verifications")
public class EntrepriseVerification {


        @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;

        @Column(name = "entreprise_id", nullable = false)
        private Long entrepriseId;

        @Column(nullable = false) private String raisonSociale;
        @Column(nullable = false) private String registreCommerce;
        private String numeroFiscal;
        @Column(nullable = false) private String documentUrl;

        @Enumerated(EnumType.STRING) @Column(nullable = false)
        private VerificationStatus status = VerificationStatus.EN_ATTENTE;

        @Column(length = 500) private String motifRejet;
        @Column(nullable = false, updatable = false)
        private LocalDateTime dateSoumission = LocalDateTime.now();
        private LocalDateTime dateDecision;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getEntrepriseId() {
        return entrepriseId;
    }

    public void setEntrepriseId(Long entrepriseId) {
        this.entrepriseId = entrepriseId;
    }

    public String getRaisonSociale() {
        return raisonSociale;
    }

    public void setRaisonSociale(String raisonSociale) {
        this.raisonSociale = raisonSociale;
    }

    public String getRegistreCommerce() {
        return registreCommerce;
    }

    public void setRegistreCommerce(String registreCommerce) {
        this.registreCommerce = registreCommerce;
    }

    public String getNumeroFiscal() {
        return numeroFiscal;
    }

    public void setNumeroFiscal(String numeroFiscal) {
        this.numeroFiscal = numeroFiscal;
    }

    public String getDocumentUrl() {
        return documentUrl;
    }

    public void setDocumentUrl(String documentUrl) {
        this.documentUrl = documentUrl;
    }

    public VerificationStatus getStatus() {
        return status;
    }

    public void setStatus(VerificationStatus status) {
        this.status = status;
    }

    public String getMotifRejet() {
        return motifRejet;
    }

    public void setMotifRejet(String motifRejet) {
        this.motifRejet = motifRejet;
    }

    public LocalDateTime getDateSoumission() {
        return dateSoumission;
    }

    public void setDateSoumission(LocalDateTime dateSoumission) {
        this.dateSoumission = dateSoumission;
    }

    public LocalDateTime getDateDecision() {
        return dateDecision;
    }

    public void setDateDecision(LocalDateTime dateDecision) {
        this.dateDecision = dateDecision;
    }

}