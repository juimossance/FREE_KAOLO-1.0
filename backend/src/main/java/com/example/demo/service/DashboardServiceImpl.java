package com.example.demo.service;

import com.example.demo.Dto.DashboardDto.FreelancerDashboardDto;
import com.example.demo.Dto.DashboardDto.dashboardStatDto;
import com.example.demo.Dto.NotificationDto;
import com.example.demo.entity.Freelancer;
import com.example.demo.repository.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@Transactional(readOnly = true)
public class DashboardServiceImpl implements DashboardService{
    private final freelancerRepository freelancerRepository;
    private final CandidatureRepository candidatureRepository;
    private final PaiementRepository paiementRepository;
    private final NotificationRepository notificationRepository;

    private final entrepriseRepository entrepriseRepository;
    private final ProjetRepository projetRepository;

    public DashboardServiceImpl(
            freelancerRepository freelancerRepository,
            CandidatureRepository candidatureRepository,
            PaiementRepository paiementRepository,
            NotificationRepository notificationRepository,

            entrepriseRepository entrepriseRepository,
            ProjetRepository projetRepository) {
        this.freelancerRepository = freelancerRepository;
        this.candidatureRepository = candidatureRepository;
        this.paiementRepository = paiementRepository;
        this.notificationRepository = notificationRepository;

        this.entrepriseRepository = entrepriseRepository;
        this.projetRepository = projetRepository;
    }

    @Override
    public FreelancerDashboardDto getFreelancerDashboard(Long userId) {
        Freelancer freelancer = freelancerRepository.findByUserId(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Profil freelancer introuvable"));

        Double avgNote = freelancerRepository.averageNote(freelancer.getId());

        return new FreelancerDashboardDto(
                candidatureRepository.applicationStatistics(freelancer.getId()),
                candidatureRepository.findRecentApplications(freelancer.getId()),
                paiementRepository.monthlyRevenue(freelancer.getId()),
                notificationRepository.findByUserIdOrderByDateDesc(userId)
                        .stream()
                        .map(n -> new NotificationDto(
                                n.getTitre(),
                                n.getType(),
                                n.isLu()))
                        .toList(),
                new dashboardStatDto(
                        freelancer.getVues(),
                        candidatureRepository.countByFreelancerId(freelancer.getId()),
                        avgNote != null ? avgNote : 0.0,
                        paiementRepository.totalThisMonth(freelancer.getId())
                )
        );
    }

  /**  @Override
    public EntrepriseDashboardDTO getEntrepriseDashboard(Long userId) {
        // déjà couvert dans un message précédent — dis-moi si tu veux que je le recolle ici aussi
        throw new UnsupportedOperationException("Voir implémentation entreprise");
    }
    **/
}
