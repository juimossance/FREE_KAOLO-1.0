package com.example.demo.Dto;


import java.time.LocalDateTime;
import java.util.List;

public class ProjetDto {
    private Long id;
    private String titre;
    private String categorie;
    private String description;
    private String livrables;
    private Double budget;

    private String typeBudget;
    private String deadline;
    private String duree;
    private String experience;
    private String visibilite;
    private String lieu;
    private boolean urgent;
    private String statut;
    private int vues;
    private int nombreCandidatures;
    private LocalDateTime datePublication;
    private List<String> competences;
    private Long entrepriseId;
    private String entrepriseNom;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitre() { return titre; }
    public void setTitre(String titre) { this.titre = titre; }
    public String getCategorie() { return categorie; }
    public void setCategorie(String categorie) { this.categorie = categorie; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getLivrables() { return livrables; }
    public void setLivrables(String livrables) { this.livrables = livrables; }
    public Double getBudget() { return budget; }
    public void setBudget(Double budget) { this.budget = budget; }

    public void setTypeBudget(String typeBudget) { this.typeBudget = typeBudget; }
    public String getDeadline() { return deadline; }
    public void setDeadline(String deadline) { this.deadline = deadline; }
    public String getDuree() { return duree; }
    public void setDuree(String duree) { this.duree = duree; }
    public String getExperience() { return experience; }
    public void setExperience(String experience) { this.experience = experience; }
    public String getVisibilite() { return visibilite; }
    public void setVisibilite(String visibilite) { this.visibilite = visibilite; }
    public String getLieu() { return lieu; }
    public void setLieu(String lieu) { this.lieu = lieu; }
    public boolean isUrgent() { return urgent; }
    public void setUrgent(boolean urgent) { this.urgent = urgent; }
    public String getStatut() { return statut; }
    public void setStatut(String statut) { this.statut = statut; }
    public int getVues() { return vues; }
    public void setVues(int vues) { this.vues = vues; }
    public int getNombreCandidatures() { return nombreCandidatures; }
    public void setNombreCandidatures(int nombreCandidatures) { this.nombreCandidatures = nombreCandidatures; }
    public LocalDateTime getDatePublication() { return datePublication; }
    public void setDatePublication(LocalDateTime datePublication) { this.datePublication = datePublication; }
    public List<String> getCompetences() { return competences; }
    public void setCompetences(List<String> competences) { this.competences = competences; }
    public Long getEntrepriseId() { return entrepriseId; }
    public void setEntrepriseId(Long entrepriseId) { this.entrepriseId = entrepriseId; }
    public String getEntrepriseNom() { return entrepriseNom; }
    public void setEntrepriseNom(String entrepriseNom) { this.entrepriseNom = entrepriseNom; }

    public String getTypeBudget() {
        return typeBudget;
    }
}
