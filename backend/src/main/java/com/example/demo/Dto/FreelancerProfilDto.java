package com.example.demo.Dto;

import java.util.List;

public class FreelancerProfilDto {
    private Long id;
    private String nom;
    private String prenom;
    private String email;
    private String phone;
    private String specialite;
    private String experience;
    private String description;
    private String bio;
    private String pays;
    private String ville;
    private Double tarifJournalier;
    private String disponibilite;
    private String github;
    private String linkedin;
    private String siteweb;
    private String langues;
    private String photoUrl;
    private List<String> competence;
    private int completionPourcentage;


    private boolean certifie;


    // Getters & Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }
    public String getPrenom() { return prenom; }
    public void setPrenom(String prenom) { this.prenom = prenom; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getSpecialite() { return specialite; }
    public void setSpecialite(String specialite) { this.specialite = specialite; }
    public String getExperience() { return experience; }
    public void setExperience(String experience) { this.experience = experience; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }
    public String getPays() { return pays; }
    public void setPays(String pays) { this.pays = pays; }
    public String getVille() { return ville; }
    public void setVille(String ville) { this.ville = ville; }
    public Double getTarifJournalier() { return tarifJournalier; }
    public void setTarifJournalier(Double tarifJournalier) { this.tarifJournalier = tarifJournalier; }
    public String getDisponibilite() { return disponibilite; }
    public void setDisponibilite(String disponibilite) { this.disponibilite = disponibilite; }
    public String getGithub() { return github; }
    public void setGithub(String github) { this.github = github; }
    public String getLinkedin() { return linkedin; }
    public void setLinkedin(String linkedin) { this.linkedin = linkedin; }
    public String getSiteweb() { return siteweb; }
    public void setSiteweb(String siteweb) { this.siteweb = siteweb; }
    public String getLangues() { return langues; }
    public void setLangues(String langues) { this.langues = langues; }
    public String getPhotoUrl() { return photoUrl; }
    public void setPhotoUrl(String photoUrl) { this.photoUrl = photoUrl; }
    public List<String> getCompetence() { return competence; }
    public void setCompetence(List<String> competence) { this.competence = competence; }
    public int getCompletionPourcentage() { return completionPourcentage; }
    public void setCompletionPourcentage(int completionPourcentage) { this.completionPourcentage = completionPourcentage; }
    public boolean isCertifie() { return certifie; }
    public void setCertifie(boolean certifie) { this.certifie = certifie; }
}