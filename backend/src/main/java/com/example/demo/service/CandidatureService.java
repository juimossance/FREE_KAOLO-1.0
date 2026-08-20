package com.example.demo.service;


import com.example.demo.Enum.StatusCandidature;
import com.example.demo.entity.*;
import com.example.demo.repository.*;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import com.example.demo.Dto.Candidaturedto;

@Service
public class CandidatureService {

    private final CandidatureRepository candidatureRepository;
    private final freelancerRepository freelancerRepository;
    private final ProjetRepository projetRepository;

    public CandidatureService(CandidatureRepository candidatureRepository,
                              freelancerRepository freelancerRepository,
                              ProjetRepository projetRepository) {
        this.candidatureRepository = candidatureRepository;
        this.freelancerRepository = freelancerRepository;
        this.projetRepository = projetRepository;
    }

    // Convertir entité → DTO
    private Candidaturedto toDto(Candidature c) {
        Candidaturedto dto = new Candidaturedto();
        dto.setId(c.getId());
        dto.setStatus(c.getStatus().name());
        dto.setDate(c.getDate());
        dto.setDateFin(c.getDateFin());
        dto.setMontantFinal(c.getMontantFinal());
        dto.setNote(c.getNote());
        dto.setCommentaireEntreprise(c.getCommentaireEntreprise());

        // Infos projet
        if (c.getProjet() != null) {
            dto.setProjetId(c.getProjet().getId());
            dto.setProjetTitre(c.getProjet().getTitre());
            dto.setProjetBudget(c.getProjet().getBudget() != null ? c.getProjet().getBudget() : 0.0);

            // Infos entreprise
            if (c.getProjet().getEntreprise() != null) {
                String nom = c.getProjet().getEntreprise().getNomEntreprise();
                dto.setEntrepriseNom(nom != null ? nom : "Entreprise inconnue");
            } else {
                dto.setEntrepriseNom("Entreprise inconnue");
            }
        }

        // Infos freelancer
        if (c.getFreelancer() != null) {
            Freelancer f = c.getFreelancer();
            dto.setFreelancerId(f.getId());
            dto.setFreelancerNom(f.getNom());
            dto.setFreelancerPrenom(f.getPrenom());
            dto.setFreelancerSpecialite(f.getSpecialite());
            dto.setFreelancerRating(f.getNoteMoyenne());
            dto.setFreelancerNbAvis(f.getNombreAvis());
            dto.setFreelancerCompetences(f.getCompetence());
        }

        return dto;
    }

    public Candidaturedto postuler(Long freelancerId, Long projetId) {

        // ✅ Vérifier si déjà postulé
        if (candidatureRepository.existsByFreelancerIdAndProjetId(freelancerId, projetId)) {
            throw new RuntimeException("Vous avez déjà postulé à ce projet !");
        }

        Freelancer freelancer = freelancerRepository.findById(freelancerId)
                .orElseThrow(() -> new RuntimeException("Freelancer non trouvé"));

        Projet projet = projetRepository.findById(projetId)
                .orElseThrow(() -> new RuntimeException("Projet non trouvé"));

        Candidature c = new Candidature();
        c.setFreelancer(freelancer);
        c.setProjet(projet);
        c.setStatus(StatusCandidature.EN_ATTENTE);
        c.setDate(LocalDateTime.now());

        return toDto(candidatureRepository.save(c));
    }
    // Candidatures récentes
    public List<Candidaturedto> getRecentes(Long freelancerId) {
        Freelancer freelancer = freelancerRepository.findById(freelancerId)
                .orElseThrow(() -> new RuntimeException("Freelancer non trouvé"));
        return candidatureRepository
                .findTop5ByFreelancerIdOrderByDateDesc(freelancer.getId())
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    // Toutes les candidatures
    public List<Candidaturedto> getAll(Long freelancerId) {
        return candidatureRepository.findByFreelancerId(freelancerId)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public List<Candidaturedto> getHistorique(Long freelancerId, String status) {
        List<Candidature> candidatures = candidatureRepository.findByFreelancerId(freelancerId);
        if (status != null && !status.isEmpty()) {
            candidatures = candidatures.stream()
                    .filter(c -> c.getStatus().name().equalsIgnoreCase(status))
                    .collect(Collectors.toList());
        }
        return candidatures.stream().map(this::toDto).collect(Collectors.toList());
    }

    public Map<String, Object> getStatsProjet(Long freelancerId) {
        List<Candidature> all = candidatureRepository.findByFreelancerId(freelancerId);
        long termines = all.stream()
                .filter(c -> c.getStatus() == StatusCandidature.ACCEPTEE).count();
        double totalGagne = all.stream()
                .filter(c -> c.getMontantFinal() != null)
                .mapToDouble(Candidature::getMontantFinal).sum();

        Map<String, Object> stats = new HashMap<>();
        stats.put("total", all.size());
        stats.put("termines", termines);
        stats.put("totalGagne", totalGagne);
        return stats;
    }
}