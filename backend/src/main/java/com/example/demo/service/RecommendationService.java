package com.example.demo.service;

import com.example.demo.Dto.RecommendationDto;
import com.example.demo.entity.Freelancer;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class RecommendationService {

    public int calculerScore(
            Freelancer freelancer,
            List<String> competencesRecherchees,
            String niveau,
            Double budget
    ) {

        int score = 0;

        // Compétences (40 pts)
        if (freelancer.getCompetence() != null) {

            long nb = competencesRecherchees.stream()
                    .filter(c -> freelancer.getCompetence()
                            .stream()
                            .map(fc -> fc.getCategorie().getNom().toLowerCase())
                            .anyMatch(f -> f.contains(c.toLowerCase())))
                    .count();

            score += Math.min(40, (int) (nb * 10));
        }
        // Expérience (20 pts)

        if (freelancer.getExperience() != null &&
                freelancer.getExperience().equalsIgnoreCase(niveau)) {

            score += 20;

        }

        // Disponibilité (15 pts)

        if (freelancer.getDisponibilite() != null &&
                freelancer.getDisponibilite().equalsIgnoreCase("Disponible")) {

            score += 15;

        }

        // Budget (15 pts)

        if (budget != null &&
                freelancer.getTarifJournalier() != null &&
                freelancer.getTarifJournalier() <= budget) {

            score += 15;

        }

        // Note (10 pts)

        score += (int) (freelancer.getNoteMoyenne() * 2);

        return Math.min(score,100);
    }

    public String genererRaison(Freelancer f) {

        List<String> raisons = new ArrayList<>();

        if(f.getNoteMoyenne() >= 4.5)
            raisons.add("Excellente réputation");

        if(f.getDisponibilite()!=null &&
                f.getDisponibilite().equalsIgnoreCase("Disponible"))
            raisons.add("Disponible immédiatement");

        if(f.getExperience()!=null)
            raisons.add(f.getExperience()+" d'expérience");

        return String.join(" • ", raisons);

    }
    public RecommendationDto convertir(Freelancer f,
                                       int score,
                                       String raison) {

        RecommendationDto dto = new RecommendationDto();

        dto.setFreelancerId(f.getId());
        dto.setUserId(f.getUser().getId());
        dto.setNom(f.getNom());
        dto.setPrenom(f.getPrenom());
        dto.setPhotoUrl(f.getPhotoUrl());
        dto.setSpecialite(f.getSpecialite());
        dto.setCompetences(f.getCompetence());
        dto.setVille(f.getVille());
        dto.setTarif(f.getTarifJournalier());
        dto.setDisponibilite(f.getDisponibilite());
        dto.setNote(f.getNoteMoyenne());
        dto.setScoreIA(score);
        dto.setRaison(raison);

        return dto;
    }
}
