package com.example.demo.entity;

import jakarta.persistence.*;
import com.example.demo.Enum.StatusCandidature;
import java.time.LocalDateTime;

@Entity
public class Candidature {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name="freelancer_id")
    private Freelancer freelancer;

    @ManyToOne
    @JoinColumn(name="projet_id")
    private Projet projet;

    @Enumerated(EnumType.STRING)
    private StatusCandidature status;

    private LocalDateTime date;

    //historique
    private String commentaireEntreprise;
    private Integer note;
    private Double montantFinal;
    private LocalDateTime dateFin;

    public String getCommentaireEntreprise() {
        return commentaireEntreprise;
    }

    public void setCommentaireEntreprise(String commentaireEntreprise) {
        this.commentaireEntreprise = commentaireEntreprise;
    }

    public LocalDateTime getDateFin() {
        return dateFin;
    }

    public void setDateFin(LocalDateTime dateFin) {
        this.dateFin = dateFin;
    }



    public Double getMontantFinal() {
        return montantFinal;
    }

    public void setMontantFinal(Double montantFinal) {
        this.montantFinal = montantFinal;
    }

    public Integer getNote() {
        return note;
    }

    public void setNote(Integer note) {
        this.note = note;
    }


    public LocalDateTime getDate() {
        return date;
    }

    public void setDate(LocalDateTime date) {
        this.date = date;
    }

    public Freelancer getFreelancer() {
        return freelancer;
    }

    public void setFreelancer(Freelancer freelancer) {
        this.freelancer = freelancer;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Projet getProjet() {
        return projet;
    }

    public void setProjet(Projet projet) {
        this.projet = projet;
    }

    public StatusCandidature getStatus() {
        return status;
    }

    public void setStatus(StatusCandidature status) {
        this.status = status;
    }
}
