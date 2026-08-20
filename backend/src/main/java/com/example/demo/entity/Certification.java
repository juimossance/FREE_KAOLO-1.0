package com.example.demo.entity;


import com.example.demo.Enum.CertStatus;
import jakarta.persistence.*;

import java.time.Instant;
import java.time.LocalDate;

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

    @Column(nullable = false)
    private String organisme;

    @Column(name = "credential_id", nullable = false)
    private String credentialId;

    @Column(nullable = false)
    private String categorie;

    @Column(name = "date_obtention", nullable = false)
    private LocalDate dateObtention;

    @Column(name = "date_expiration")
    private LocalDate dateExpiration;

    @Column(name = "document_url", nullable = false)
    private String documentUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CertStatus status = CertStatus.EN_ATTENTE;

    // Renseigné par l'équipe de vérification lorsque status = REJETEE
    @Column(name = "motif_rejet")
    private String motifRejet;

    @Column(name = "date_creation", updatable = false)
    private Instant dateCreation = Instant.now();

    protected Certification() {
        // requis par JPA
    }

    public Certification(Long freelancerId, String nom, String organisme, String credentialId,
                         String categorie, LocalDate dateObtention, LocalDate dateExpiration,
                         String documentUrl) {
        this.freelancerId = freelancerId;
        this.nom = nom;
        this.organisme = organisme;
        this.credentialId = credentialId;
        this.categorie = categorie;
        this.dateObtention = dateObtention;
        this.dateExpiration = dateExpiration;
        this.documentUrl = documentUrl;
        this.status = CertStatus.EN_ATTENTE;
    }

    public Long getId() { return id; }

    public Long getFreelancerId() { return freelancerId; }

    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }

    public String getOrganisme() { return organisme; }
    public void setOrganisme(String organisme) { this.organisme = organisme; }

    public String getCredentialId() { return credentialId; }
    public void setCredentialId(String credentialId) { this.credentialId = credentialId; }

    public String getCategorie() { return categorie; }
    public void setCategorie(String categorie) { this.categorie = categorie; }

    public LocalDate getDateObtention() { return dateObtention; }
    public void setDateObtention(LocalDate dateObtention) { this.dateObtention = dateObtention; }

    public LocalDate getDateExpiration() { return dateExpiration; }
    public void setDateExpiration(LocalDate dateExpiration) { this.dateExpiration = dateExpiration; }

    public String getDocumentUrl() { return documentUrl; }
    public void setDocumentUrl(String documentUrl) { this.documentUrl = documentUrl; }

    public CertStatus getStatus() { return status; }
    public void setStatus(CertStatus status) { this.status = status; }

    public String getMotifRejet() { return motifRejet; }
    public void setMotifRejet(String motifRejet) { this.motifRejet = motifRejet; }

    public Instant getDateCreation() { return dateCreation; }
}
