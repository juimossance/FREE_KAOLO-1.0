package com.example.demo.Dto;



import java.util.List;

public class FreelancerPublicDTO {

    private Long id;
    private String nom;
    private String prenom;
    private String specialite;
    private String ville;
    private String pays;
    private Double tarifJournalier;
    private String disponibilite;
    private String photoUrl;
    private double noteMoyenne;
    private int nombreAvis;
    private List<String> competences;

    public FreelancerPublicDTO() {}

    public FreelancerPublicDTO(Long id, String nom, String prenom, String specialite,
                               String ville, String pays, Double tarifJournalier,
                               String disponibilite, String photoUrl,
                               double noteMoyenne, int nombreAvis,
                               List<String> competences) {
        this.id = id;
        this.nom = nom;
        this.prenom = prenom;
        this.specialite = specialite;
        this.ville = ville;
        this.pays = pays;
        this.tarifJournalier = tarifJournalier;
        this.disponibilite = disponibilite;
        this.photoUrl = photoUrl;
        this.noteMoyenne = noteMoyenne;
        this.nombreAvis = nombreAvis;
        this.competences = competences;
    }

    // --- Getters / Setters ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }

    public String getPrenom() { return prenom; }
    public void setPrenom(String prenom) { this.prenom = prenom; }

    public String getSpecialite() { return specialite; }
    public void setSpecialite(String specialite) { this.specialite = specialite; }

    public String getVille() { return ville; }
    public void setVille(String ville) { this.ville = ville; }

    public String getPays() { return pays; }
    public void setPays(String pays) { this.pays = pays; }

    public Double getTarifJournalier() { return tarifJournalier; }
    public void setTarifJournalier(Double tarifJournalier) { this.tarifJournalier = tarifJournalier; }

    public String getDisponibilite() { return disponibilite; }
    public void setDisponibilite(String disponibilite) { this.disponibilite = disponibilite; }

    public String getPhotoUrl() { return photoUrl; }
    public void setPhotoUrl(String photoUrl) { this.photoUrl = photoUrl; }

    public double getNoteMoyenne() { return noteMoyenne; }
    public void setNoteMoyenne(double noteMoyenne) { this.noteMoyenne = noteMoyenne; }

    public int getNombreAvis() { return nombreAvis; }
    public void setNombreAvis(int nombreAvis) { this.nombreAvis = nombreAvis; }

    public List<String> getCompetences() { return competences; }
    public void setCompetences(List<String> competences) { this.competences = competences; }
}