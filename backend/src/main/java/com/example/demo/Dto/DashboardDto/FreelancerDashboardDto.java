package com.example.demo.Dto.DashboardDto;

import com.example.demo.Dto.NotificationDto;

import java.util.List;

public class FreelancerDashboardDto {
    dashboardStatDto stats;
    List<revenueDto> earnings;
    List<monthlyDto> applicationChart;
    List<RecentApplicationDto> applications;
    List<NotificationDto> notifications;

    public FreelancerDashboardDto(List<monthlyDto> applicationChart, List<RecentApplicationDto> applications, List<revenueDto> earnings, List<NotificationDto> notifications, dashboardStatDto stats) {
        this.applicationChart = applicationChart;
        this.applications = applications;
        this.earnings = earnings;
        this.notifications = notifications;
        this.stats = stats;
    }

    public List<monthlyDto> getApplicationChart() {
        return applicationChart;
    }

    public void setApplicationChart(List<monthlyDto> applicationChart) {
        this.applicationChart = applicationChart;
    }

    public List<RecentApplicationDto> getApplications() {
        return applications;
    }

    public void setApplications(List<RecentApplicationDto> applications) {
        this.applications = applications;
    }

    public List<revenueDto> getEarnings() {
        return earnings;
    }

    public void setEarnings(List<revenueDto> earnings) {
        this.earnings = earnings;
    }

    public List<NotificationDto> getNotifications() {
        return notifications;
    }

    public void setNotifications(List<NotificationDto> notifications) {
        this.notifications = notifications;
    }

    public dashboardStatDto getStats() {
        return stats;
    }

    public void setStats(dashboardStatDto stats) {
        this.stats = stats;
    }
}
