package com.example.demo.entity;



import com.example.demo.Enum.StatutTentative;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "tentative_quiz")
public class TentativeQuiz {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "freelance_id", nullable = false)
    private Freelancer freelance;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "categorie_id", nullable = false)
    private Categorie categorie;

    @Column
    private Double score; // sur 100, rempli seulement une fois le quiz corrigé

    @Column(nullable = false)
    private LocalDateTime dateDebut;

    @Column
    private LocalDateTime dateSoumission;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatutTentative statutTentative;

    @Column(nullable = false)
    private int nombreViolations; // compteur pour la couche anti-triche

    public TentativeQuiz() {
    }

    public TentativeQuiz(Freelancer freelance, Categorie categorie) {
        this.freelance = freelance;
        this.categorie = categorie;
        this.dateDebut = LocalDateTime.now();
        this.statutTentative = StatutTentative.EN_COURS;
        this.nombreViolations = 0;
    }

    // --- Getters / Setters ---

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Freelancer getFreelance() { return freelance; }
    public void setFreelance(Freelancer freelance) { this.freelance = freelance; }

    public Categorie getCategorie() { return categorie; }
    public void setCategorie(Categorie categorie) { this.categorie = categorie; }

    public Double getScore() { return score; }
    public void setScore(Double score) { this.score = score; }

    public LocalDateTime getDateDebut() { return dateDebut; }
    public void setDateDebut(LocalDateTime dateDebut) { this.dateDebut = dateDebut; }

    public LocalDateTime getDateSoumission() { return dateSoumission; }
    public void setDateSoumission(LocalDateTime dateSoumission) { this.dateSoumission = dateSoumission; }

    public StatutTentative getStatutTentative() { return statutTentative; }
    public void setStatutTentative(StatutTentative statutTentative) { this.statutTentative = statutTentative; }

    public int getNombreViolations() { return nombreViolations; }
    public void setNombreViolations(int nombreViolations) { this.nombreViolations = nombreViolations; }

    public void incrementerViolation() {
        this.nombreViolations++;
    }
}