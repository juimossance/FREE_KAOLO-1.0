package com.example.demo.entity;

import com.example.demo.Enum.CertStatus;
import com.example.demo.Enum.CertType;
import jakarta.persistence.*;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "certifications")
public class Certification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "freelancer_id", nullable = false)
    private Long freelancerId;

    @Column(nullable = false)
    private String nom;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CertType type = CertType.CERTIFICATION;

    @Column(nullable = false)
    private String organisme;

    @Column(name = "credential_id")
    private String credentialId;

    @Column(nullable = false)
    private String categorie;

    @Column(name = "date_obtention", nullable = false)
    private LocalDate dateObtention;

    @Column(name = "date_decision")
    private LocalDateTime dateDecision;

    @Column(length = 500)
    private String motifRejet;

    @Column(name = "date_expiration")
    private LocalDate dateExpiration;

    @Column(name = "document_url", nullable = false)
    private String documentUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CertStatus status = CertStatus.EN_ATTENTE;

    @Column(name = "date_creation", updatable = false)
    private Instant dateCreation = Instant.now();

    protected Certification() {
        // requis par JPA
    }

    public Certification(
            CertType type,
            Long freelancerId,
            String nom,
            String organisme,
            String credentialId,
            String categorie,
            LocalDate dateObtention,
            LocalDate dateExpiration,
            String documentUrl
    ) {
        this.type = type != null ? type : CertType.CERTIFICATION;
        this.freelancerId = freelancerId;
        this.nom = nom;
        this.organisme = organisme;
        this.credentialId = credentialId;
        this.categorie = categorie;
        this.dateObtention = dateObtention;
        this.dateExpiration = dateExpiration;
        this.documentUrl = documentUrl;
        this.status = CertStatus.EN_ATTENTE;
        this.dateCreation = Instant.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getFreelancerId() {
        return freelancerId;
    }

    public void setFreelancerId(Long freelancerId) {
        this.freelancerId = freelancerId;
    }

    public String getNom() {
        return nom;
    }

    public void setNom(String nom) {
        this.nom = nom;
    }

    public CertType getType() {
        return type;
    }

    public void setType(CertType type) {
        this.type = type;
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

    public String getCategorie() {
        return categorie;
    }

    public void setCategorie(String categorie) {
        this.categorie = categorie;
    }

    public LocalDate getDateObtention() {
        return dateObtention;
    }

    public void setDateObtention(LocalDate dateObtention) {
        this.dateObtention = dateObtention;
    }

    public LocalDate getDateExpiration() {
        return dateExpiration;
    }

    public void setDateExpiration(LocalDate dateExpiration) {
        this.dateExpiration = dateExpiration;
    }

    public String getDocumentUrl() {
        return documentUrl;
    }

    public void setDocumentUrl(String documentUrl) {
        this.documentUrl = documentUrl;
    }

    public CertStatus getStatus() {
        return status;
    }

    public void setStatus(CertStatus status) {
        this.status = status;
    }

    public String getMotifRejet() {
        return motifRejet;
    }

    public void setMotifRejet(String motifRejet) {
        this.motifRejet = motifRejet;
    }

    public LocalDateTime getDateDecision() {
        return dateDecision;
    }

    public void setDateDecision(LocalDateTime dateDecision) {
        this.dateDecision = dateDecision;
    }

    public Instant getDateCreation() {
        return dateCreation;
    }

    public void setDateCreation(Instant dateCreation) {
        this.dateCreation = dateCreation;
    }
}