package com.example.demo.Dto;

import com.example.demo.entity.Competence;

import java.time.LocalDateTime;
import java.util.List;

public class Candidaturedto {

    private Long id;

    private String projetTitre;
    private Double projetBudget;
    private String status;
    private LocalDateTime date;

    private Long projetId;

    private Long freelancerId;
    private String freelancerNom;
    private String freelancerPrenom;
    private String freelancerSpecialite;
    private Double freelancerRating;
    private Integer freelancerNbAvis;
    private List<String> freelancerCompetences;

    private Double montantFinal;
    private String commentaireEntreprise;
    private String entrepriseNom;
    private LocalDateTime dateFin;
    private Integer note;

    private Long freelancerUserId;

    public Long getFreelancerUserId() {
        return freelancerUserId;
    }

    public void setFreelancerUserId(Long freelancerUserId) {
        this.freelancerUserId = freelancerUserId;
    }
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getProjetTitre() {
        return projetTitre;
    }

    public void setProjetTitre(String projetTitre) {
        this.projetTitre = projetTitre;
    }

    public Double getProjetBudget() {
        return projetBudget;
    }

    public void setProjetBudget(Double projetBudget) {
        this.projetBudget = projetBudget;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getDate() {
        return date;
    }

    public void setDate(LocalDateTime date) {
        this.date = date;
    }

    public Long getProjetId() {
        return projetId;
    }

    public void setProjetId(Long projetId) {
        this.projetId = projetId;
    }

    public Long getFreelancerId() {
        return freelancerId;
    }

    public void setFreelancerId(Long freelancerId) {
        this.freelancerId = freelancerId;
    }

    public String getFreelancerNom() {
        return freelancerNom;
    }

    public void setFreelancerNom(String freelancerNom) {
        this.freelancerNom = freelancerNom;
    }

    public String getFreelancerPrenom() {
        return freelancerPrenom;
    }

    public void setFreelancerPrenom(String freelancerPrenom) {
        this.freelancerPrenom = freelancerPrenom;
    }

    public String getFreelancerSpecialite() {
        return freelancerSpecialite;
    }

    public void setFreelancerSpecialite(String freelancerSpecialite) {
        this.freelancerSpecialite = freelancerSpecialite;
    }

    public Double getFreelancerRating() {
        return freelancerRating;
    }

    public void setFreelancerRating(Double freelancerRating) {
        this.freelancerRating = freelancerRating;
    }

    public Integer getFreelancerNbAvis() {
        return freelancerNbAvis;
    }

    public void setFreelancerNbAvis(Integer freelancerNbAvis) {
        this.freelancerNbAvis = freelancerNbAvis;
    }

    public List<String> getFreelancerCompetences() {
        return freelancerCompetences;
    }

    public void setFreelancerCompetences(List<String> freelancerCompetences) {
        this.freelancerCompetences = freelancerCompetences;
    }

    public Double getMontantFinal() {
        return montantFinal;
    }

    public void setMontantFinal(Double montantFinal) {
        this.montantFinal = montantFinal;
    }

    public String getCommentaireEntreprise() {
        return commentaireEntreprise;
    }

    public void setCommentaireEntreprise(String commentaireEntreprise) {
        this.commentaireEntreprise = commentaireEntreprise;
    }

    public String getEntrepriseNom() {
        return entrepriseNom;
    }

    public void setEntrepriseNom(String entrepriseNom) {
        this.entrepriseNom = entrepriseNom;
    }

    public LocalDateTime getDateFin() {
        return dateFin;
    }

    public void setDateFin(LocalDateTime dateFin) {
        this.dateFin = dateFin;
    }

    public Integer getNote() {
        return note;
    }

    public void setNote(Integer note) {
        this.note = note;
    }
}