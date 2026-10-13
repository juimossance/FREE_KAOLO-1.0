package com.example.demo.service;


import com.example.demo.Dto.AvancementDtos;
import com.example.demo.entity.Candidature;
import com.example.demo.entity.MiseAJourAvancement;
import com.example.demo.repository.CandidatureRepository;
import com.example.demo.Enum.StatusCandidature;
import com.example.demo.entity.Projet;
import com.example.demo.repository.MiseAJourAvancementRepository;
import com.example.demo.repository.ProjetRepository;
import com.example.demo.Dto.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AvancementService {

    private final ProjetRepository projetRepository;
    private final CandidatureRepository candidatureRepository;
    private final MiseAJourAvancementRepository avancementRepository;

    /* =====================================================
       LECTURE
       Autorisé : l'entreprise propriétaire du projet,
                  OU le freelancer dont la candidature sur
                  ce projet est EN_COURS.
    ===================================================== */
    @Transactional(readOnly = true)
    public AvancementDtos.AvancementProjetDTO getAvancement(Long projetId, UserPrincipal currentUser) {

        Projet projet = projetRepository.findById(projetId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Projet introuvable"));

        boolean estEntrepriseProprietaire =
                currentUser.getEntrepriseId() != null
                        && currentUser.getEntrepriseId().equals(projet.getEntreprise().getId());

        boolean estFreelancerAffecte =
                currentUser.getFreelancerId() != null
                        && candidatureRepository.existsByProjetIdAndFreelancerIdAndStatus(
                        projetId, currentUser.getFreelancerId(), StatusCandidature.EN_COURS);

        if (!estEntrepriseProprietaire && !estFreelancerAffecte) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Accès non autorisé à cet avancement");
        }

        List<AvancementDtos.MiseAJourDTO> historique = avancementRepository
                .findByProjetIdOrderByDateAsc(projetId)
                .stream()
                .map(m -> new AvancementDtos.MiseAJourDTO(m.getId(), m.getPourcentage(), m.getMessage(), m.getDate()))
                .toList();

        return new AvancementDtos.AvancementProjetDTO(
                projet.getId(),
                projet.getProgression() != null ? projet.getProgression() : 0,
                projet.getDerniereMiseAJourAvancement(),
                historique
        );
    }

    /* =====================================================
       PUBLICATION
       Autorisé uniquement : le freelancer dont la
       candidature sur ce projet est EN_COURS.
    ===================================================== */
    @Transactional
    public AvancementDtos.AvancementProjetDTO publierMiseAJour(
            Long projetId,
            AvancementDtos.NouvelleMiseAJourRequest request,
            UserPrincipal currentUser
    ) {
        if (currentUser.getFreelancerId() == null) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Réservé aux freelancers");
        }

        Candidature candidature = candidatureRepository
                .findByProjetIdAndFreelancerId(projetId, currentUser.getFreelancerId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.FORBIDDEN, "Vous n'êtes pas affecté à ce projet"));

        if (candidature.getStatus() != StatusCandidature.EN_COURS) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN, "Le projet n'est pas (ou plus) en cours pour vous");
        }

        Projet projet = candidature.getProjet();

        MiseAJourAvancement entry = new MiseAJourAvancement();
        entry.setProjet(projet);
        entry.setPourcentage(request.pourcentage());
        entry.setMessage(request.message());
        avancementRepository.save(entry);

        projet.setProgression(request.pourcentage());
        projet.setDerniereMiseAJourAvancement(LocalDateTime.now());

        // Optionnel : passage automatique du projet à "Terminé" à 100%
        if (request.pourcentage() == 100) {
            projet.setStatut("Terminé");
        }

        projetRepository.save(projet);

        return getAvancement(projetId, currentUser);
    }}
