package com.example.demo.entity;



import com.example.demo.Enum.StatutCompetence;
import jakarta.persistence.*;

@Entity
@Table(name = "competence", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"freelance_id", "categorie_id"})
})
public class Competence {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
private String nom;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "freelance_id", nullable = false)
    private Freelancer freelance;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "categorie_id", nullable = false)
    private Categorie categorie;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatutCompetence statut;

    public Competence() {
    }

    public Competence(Freelancer freelance, Categorie categorie) {
        this.freelance = freelance;
        this.categorie = categorie;
        this.statut = StatutCompetence.DECLAREE; // statut par défaut à l'ajout
    }

    // --- Getters / Setters ---

    public String getNom() {
        return nom;
    }

    public void setNom(String nom) {
        this.nom = nom;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Freelancer getFreelance() { return freelance; }
    public void setFreelance(Freelancer freelance) { this.freelance = freelance; }

    public Categorie getCategorie() { return categorie; }
    public void setCategorie(Categorie categorie) { this.categorie = categorie; }

    public StatutCompetence getStatut() { return statut; }
    public void setStatut(StatutCompetence statut) { this.statut = statut; }
}
