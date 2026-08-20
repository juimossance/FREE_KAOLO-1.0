package com.example.demo.Dto.DashboardDto;

public class revenueDto {
    String month;
    Double revenuMonthly;

    public revenueDto(String month, Double revenuMonthly) {
        this.month = month;
        this.revenuMonthly = revenuMonthly;
    }

    public String getMonth() {
        return month;
    }

    public void setMonth(String month) {
        this.month = month;
    }

    public Double getRevenuMonthly() {
        return revenuMonthly;
    }

    public void setRevenuMonthly(Double revenuMonthly) {
        this.revenuMonthly = revenuMonthly;
    }
}
