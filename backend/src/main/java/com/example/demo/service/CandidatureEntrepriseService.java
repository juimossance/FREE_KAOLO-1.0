package com.example.demo.service;

import com.example.demo.Dto.Candidaturedto;
import com.example.demo.Enum.StatusCandidature;
import com.example.demo.entity.Candidature;
import com.example.demo.repository.CandidatureRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class CandidatureEntrepriseService {

    private final CandidatureRepository candidatureRepository;

    public CandidatureEntrepriseService(
            CandidatureRepository candidatureRepository
    ) {
        this.candidatureRepository = candidatureRepository;
    }


    // =========================================================
    // TOUTES LES CANDIDATURES DE L'ENTREPRISE
    // =========================================================

    @Transactional(readOnly = true)
    public List<Candidaturedto> getCandidatures(Long entrepriseId) {

        return candidatureRepository
                .findByEntrepriseId(entrepriseId)
                .stream()
                .map(this::toDto)
                .toList();
    }


    // =========================================================
    // CANDIDATURES PAR STATUS
    // =========================================================

    @Transactional(readOnly = true)
    public List<Candidaturedto> getCandidaturesByStatut(
            Long entrepriseId,
            StatusCandidature status
    ) {

        return candidatureRepository
                .findByEntrepriseIdAndStatus(
                        entrepriseId,
                        status
                )
                .stream()
                .map(this::toDto)
                .toList();
    }


    // =========================================================
    // CHANGER LE STATUS
    // =========================================================

    public Candidaturedto changerStatut(
            Long entrepriseId,
            Long candidatureId,
            StatusCandidature status
    ) {

        Candidature candidature =
                candidatureRepository
                        .findByIdAndEntrepriseId(
                                candidatureId,
                                entrepriseId
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Candidature introuvable ou accès interdit"
                                )
                        );

        candidature.setStatus(status);

        Candidature saved =
                candidatureRepository.save(candidature);

        return toDto(saved);
    }


    // =========================================================
    // ENTITY -> DTO
    // =========================================================

    private Candidaturedto toDto(Candidature candidature) {

        Candidaturedto dto = new Candidaturedto();

        // -----------------------------------------------------
        // CANDIDATURE
        // -----------------------------------------------------

        dto.setId(candidature.getId());
        dto.setStatus(
                candidature.getStatus() != null
                        ? candidature.getStatus().name()
                        : null
        );

        dto.setDate(candidature.getDate());

        dto.setCommentaireEntreprise(
                candidature.getCommentaireEntreprise()
        );

        dto.setMontantFinal(
                candidature.getMontantFinal()
        );

        dto.setDateFin(
                candidature.getDateFin()
        );

        dto.setNote(
                candidature.getNote()
        );


        // -----------------------------------------------------
        // PROJET
        // -----------------------------------------------------

        if (candidature.getProjet() != null) {

            dto.setProjetId(
                    candidature.getProjet().getId()
            );

            dto.setProjetTitre(
                    candidature.getProjet().getTitre()
            );

            /*
             * Adapte cette ligne si ton entité Projet
             * utilise un autre nom de propriété.
             */
            dto.setProjetBudget(
                    candidature.getProjet().getBudget()
            );

            if (candidature.getProjet().getEntreprise() != null) {

                dto.setEntrepriseNom(
                        candidature
                                .getProjet()
                                .getEntreprise()
                                .getNomEntreprise()
                );
            }
        }


        // -----------------------------------------------------
        // FREELANCER
        // -----------------------------------------------------

        if (candidature.getFreelancer() != null) {

            dto.setFreelancerId(
                    candidature.getFreelancer().getId()
            );
            if (candidature.getFreelancer().getUser() != null) {
                dto.setFreelancerUserId(
                        candidature.getFreelancer().getUser().getId()
                );
            }

            dto.setFreelancerNom(
                    candidature.getFreelancer().getNom()
            );

            dto.setFreelancerPrenom(
                    candidature.getFreelancer().getPrenom()
            );

            dto.setFreelancerSpecialite(
                    candidature.getFreelancer().getSpecialite()
            );

            dto.setFreelancerRating(
                    candidature.getFreelancer().getNoteMoyenne()
            );

            dto.setFreelancerNbAvis(
                    candidature.getFreelancer().getNombreAvis()
            );

            dto.setFreelancerCompetences(
                    candidature.getFreelancer().getCompetence()
            );
        }

        return dto;
    }
}