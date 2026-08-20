package com.example.demo.service;

import com.example.demo.Dto.DashboardDto.FreelancerDashboardDto;
import com.example.demo.Dto.NotificationDto;

public interface DashboardService {

        FreelancerDashboardDto getFreelancerDashboard(Long userId);
       // EntrepriseDashboardDTO getEntrepriseDashboard(Long userId);

}
