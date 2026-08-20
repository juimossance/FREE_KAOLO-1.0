package com.example.demo.Dto.DashboardDto;

public class monthlyDto {
    String month;
    Long envoyees;
    Long acceptees;

    public monthlyDto( String month, Long envoyees,Long acceptees) {
        this.month = month;
        this.envoyees = envoyees;
        this.acceptees = acceptees;


    }

    public Long getAcceptees() {
        return acceptees;
    }

    public void setAcceptees(Long acceptees) {
        this.acceptees = acceptees;
    }

    public Long getEnvoyees() {
        return envoyees;
    }

    public void setEnvoyees(Long envoyees) {
        this.envoyees = envoyees;
    }

    public String getMonth() {
        return month;
    }

    public void setMonth(String month) {
        this.month = month;
    }
}
