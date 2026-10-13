package com.example.demo.service;

import com.example.demo.Dto.Candidaturedto;
import com.example.demo.Dto.ProjetDto;
import com.example.demo.entity.*;
import com.example.demo.repository.*;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ProjetEntrepriseService {

    private final ProjetRepository projetRepository;
    private final entrepriseRepository entrepriseRepo;
    private final CandidatureRepository candidatureRepository;
    private final UserRepository userRepository;
    private final ProjetVueRepository projetVueRepository;

    public ProjetEntrepriseService(CandidatureRepository candidatureRepository, ProjetRepository projetRepository, entrepriseRepository entrepriseRepo, UserRepository userRepository, ProjetVueRepository projetVueRepository) {
        this.candidatureRepository = candidatureRepository;
        this.projetRepository = projetRepository;
        this.entrepriseRepo = entrepriseRepo;
        this.userRepository = userRepository;
        this.projetVueRepository = projetVueRepository;
    }
// ── CRUD PROJETS ─────────────────────────────────────
public List<ProjetDto> getProjetsPublics(String search, String categorie, Long freelancerId) {
    List<ProjetDto> dtos = getProjetsPublics(search, categorie);
    if (freelancerId != null) {
        Set<Long> dejaPostules =
                new HashSet<>(candidatureRepository.findProjetIdsByFreelancerId(freelancerId));
        dtos.forEach(d -> d.setDejaPostule(dejaPostules.contains(d.getId())));
    }
    return dtos;
}

    public ProjetDto publierProjet(Long entrepriseId, ProjetDto dto) {
        Entreprise entreprise = entrepriseRepo.findById(entrepriseId)
                .orElseThrow(() -> new RuntimeException("Entreprise non trouvée"));

        Projet p = new Projet();
        p.setEntreprise(entreprise);
        p.setTitre(dto.getTitre());
        p.setCategorie(dto.getCategorie());
        p.setDescription(dto.getDescription());
        p.setLivrable(dto.getLivrables());
        p.setBudget(dto.getBudget());
        p.setTypeBudget(dto.getTypeBudget());
        p.setDeadline(dto.getDeadline());
        p.setDuree(dto.getDuree());
        p.setExperience(dto.getExperience());
        p.setVisibilite(dto.getVisibilite() != null ? dto.getVisibilite() : "Public");
        p.setLieu(dto.getLieu());
        p.setUrgent(dto.isUrgent());
        p.setStatut("Ouvert");
        p.setVues(0);
        p.setDatePublication(LocalDateTime.now());
        p.setCompetences(dto.getCompetences());
        p.setEntreprise(entreprise);

        return toDto(projetRepository.save(p));
    }

    public List<ProjetDto> getMesProjets(Long entrepriseId) {
        return projetRepository
                .findByEntrepriseIdOrderByDatePublicationDesc(entrepriseId)
                .stream().map(this::toDto).collect(Collectors.toList());
    }


    @Transactional(readOnly = true)
    public ProjetDto getProjet(Long projetId) {

        Projet p = projetRepository.findById(projetId)
                .orElseThrow(() ->
                        new RuntimeException("Projet introuvable"));

        return toDto(p);
    }
    @Transactional
    public void enregistrerVue(Long projetId, Long utilisateurId) {

        Projet projet = projetRepository.findById(projetId)
                .orElseThrow(() ->
                        new RuntimeException("Projet introuvable"));

        User utilisateur = userRepository.findById(utilisateurId)
                .orElseThrow(() ->
                        new RuntimeException("Utilisateur introuvable"));

        // Le propriétaire ne compte pas
        if (
                projet.getEntreprise() != null &&
                        projet.getEntreprise().getId().equals(utilisateurId)
        ) {
            return;
        }

        LocalDateTime maintenant = LocalDateTime.now();

        Optional<ProjetVue> vueExistante =
                projetVueRepository.findByProjetIdAndUtilisateurId(
                        projetId,
                        utilisateurId
                );

        if (vueExistante.isPresent()) {

            ProjetVue vue = vueExistante.get();

            // Consultation déjà comptabilisée durant les dernières 24h
            if (
                    vue.getDerniereVue()
                            .isAfter(maintenant.minusHours(24))
            ) {
                return;
            }

            // Nouvelle consultation après 24h
            vue.setDerniereVue(maintenant);
            projetVueRepository.save(vue);

            projet.setVues(projet.getVues() + 1);
            projetRepository.save(projet);

            return;
        }

        // Première consultation
        ProjetVue vue = new ProjetVue();

        vue.setProjet(projet);
        vue.setUtilisateur(utilisateur);
        vue.setDerniereVue(maintenant);

        projetVueRepository.save(vue);

        projet.setVues(projet.getVues() + 1);
        projetRepository.save(projet);
    }

    public ProjetDto modifierProjet(
            Long projetId,
            ProjetDto dto,
            Long entrepriseId
    ) {
        Projet p = projetRepository.findById(projetId)
                .orElseThrow(() -> new RuntimeException("Projet non trouvé"));

        if (p.getEntreprise() == null ||
                !p.getEntreprise().getId().equals(entrepriseId)) {

            throw new RuntimeException("Accès interdit à ce projet");
        }

        p.setTitre(dto.getTitre());
        p.setCategorie(dto.getCategorie());
        p.setDescription(dto.getDescription());
        p.setLivrable(dto.getLivrables());
        p.setBudget(dto.getBudget());
        p.setTypeBudget(dto.getTypeBudget());
        p.setDeadline(dto.getDeadline());
        p.setDuree(dto.getDuree());
        p.setExperience(dto.getExperience());
        p.setVisibilite(dto.getVisibilite());
        p.setLieu(dto.getLieu());
        p.setUrgent(dto.isUrgent());
        p.setCompetences(dto.getCompetences());

        return toDto(projetRepository.save(p));
    }

    public void supprimerProjet(Long projetId) {
        projetRepository.deleteById(projetId);
    }

    public ProjetDto changerStatut(Long projetId, String statut) {
        Projet p = projetRepository.findById(projetId)
                .orElseThrow(() -> new RuntimeException("Projet non trouvé"));
        p.setStatut(statut);
        return toDto(projetRepository.save(p));
    }

    // ── STATS PROJET ─────────────────────────────────────

    public Map<String, Object> getStatsProjet(Long projetId) {
        Projet p = projetRepository.findById(projetId)
                .orElseThrow(() -> new RuntimeException("Projet non trouvé"));

        int candidatures = candidatureRepository.findByProjetId(projetId).size();

        // Calculer jours restants
        long joursRestants = 0;
        if (p.getDeadline() != null && !p.getDeadline().isEmpty()) {
            try {
                java.time.LocalDate deadline = java.time.LocalDate.parse(p.getDeadline());
                joursRestants = java.time.temporal.ChronoUnit.DAYS.between(
                        java.time.LocalDate.now(), deadline);
            } catch (Exception ignored) {}
        }

        Map<String, Object> stats = new HashMap<>();
        stats.put("vues", p.getVues());
        stats.put("candidatures", candidatures);
        stats.put("joursRestants", joursRestants);
        stats.put("statut", p.getStatut());
        return stats;
    }

    // ── STATS DASHBOARD ENTREPRISE ───────────────────────

    public Map<String, Object> getStatsDashboard(Long entrepriseId) {
        List<Projet> projets = projetRepository
                .findByEntrepriseIdOrderByDatePublicationDesc(entrepriseId);

        long projetsActifs = projets.stream()
                .filter(p -> "Ouvert".equals(p.getStatut()) ||
                        "En cours".equals(p.getStatut())).count();

        long totalCandidatures = projets.stream()
                .mapToLong(p -> candidatureRepository.findByProjetId(p.getId()).size())
                .sum();

        Map<String, Object> stats = new HashMap<>();
        stats.put("projetsActifs", projetsActifs);
        stats.put("totalProjets", projets.size());
        stats.put("totalCandidatures", totalCandidatures);
        return stats;
    }

    // ── CANDIDATURES D'UN PROJET ─────────────────────────

    public List<Candidaturedto> getCandidaturesProjet(Long projetId) {
        return candidatureRepository.findByProjetId(projetId)
                .stream().map(this::toCandidatureDto)
                .collect(Collectors.toList());
    }

    public Candidaturedto changerStatutCandidature(Long candidatureId, String statut) {
        Candidature c = candidatureRepository.findById(candidatureId)
                .orElseThrow(() -> new RuntimeException("Candidature non trouvée"));

        c.setStatus(com.example.demo.Enum.StatusCandidature.valueOf(statut));
        return toCandidatureDto(candidatureRepository.save(c));
    }

    // ── PROJETS PUBLICS (pour freelancers) ───────────────

    public List<ProjetDto> getProjetsPublics(String search, String categorie) {
        List<Projet> projets;

        if (search != null && !search.isEmpty()) {
            projets = projetRepository
                    .findByTitreContainingIgnoreCaseAndStatut(search, "Ouvert");
        } else if (categorie != null && !categorie.isEmpty()) {
            projets = projetRepository
                    .findByCategorieAndStatut(categorie, "Ouvert");
        } else {
            projets = projetRepository
                    .findByVisibiliteAndStatutOrderByDatePublicationDesc("Public", "Ouvert");
        }
        return projets.stream().map(this::toDto).collect(Collectors.toList());
    }

    // ── MAPPERS ──────────────────────────────────────────

    private ProjetDto toDto(Projet p) {
        ProjetDto dto = new ProjetDto();
        dto.setId(p.getId());
        dto.setTitre(p.getTitre());
        dto.setCategorie(p.getCategorie());
        dto.setDescription(p.getDescription());
        dto.setLivrables(p.getLivrable());
        dto.setBudget(p.getBudget());
        dto.setTypeBudget(p.getTypeBudget());
        dto.setDeadline(p.getDeadline());
        dto.setDuree(p.getDuree());
        dto.setExperience(p.getExperience());
        dto.setVisibilite(p.getVisibilite());
        dto.setLieu(p.getLieu());
        dto.setUrgent(p.isUrgent());
        dto.setStatut(p.getStatut());
        dto.setVues(p.getVues());
        dto.setDatePublication(p.getDatePublication());
        dto.setCompetences(p.getCompetences());
        dto.setNombreCandidatures(
                candidatureRepository.findByProjetId(p.getId()).size());
        if (p.getEntreprise() != null) {
            dto.setEntrepriseId(p.getEntreprise().getId());
            dto.setEntrepriseNom(p.getEntreprise().getNomEntreprise());
        }
        return dto;
    }


    private Candidaturedto toCandidatureDto(Candidature c) {
        Candidaturedto dto = new Candidaturedto();
        dto.setId(c.getId());
        dto.setStatus(c.getStatus().name());
        dto.setDate(c.getDate());
        dto.setDateFin(c.getDateFin());
        dto.setMontantFinal(c.getMontantFinal());
        dto.setNote(c.getNote());
        dto.setCommentaireEntreprise(c.getCommentaireEntreprise());

        // ✅ Infos projet
        if (c.getProjet() != null) {
            dto.setProjetId(c.getProjet().getId());
            dto.setProjetTitre(c.getProjet().getTitre());
        }

        // ✅ Infos freelancer
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
}