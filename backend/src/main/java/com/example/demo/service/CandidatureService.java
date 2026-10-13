package com.example.demo.service;


import com.example.demo.Dto.AvisDto;
import com.example.demo.Dto.UserPrincipal;
import com.example.demo.Enum.StatusCandidature;
import com.example.demo.entity.*;
import com.example.demo.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import com.example.demo.Dto.Candidaturedto;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

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

        // 1. Vérifier si le freelance a déjà postulé
        if (candidatureRepository.existsByFreelancerIdAndProjetId(
                freelancerId,
                projetId
        )) {
            throw new RuntimeException(
                    "Vous avez déjà postulé à ce projet !"
            );
        }

        // 2. Récupérer le freelance
        Freelancer freelancer = freelancerRepository.findById(freelancerId)
                .orElseThrow(() ->
                        new RuntimeException("Freelancer non trouvé")
                );

        // 3. Récupérer le projet
        Projet projet = projetRepository.findById(projetId)
                .orElseThrow(() ->
                        new RuntimeException("Projet non trouvé")
                );

        // 4. Vérifier que le projet est encore ouvert aux candidatures
        // 4. Vérifier que le projet accepte encore des candidatures
        if (!"Ouvert".equals(projet.getStatut()) || !"Public".equals(projet.getVisibilite())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Ce projet n'accepte plus de candidatures"
            );
        }

        if (projet.getDeadline() != null && !projet.getDeadline().isBlank()) {
            try {
                if (java.time.LocalDate.parse(projet.getDeadline()).isBefore(java.time.LocalDate.now())) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La date limite est dépassée");
                }
            } catch (java.time.format.DateTimeParseException ignored) {
                // deadline non ISO : on ne bloque pas
            }
        }

        // 5. Créer la candidature
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

    @Transactional
    public void accepter(Long candidatureId) {
        Candidature candidature = candidatureRepository.findById(candidatureId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Candidature introuvable"));

        candidature.setStatus(StatusCandidature.EN_COURS); // et non ACCEPTEE
        candidatureRepository.save(candidature);

        Projet projet = candidature.getProjet();
        projet.setStatut("En cours");
        projet.setProgression(0);
        projetRepository.save(projet);

        // Optionnel : rejeter automatiquement les autres candidatures EN_ATTENTE sur ce projet
        candidatureRepository.findByProjetIdAndStatus(projet.getId(), StatusCandidature.EN_ATTENTE)
                .forEach(c -> {
                    if (!c.getId().equals(candidatureId)) {
                        c.setStatus(StatusCandidature.REJETEE);
                        candidatureRepository.save(c);
                    }
                });
    }
    public Candidaturedto noterFreelance(
            Long candidatureId,
            Integer note,
            String commentaire,
            UserPrincipal user
    ) {
        // 1. Vérifier que l'utilisateur est une entreprise
        if (user.getEntrepriseId() == null) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Réservé aux entreprises"
            );
        }

        // 2. Récupérer la candidature
        Candidature c = candidatureRepository.findById(candidatureId)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Candidature introuvable"
                        )
                );

        // 3. Vérifier que le projet appartient à l'entreprise connectée
        if (c.getProjet() == null ||
                c.getProjet().getEntreprise() == null ||
                !c.getProjet()
                        .getEntreprise()
                        .getId()
                        .equals(user.getEntrepriseId())) {

            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Ce projet n'est pas le vôtre"
            );
        }

        // 4. Vérifier que le projet est terminé
        if (!"Terminé".equals(c.getProjet().getStatut())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Seules les missions terminées peuvent être notées"
            );
        }

        // 5. 0 = pas encore noté
        //    1 à 5 = déjà noté
        if (c.getNote() != null && c.getNote() > 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Ce freelance a déjà été noté pour cette mission"
            );
        }

        // 6. Vérifier la note
        if (note == null || note < 1 || note > 5) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Note invalide (1 à 5)"
            );
        }

        // 7. Enregistrer la note
        c.setNote(note);
        c.setCommentaireEntreprise(
                commentaire != null && !commentaire.trim().isEmpty()
                        ? commentaire.trim()
                        : null
        );

        candidatureRepository.save(c);

        // 8. Recalculer la moyenne du freelance
        Freelancer f = c.getFreelancer();

        if (f != null) {
            Long fid = f.getId();

            Double moyenne = candidatureRepository.moyenneNote(fid);

            f.setNoteMoyenne(
                    moyenne == null
                            ? 0.0
                            : Math.round(moyenne * 10) / 10.0
            );

            f.setNombreAvis(
                    (int) candidatureRepository.countAvis(fid)
            );

            freelancerRepository.save(f);
        }

        // 9. Retourner la candidature mise à jour
        return toDto(c);
    }
    public List<AvisDto> getAvis(Long freelancerId) {
        return candidatureRepository.findByFreelancerId(freelancerId).stream()
                .filter(c -> c.getNote() != null)
                .sorted((a, b) -> {
                    LocalDateTime da = a.getDateFin() != null ? a.getDateFin() : a.getDate();
                    LocalDateTime db = b.getDateFin() != null ? b.getDateFin() : b.getDate();
                    if (da == null || db == null) return 0;
                    return db.compareTo(da); // plus récent d'abord
                })
                .map(this::toAvisDto)
                .collect(Collectors.toList());
    }

    private AvisDto toAvisDto(Candidature c) {
        AvisDto dto = new AvisDto();
        dto.setNote(c.getNote());
        dto.setCommentaire(c.getCommentaireEntreprise());
        dto.setDate(c.getDateFin() != null ? c.getDateFin() : c.getDate());

        if (c.getProjet() != null) {
            dto.setProjetTitre(c.getProjet().getTitre());
            if (c.getProjet().getEntreprise() != null) {
                dto.setEntrepriseNom(c.getProjet().getEntreprise().getNomEntreprise());
            }
        }
        return dto;
    }
}