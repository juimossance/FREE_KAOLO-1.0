package com.example.demo.Dto.DashboardDto;

import com.example.demo.Enum.StatusCandidature;

import java.time.LocalDate;

public class applicationDto {
    String projet;
    String company;
   StatusCandidature status;
    long budget;
    LocalDate date;

    public long getBudget() {
        return budget;
    }

    public void setBudget(long budget) {
        this.budget = budget;
    }

    public String getCompany() {
        return company;
    }

    public void setCompany(String company) {
        this.company = company;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public String getProjet() {
        return projet;
    }

    public void setProjet(String projet) {
        this.projet = projet;
    }

    public StatusCandidature getStatus() {
        return status;
    }

    public void setStatus(StatusCandidature status) {
        this.status = status;
    }
}
