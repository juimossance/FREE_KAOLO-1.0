package com.example.demo.entity;



import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "projet_vues",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_projet_utilisateur",
                        columnNames = {"projet_id", "utilisateur_id"}
                )
        }
)
public class ProjetVue {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "projet_id", nullable = false)
    private Projet projet;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "utilisateur_id", nullable = false)
    private User utilisateur;

    @Column(nullable = false)
    private LocalDateTime derniereVue;

    public Long getId() {
        return id;
    }

    public Projet getProjet() {
        return projet;
    }

    public void setProjet(Projet projet) {
        this.projet = projet;
    }

    public User getUtilisateur() {
        return utilisateur;
    }

    public void setUtilisateur(User utilisateur) {
        this.utilisateur = utilisateur;
    }

    public LocalDateTime getDerniereVue() {
        return derniereVue;
    }

    public void setDerniereVue(LocalDateTime derniereVue) {
        this.derniereVue = derniereVue;
    }
}
