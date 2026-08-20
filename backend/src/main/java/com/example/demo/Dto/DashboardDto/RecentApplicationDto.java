package com.example.demo.Dto.DashboardDto;

import com.example.demo.Enum.StatusCandidature;

import java.time.LocalDateTime;

public class RecentApplicationDto {
    String projet;
    String entreprise;
    StatusCandidature statut;
    LocalDateTime date;
    Double budget;

    public RecentApplicationDto(   String projet,String entreprise, StatusCandidature statut,LocalDateTime date,Double budget) {
        this.budget = budget;
        this.date = date;
        this.entreprise = entreprise;
        this.projet = projet;
        this.statut = statut;
    }

    public Double getBudget() {
        return budget;
    }

    public void setBudget(Double budget) {
        this.budget = budget;
    }

    public LocalDateTime getDate() {
        return date;
    }

    public void setDate(LocalDateTime date) {
        this.date = date;
    }

    public String getEntreprise() {
        return entreprise;
    }

    public void setEntreprise(String entreprise) {
        this.entreprise = entreprise;
    }

    public String getProjet() {
        return projet;
    }

    public void setProjet(String projet) {
        this.projet = projet;
    }

    public StatusCandidature getStatut() {
        return statut;
    }

    public void setStatut(StatusCandidature statut) {
        this.statut = statut;
    }
}
