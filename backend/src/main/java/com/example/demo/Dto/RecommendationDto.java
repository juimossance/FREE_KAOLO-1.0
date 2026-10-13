package com.example.demo.Dto;

import com.example.demo.entity.Competence;

import java.util.List;

public class RecommendationDto {

    private Long freelancerId;

    private Long userId;

    private String nom;

    private String prenom;

    private String photoUrl;

    private String specialite;

    private List<String> competences;

    private String ville;

    private Double tarif;

    private double note;

    private String disponibilite;

    private int scoreIA;

    private String raison;

    public List<String> getCompetences() {
        return competences;
    }

    public void setCompetences(List<String> competences) {
        this.competences = competences;
    }

    public String getDisponibilite() {
        return disponibilite;
    }

    public void setDisponibilite(String disponibilite) {
        this.disponibilite = disponibilite;
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

    public double getNote() {
        return note;
    }

    public void setNote(double note) {
        this.note = note;
    }

    public String getPhotoUrl() {
        return photoUrl;
    }

    public void setPhotoUrl(String photoUrl) {
        this.photoUrl = photoUrl;
    }

    public String getPrenom() {
        return prenom;
    }

    public void setPrenom(String prenom) {
        this.prenom = prenom;
    }

    public String getRaison() {
        return raison;
    }

    public void setRaison(String raison) {
        this.raison = raison;
    }

    public int getScoreIA() {
        return scoreIA;
    }

    public void setScoreIA(int scoreIA) {
        this.scoreIA = scoreIA;
    }

    public String getSpecialite() {
        return specialite;
    }

    public void setSpecialite(String specialite) {
        this.specialite = specialite;
    }

    public Double getTarif() {
        return tarif;
    }

    public void setTarif(Double tarif) {
        this.tarif = tarif;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getVille() {
        return ville;
    }

    public void setVille(String ville) {
        this.ville = ville;
    }


}
