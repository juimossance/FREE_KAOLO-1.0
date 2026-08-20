package com.example.demo.Controller;


import com.example.demo.Dto.DashboardDto.FreelancerDashboardDto;
import com.example.demo.Dto.UserPrincipal;
import com.example.demo.Enum.Role;
import com.example.demo.entity.User;
import com.example.demo.service.DashboardService;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {
    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/freelancer")
    public FreelancerDashboardDto freelancerDashboard(@AuthenticationPrincipal UserPrincipal user) {
        if (user == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        }
        if (user.getRole() != Role.FREELANCER) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Accès réservé aux freelancers");
        }
        return dashboardService.getFreelancerDashboard(user.getId());
    }
}
