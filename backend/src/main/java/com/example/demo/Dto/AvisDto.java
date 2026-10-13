package com.example.demo.Dto;

import java.time.LocalDateTime;

public class AvisDto {
    private Integer note;
    private String commentaire;
    private String projetTitre;
    private String entrepriseNom;
    private LocalDateTime date;

    // getters / setters
    public Integer getNote() { return note; }
    public void setNote(Integer note) { this.note = note; }

    public String getCommentaire() { return commentaire; }
    public void setCommentaire(String commentaire) { this.commentaire = commentaire; }

    public String getProjetTitre() { return projetTitre; }
    public void setProjetTitre(String projetTitre) { this.projetTitre = projetTitre; }

    public String getEntrepriseNom() { return entrepriseNom; }
    public void setEntrepriseNom(String entrepriseNom) { this.entrepriseNom = entrepriseNom; }

    public LocalDateTime getDate() { return date; }
    public void setDate(LocalDateTime date) { this.date = date; }
}
