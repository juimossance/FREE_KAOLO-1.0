package com.example.demo.Dto.DashboardDto;

public class applicationChartDto {
    String month;
    int envoyees;//nombre de candidatures envoyées.
    int acceptees;//nombre de candidatures reçues.

    public int getAcceptees() {
        return acceptees;
    }

    public void setAcceptees(int acceptees) {
        this.acceptees = acceptees;
    }

    public int getEnvoyees() {
        return envoyees;
    }

    public void setEnvoyees(int envoyees) {
        this.envoyees = envoyees;
    }

    public String getMonth() {
        return month;
    }

    public void setMonth(String month) {
        this.month = month;
    }
}
