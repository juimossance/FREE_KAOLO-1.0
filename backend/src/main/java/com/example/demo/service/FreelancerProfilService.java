package com.example.demo.service;

import com.example.demo.Dto.FreelancerProfilDto;
import com.example.demo.Dto.NotificationDto;
import com.example.demo.Dto.UserPrincipal;
import com.example.demo.entity.Freelancer;
import com.example.demo.entity.Notification;
import com.example.demo.repository.*;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class FreelancerProfilService {

    private final freelancerRepository freelancerRepository;
    private final NotificationRepository notificationRepository;
    private final CertificationRepository certificationRepository;
    private final PortfolioRepository portfolioRepository;
    private  final CvRepository cvRepository;

    public FreelancerProfilService(freelancerRepository freelancerRepository, NotificationRepository notificationRepository, CertificationRepository certificationRepository, PortfolioRepository portfolioRepository, CvRepository cvRepository) {
        this.freelancerRepository = freelancerRepository;
        this.notificationRepository = notificationRepository;
        this.certificationRepository = certificationRepository;
        this.portfolioRepository = portfolioRepository;
        this.cvRepository = cvRepository;
    }

// ── PROFIL ──────────────────────────────────────────

    public FreelancerProfilDto getProfil(Long id) {
        Freelancer f = freelancerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Freelancer non trouvé"));
        f.setCertifie(certificationRepository.hasValidCredential(f.getId()));

        return toDto(f);
    }

    public FreelancerProfilDto updateProfil(Long id, FreelancerProfilDto dto) {
        Freelancer f = freelancerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Freelancer non trouvé"));

        f.setNom(dto.getNom());
        f.setPrenom(dto.getPrenom());
        f.setSpecialite(dto.getSpecialite());
        f.setExperience(dto.getExperience());
        f.setPays(dto.getPays());
        f.setVille(dto.getVille());
        f.setTarifJournalier(dto.getTarifJournalier());
        f.setDisponibilite(dto.getDisponibilite());
        f.setGithub(dto.getGithub());
        f.setLinkedin(dto.getLinkedin());
        f.setSiteweb(dto.getSiteweb());
        f.setLangues(dto.getLangues());
        f.setCompetence(dto.getCompetence());

        // Update email/phone sur User
        f.getUser().setEmail(dto.getEmail());
        f.getUser().setPhone(dto.getPhone());
        int score = calculerCompletion(f);
        f.setCompletudeProfil(score);


        return toDto(freelancerRepository.save(f));
    }
    // Récupérer le profil via l'userId (pas le freelancerId)
    public FreelancerProfilDto getProfilByUserId(Long userId) {
        Freelancer f = freelancerRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Freelancer non trouvé"));

        f.setCertifie(
                certificationRepository.hasValidCredential(f.getId())
        );

        return toDto(f);
    }
    // Calcul % complétion
    public int calculerCompletion(Freelancer f) {

        int score = 0;

        if (f.getNom() != null && !f.getNom().isEmpty())
            score += 10;

        if (f.getPrenom() != null && !f.getPrenom().isEmpty())
            score += 10;

        if (f.getSpecialite() != null && !f.getSpecialite().isEmpty())
            score += 10;

        if (f.getDescription() != null && f.getDescription().length() > 50)
            score += 10;

        if (f.getPhotoUrl() != null && !f.getPhotoUrl().isEmpty())
            score += 10;

        if (f.getCompetence() != null && !f.getCompetence().isEmpty())
            score += 15;

        if (f.getGithub() != null && !f.getGithub().isEmpty())
            score += 5;

        if (f.getLinkedin() != null && !f.getLinkedin().isEmpty())
            score += 5;

        if (f.getTarifJournalier() != null)
            score += 5;

        // CV
        if (f.getId() != null &&
                cvRepository.findByFreelancerId(f.getId()).isPresent())
            score += 5;

        // Portfolio
        if (f.getId() != null &&
                !portfolioRepository
                        .findByFreelancerIdOrderByAnneeDesc(f.getId())
                        .isEmpty())
            score += 5;

        // Certification valide
        if (f.getId() != null &&
                certificationRepository.hasValidCredential(f.getId()))
            score += 5;

        return score;
    }

    private FreelancerProfilDto toDto(Freelancer f) {

        FreelancerProfilDto dto = new FreelancerProfilDto();
        dto.setId(f.getId());
        dto.setNom(f.getNom());
        dto.setPrenom(f.getPrenom());
        dto.setEmail(f.getUser().getEmail());
        dto.setPhone(f.getUser().getPhone());
        dto.setSpecialite(f.getSpecialite());
        dto.setExperience(f.getExperience());
        dto.setDescription(f.getDescription());
        dto.setPays(f.getPays());
        dto.setVille(f.getVille());
        dto.setTarifJournalier(f.getTarifJournalier());
        dto.setDisponibilite(f.getDisponibilite());
        dto.setGithub(f.getGithub());
        dto.setLinkedin(f.getLinkedin());
        dto.setSiteweb(f.getSiteweb());
        dto.setLangues(f.getLangues());
        dto.setPhotoUrl(f.getPhotoUrl());
        dto.setCompetence(f.getCompetence());
        dto.setCompletionPourcentage(calculerCompletion(f));
        dto.setCertifie(f.isCertifie());
        return dto;
    }

    // ── NOTIFICATIONS ────────────────────────────────────

    public List<NotificationDto> getNotifications(Long freelancerId) {
        return notificationRepository
                .findByUserIdOrderByDateDesc(freelancerId)
                .stream().map(this::toNotifDto)
                .collect(Collectors.toList());
    }

    public NotificationDto marquerLu(Long notifId) {
        Notification n = notificationRepository.findById(notifId)
                .orElseThrow(() -> new RuntimeException("Notification non trouvée"));
        n.setLu(true);
        return toNotifDto(notificationRepository.save(n));
    }

    public void marquerToutLu(Long freelancerId) {
        List<Notification> notifs = notificationRepository
                .findByUserIdOrderByDateDesc(freelancerId);
        notifs.forEach(n -> n.setLu(true));
        notificationRepository.saveAll(notifs);
    }

    public void supprimerNotification(Long notifId) {
        notificationRepository.deleteById(notifId);
    }

    private NotificationDto toNotifDto(Notification n) {
        NotificationDto dto = new NotificationDto();
        dto.setId(n.getId());
        dto.setType(n.getType());
        dto.setTitre(n.getTitre());
        dto.setDescription(n.getDescription());
        dto.setDate(n.getDate());
        dto.setLu(n.isLu());
        return dto;
    }
}