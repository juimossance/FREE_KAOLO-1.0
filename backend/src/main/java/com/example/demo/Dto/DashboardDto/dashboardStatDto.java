package com.example.demo.Dto.DashboardDto;

public class dashboardStatDto {
    int vue;//nombre de fois que le profil du freelance a été consulté.
    Long applications; //nombre total de candidatures envoyées.
    double rating;//note moyenne obtenue par le freelance.
    Double monthlyRevenue;


    public dashboardStatDto(int vue, Long applications, double rating, Double monthlyRevenue
    ) {
        this.vue = vue;
        this.applications = applications;
        this.rating = rating;
        this.monthlyRevenue = monthlyRevenue;
    }

    public Long getApplications() {
        return applications;
    }

    public void setApplications(Long applications) {
        this.applications = applications;
    }

    public Double getMonthlyRevenue() {
        return monthlyRevenue;
    }

    public void setMonthlyRevenue(Double monthlyRevenue) {
        this.monthlyRevenue = monthlyRevenue;
    }

    public double getRating() {
        return rating;
    }

    public void setRating(double rating) {
        this.rating = rating;
    }

    public int getVue() {
        return vue;
    }

    public void setVue(int vue) {
        this.vue = vue;
    }
}
