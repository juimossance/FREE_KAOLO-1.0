package com.example.demo.Dto;



import com.example.demo.Enum.CertStatus;
import com.example.demo.Enum.CertType;
import com.example.demo.entity.Certification;

import java.time.LocalDate;

public class CertificationDTO {

    private Long id;
    private String nom;
    private String organisme;
    private String credentialId;
    private String categorie;
    private LocalDate dateObtention;
    private LocalDate dateExpiration;
    private String documentUrl;
    private CertStatus status;
    private String motifRejet;

    private CertType type ;
    public CertificationDTO() {
    }

    public static CertificationDTO from(Certification entity) {
        CertificationDTO dto = new CertificationDTO();
        dto.id = entity.getId();
        dto.nom = entity.getNom();
        dto.organisme = entity.getOrganisme();
        dto.credentialId = entity.getCredentialId();
        dto.categorie = entity.getCategorie();
        dto.dateObtention = entity.getDateObtention();
        dto.dateExpiration = entity.getDateExpiration();
        dto.documentUrl = entity.getDocumentUrl();
        dto.status = entity.getStatus();
        dto.motifRejet = entity.getMotifRejet();
        dto.type=entity.getType();
        return dto;
    }

    public CertType getType() {
        return type;
    }

    public void setType(CertType type) {
        this.type = type;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

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
}
