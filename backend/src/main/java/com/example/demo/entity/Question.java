package com.example.demo.entity;

import com.example.demo.Enum.NiveauDifficulte;
import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "question")
public class Question {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 500)
    private String enonce;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NiveauDifficulte difficulte;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "categorie_id", nullable = false)
    private Categorie categorie;

    @OneToMany(mappedBy = "question", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Reponse> reponses;

    public Question() {
    }

    public Question(String enonce, NiveauDifficulte difficulte, Categorie categorie) {
        this.enonce = enonce;
        this.difficulte = difficulte;
        this.categorie = categorie;
    }

    // --- Getters / Setters ---

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getEnonce() { return enonce; }
    public void setEnonce(String enonce) { this.enonce = enonce; }

    public NiveauDifficulte getDifficulte() { return difficulte; }
    public void setDifficulte(NiveauDifficulte difficulte) { this.difficulte = difficulte; }

    public Categorie getCategorie() { return categorie; }
    public void setCategorie(Categorie categorie) { this.categorie = categorie; }

    public List<Reponse> getReponses() { return reponses; }
    public void setReponses(List<Reponse> reponses) { this.reponses = reponses; }
}