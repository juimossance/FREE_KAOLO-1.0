package com.example.demo.entity;


import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "cv")
public class Cv {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Lob
    @Column(name = "cv_data", columnDefinition = "LONGBLOB")
    private byte[] cvData;

    @Column(name = "file_name")
    private String cvFileName;

    @Column(name = "content_type")
    private String cvcontentType;

    @Column(name = "uploaded_at")
    private LocalDateTime cvuploadedAt;

    /**
     * Brouillon de CV optimisé par l'IA.
     * Contient le JSON sérialisé du AtsCvDto.
     */
    @Lob
    @Column(name = "ats_cv_draft", columnDefinition = "LONGTEXT")
    private String atsCvDraft;

    @Column(name = "ats_cv_draft_updated_at")
    private LocalDateTime atsCvDraftUpdatedAt;

    /**
     * Un CV appartient à un seul freelancer.
     */
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "freelancer_id", nullable = false, unique = true)
    private Freelancer freelancer;
    public Cv() {
    }

    public Cv(Freelancer freelancer) {
        this.freelancer = freelancer;
    }

    // --- Getters / Setters ---

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public byte[] getCvData() {
        return cvData;
    }

    public void setCvData(byte[] cvData) {
        this.cvData = cvData;
    }

    public String getCvFileName() {
        return cvFileName;
    }

    public void setCvFileName(String cvFileName) {
        this.cvFileName = cvFileName;
    }

    public String getCvcontentType() {
        return cvcontentType;
    }

    public void setCvcontentType(String cvcontentType) {
        this.cvcontentType = cvcontentType;
    }

    public LocalDateTime getCvuploadedAt() {
        return cvuploadedAt;
    }

    public void setCvuploadedAt(LocalDateTime cvuploadedAt) {
        this.cvuploadedAt = cvuploadedAt;
    }

    public String getAtsCvDraft() {
        return atsCvDraft;
    }

    public void setAtsCvDraft(String atsCvDraft) {
        this.atsCvDraft = atsCvDraft;
    }

    public LocalDateTime getAtsCvDraftUpdatedAt() {
        return atsCvDraftUpdatedAt;
    }

    public void setAtsCvDraftUpdatedAt(LocalDateTime atsCvDraftUpdatedAt) {
        this.atsCvDraftUpdatedAt = atsCvDraftUpdatedAt;
    }

    public Freelancer getFreelancer() {
        return freelancer;
    }

    public void setFreelancer(Freelancer freelancer) {
        this.freelancer = freelancer;
    }
}
