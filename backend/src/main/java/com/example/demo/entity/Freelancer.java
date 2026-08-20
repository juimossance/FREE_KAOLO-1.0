package com.example.demo.entity;

import jakarta.persistence.*;

import java.util.List;

@Entity
public class Freelancer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nom;
    private String prenom;
    private String specialite;      // métier principal affiché sur le profil
    private String Experience;

    private String pays;
    private String ville;

    @OneToOne
    @JoinColumn(name = "user_id") // clé étrangère
    private User user;

    // profil
    private String description;
    private Double tarifJournalier;
    private String disponibilite;
    private String github;
    private String linkedin;
    private String siteweb;
    private String langues;
    private String photoUrl;

    @Column(nullable = false)
    private double note = 0;

    @Column(nullable = false)
    private double noteMoyenne = 0.0;

    @Column(nullable = false)
    private int nombreAvis = 0;

    @Column(nullable = false)
    private int vues = 0;

    // Source de vérité unique pour les compétences : statut vérifié/déclaré,
    // lien vers les tentatives de quiz. Remplace l'ancienne List<String> competence.
    @OneToMany(mappedBy = "freelance", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Competence> competence;

    // Texte généré automatiquement (specialite + noms des competences + description)
    // utilisé par le moteur de matching TF-IDF. Ne pas saisir manuellement,
    // le régénérer via un service à chaque modification de profil/compétence.
    @Column(length = 2000)
    private String bioEtCompetences;

    @OneToMany(mappedBy = "freelance", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<TentativeQuiz> tentativesQuiz;

    // Pourcentage de complétude du profil, de 0 à 100 (converti en 0.0-1.0
    // uniquement au moment du calcul du score composite dans MatchingEngine)
    @Column(nullable = false)
    private int completudeProfil = 0;

    public Freelancer() {
    }

    public Freelancer(User user) {
        this.user = user;
        this.completudeProfil = 0;
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

    public String getExperience() { return Experience; }
    public void setExperience(String Experience) { this.Experience = Experience; }

    public String getPays() { return pays; }
    public void setPays(String pays) { this.pays = pays; }

    public String getVille() { return ville; }
    public void setVille(String ville) { this.ville = ville; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

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

    public double getNote() { return note; }
    public void setNote(double note) { this.note = note; }

    public double getNoteMoyenne() { return noteMoyenne; }
    public void setNoteMoyenne(double noteMoyenne) { this.noteMoyenne = noteMoyenne; }

    public int getNombreAvis() { return nombreAvis; }
    public void setNombreAvis(int nombreAvis) { this.nombreAvis = nombreAvis; }

    public int getVues() { return vues; }
    public void setVues(int vues) { this.vues = vues; }

    public List<Competence> getCompetence() { return competence; }
    public void setCompetence(List<Competence> competence) { this.competence = competence; }

    public String getBioEtCompetences() { return bioEtCompetences; }
    public void setBioEtCompetences(String bioEtCompetences) { this.bioEtCompetences = bioEtCompetences; }

    public List<TentativeQuiz> getTentativesQuiz() { return tentativesQuiz; }
    public void setTentativesQuiz(List<TentativeQuiz> tentativesQuiz) { this.tentativesQuiz = tentativesQuiz; }

    public int getCompletudeProfil() { return completudeProfil; }
    public void setCompletudeProfil(int completudeProfil) { this.completudeProfil = completudeProfil; }
}