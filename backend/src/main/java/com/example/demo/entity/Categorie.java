package com.example.demo.entity;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "categorie")
public class Categorie {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nom; // ex: "Community Management"

    @Column(nullable = false)
    private String metier; // ex: "Community Management" (regroupement métier)

    public Categorie() {
    }

    public Categorie(String nom, String metier) {
        this.nom = nom;
        this.metier = metier;
    }

    // --- Getters / Setters ---

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }

    public String getMetier() { return metier; }
    public void setMetier(String metier) { this.metier = metier; }
}