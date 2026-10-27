package com.example.demo.Controller;

import com.example.demo.Dto.*;
import com.example.demo.Enum.Role;
import com.example.demo.entity.*;
import com.example.demo.repository.*;
import com.example.demo.service.CandidatureService;
import com.example.demo.service.FreelancerProfilService;
import com.example.demo.service.FreelancerSpecifications;
import com.example.demo.service.Freelancerservice;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = {
    "http://localhost:5173",
    "https://free-kaolo-1-3.onrender.com"
})
@RequestMapping("/api/freelancer")
public class freelancerController {

    @Autowired private Freelancerservice prestataireService;
    @Autowired FreelancerProfilService service;
    @Autowired private CandidatureService candidatureService;
    @Autowired private NotificationRepository notificationRepository;
    @Autowired private PortfolioRepository portfolioRepository;
    @Autowired private freelancerRepository freelancerRepository;


    /* ============================================================
       ESPACE FREELANCER CONNECTÉ — routes /me/**
       (identité résolue via le JWT, jamais via un id dans l'URL)
       ============================================================ */

    /**
     * Détail complet du freelancer connecté.
     * Appelé par la Navbar et les pages de profil.
     */
    @GetMapping("/me/detail")
    @Transactional
    public ResponseEntity<Map<String, Object>> getMyDetail(
            @AuthenticationPrincipal UserPrincipal principal) {

        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        if (principal.getRole() != Role.FREELANCER) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        Freelancer f = prestataireService.getByUserId(principal.getId());
        if (f == null) {
            return ResponseEntity.notFound().build();
        }

        List<ProjetPortfolio> portfolio =
                portfolioRepository.findByFreelancerIdOrderByAnneeDesc(f.getId());

        Map<String, Object> result = new HashMap<>();
        result.put("id",              f.getId());
        result.put("userId",          f.getUser().getId());
        result.put("nom",             f.getNom());
        result.put("prenom",          f.getPrenom());
        result.put("specialite",      f.getSpecialite());
        result.put("description",     f.getDescription());
        result.put("competences",     f.getCompetence());
        result.put("tarifJournalier", f.getTarifJournalier());
        result.put("experience",      f.getExperience());
        result.put("ville",           f.getVille());
        result.put("pays",            f.getPays());
        result.put("github",          f.getGithub());
        result.put("linkedin",        f.getLinkedin());
        result.put("siteweb",         f.getSiteweb());
        result.put("disponibilite",   f.getDisponibilite());
        result.put("photoUrl",        f.getPhotoUrl());
        result.put("noteMoyenne",     f.getNoteMoyenne());
        result.put("nombreAvis",      f.getNombreAvis());
        result.put("portfolio",       portfolio);
        result.put("avis",            List.of());
        result.put("stats", Map.of(
                "totalProjets",      0,
                "tauxSucces",        0,
                "tauxPonctualite",   0,
                "nombreRepetitions", 0
        ));
        return ResponseEntity.ok(result);
    }


    @GetMapping("/me/notifications")
    public ResponseEntity<List<NotificationDto>> getMyNotifications(
            @AuthenticationPrincipal UserPrincipal principal) {

        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        List<Notification> notifications =
                notificationRepository.findByUserIdOrderByDateDesc(principal.getId());

        List<NotificationDto> dto = notifications.stream()
                .map(NotificationDto::new)
                .toList();

        return ResponseEntity.ok(dto);
    }

    /** Marquer une notification comme lue. */
    @PutMapping("/me/notifications/{notificationId}/lue")
    public ResponseEntity<Void> marquerLue(@PathVariable Long notificationId) {
        Notification n = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification non trouvée"));
        n.setLu(true);
        notificationRepository.save(n);
        return ResponseEntity.ok().build();
    }

    /** Stats dashboard du freelancer connecté. */
    @GetMapping("/me/stats")
    public ResponseEntity<Map<String, Object>> getMyStats(
            @AuthenticationPrincipal UserPrincipal principal) {

        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        if (principal.getRole() != Role.FREELANCER) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        List<Candidaturedto> candidatures = candidatureService.getAll(principal.getId());

        long total     = candidatures.size();
        long acceptees = candidatures.stream().filter(c -> "ACCEPTEE".equals(c.getStatus())).count();
        long enCours   = candidatures.stream().filter(c -> "EN_COURS".equals(c.getStatus())).count();
        long enAttente = candidatures.stream().filter(c -> "EN_ATTENTE".equals(c.getStatus())).count();

        Freelancer f = prestataireService.getByUserId(principal.getId());

        int completion = f != null
                ? f.getCompletudeProfil()
                : 0;
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalCandidatures",    total);
        stats.put("candidaturesAcceptees", acceptees);
        stats.put("candidaturesEnCours",  enCours);
        stats.put("candidaturesEnAttente", enAttente);
        stats.put("noteMoyenne",          f != null ? f.getNoteMoyenne() : 0);
        stats.put("vuesProfil",           f != null ? f.getVues() : 0);
        stats.put("gainsMoisCourant",     0);
        stats.put("completionProfil",     completion);
        stats.put("gainsMensuels",        List.of());
        stats.put("candidaturesParMois",  List.of());

        return ResponseEntity.ok(stats);
    }

    /* ============================================================
       ROUTES PUBLIQUES — profils consultables par tous les rôles
       ============================================================ */

    /** Liste de tous les freelancers (recherche entreprise).
    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAllPrestataires() {
        List<Freelancer> freelancers = freelancerRepository.findAll();
        List<Map<String, Object>> result = freelancers.stream().map(f -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id",              f.getId());
            map.put("userId",          f.getUser().getId());
            map.put("nom",             f.getNom());
            map.put("prenom",          f.getPrenom());
            map.put("specialite",      f.getSpecialite());
            map.put("noteMoyenne",     f.getNoteMoyenne());
            map.put("nombreAvis",      f.getNombreAvis());
            map.put("tarifJournalier", f.getTarifJournalier());
            map.put("ville",           f.getVille());
            map.put("experience",      f.getExperience());
            map.put("competences",     f.getCompetence());
            map.put("certified",       false);
            map.put("disponibilite",   f.getDisponibilite());
            map.put("nombreProjets",   0);
            map.put("photoUrl",        f.getPhotoUrl());
            return map;
        }).toList();
        return ResponseEntity.ok(result);
    }*/

    /** Détail public d'un freelancer (vue entreprise). Utilise l'id Freelancer, pas userId. */
    @GetMapping("/{id}/detail")
    @Transactional
    public ResponseEntity<Map<String, Object>> getDetail(@PathVariable Long id) {
        Freelancer f = freelancerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Freelancer non trouvé"));

        List<ProjetPortfolio> portfolio =
                portfolioRepository.findByFreelancerIdOrderByAnneeDesc(f.getId());

        Map<String, Object> result = new HashMap<>();
        result.put("id",              f.getId());
        result.put("userId",          f.getUser().getId());
        result.put("nom",             f.getNom());
        result.put("prenom",          f.getPrenom());
        result.put("specialite",      f.getSpecialite());
        result.put("description",     f.getDescription());
        result.put("competences",     f.getCompetence());
        result.put("tarifJournalier", f.getTarifJournalier());
        result.put("experience",      f.getExperience());
        result.put("ville",           f.getVille());
        result.put("pays",            f.getPays());
        result.put("github",          f.getGithub());
        result.put("linkedin",        f.getLinkedin());
        result.put("siteweb",         f.getSiteweb());
        result.put("disponibilite",   f.getDisponibilite());
        result.put("photoUrl",        f.getPhotoUrl());
        result.put("noteMoyenne",     f.getNoteMoyenne());
        result.put("nombreAvis",      f.getNombreAvis());
        result.put("portfolio",       portfolio);
        result.put("avis",            List.of());
        result.put("stats", Map.of(
                "totalProjets",      0,
                "tauxSucces",        0,
                "tauxPonctualite",   0,
                "nombreRepetitions", 0
        ));
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{id}/portfolio")
    public ResponseEntity<List<ProjetPortfolio>> getPortfolio(@PathVariable Long id) {
        Freelancer f = prestataireService.getByUserId(id);
        if (f == null) return ResponseEntity.ok(List.of());
        return ResponseEntity.ok(portfolioRepository.findByFreelancerIdOrderByAnneeDesc(f.getId()));
    }

    /* ============================================================
       ADMINISTRATION — routes /{id}/**
       À restreindre à ADMIN dans SecurityConfig.
       ============================================================ */

    @PostMapping
    public ResponseEntity<Freelancer> create(@RequestBody @Valid freelancerDto dto) {
        Freelancer created = prestataireService.create(dto);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Freelancer> update(@PathVariable Long id, @RequestBody @Valid freelancerDto dto) {
        Freelancer updated = prestataireService.update(id, dto);
        return ResponseEntity.ok(updated);
    }

    @PutMapping("/{id}/desactiver")
    public ResponseEntity<String> desactiver(@PathVariable Long id) {
        prestataireService.desactiverCompte(id);
        return ResponseEntity.ok("Compte désactivé");
    }

    @PutMapping("/{id}/activer")
    public ResponseEntity<String> activer(@PathVariable Long id) {
        prestataireService.activerCompte(id);
        return ResponseEntity.ok("Compte activé");
    }

    @PostMapping("/{id}/portfolio")
    public ResponseEntity<ProjetPortfolio> addPortfolio(
            @PathVariable Long id,
            @RequestBody ProjetPortfolio portfolio) {
        Freelancer f = prestataireService.getByUserId(id);
        portfolio.setFreelancer(f);
        return ResponseEntity.ok(portfolioRepository.save(portfolio));
    }

    @PutMapping("/portfolio/{portfolioId}")
    public ResponseEntity<ProjetPortfolio> updatePortfolio(
            @PathVariable Long portfolioId,
            @RequestBody ProjetPortfolio data) {
        ProjetPortfolio p = portfolioRepository.findById(portfolioId)
                .orElseThrow(() -> new RuntimeException("Portfolio non trouvé"));
        p.setTitre(data.getTitre());
        p.setDescription(data.getDescription());
        p.setTechnologies(data.getTechnologies());
        p.setCategorie(data.getCategorie());
        p.setAnnee(data.getAnnee());
        p.setEmoji(data.getEmoji());
        p.setCouleur(data.getCouleur());
        p.setFeatured(data.isFeatured());
        return ResponseEntity.ok(portfolioRepository.save(p));
    }

    @DeleteMapping("/portfolio/{portfolioId}")
    public ResponseEntity<Void> deletePortfolio(@PathVariable Long portfolioId) {
        portfolioRepository.deleteById(portfolioId);
        return ResponseEntity.ok().build();
    }

    /* ============================================================
       HELPERS PRIVÉS
       ============================================================ */



    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> search(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String categorie,
            @RequestParam(required = false) String ville,
            @RequestParam(required = false) Double minTarif,
            @RequestParam(required = false) Double maxTarif,
            @RequestParam(required = false) Boolean certified,
            @RequestParam(required = false) Boolean disponible,
            @RequestParam(required = false) String competences
    ) {
        List<String> competencesList = (competences != null && !competences.isBlank())
                ? Arrays.asList(competences.split(","))
                : null;

        List<Freelancer> freelancers = freelancerRepository.findAll(
                FreelancerSpecifications.withFilters(
                        search, categorie, ville, minTarif, maxTarif, disponible, competencesList
                )
        );

        List<Map<String, Object>> result = freelancers.stream().map(f -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id",              f.getId());
            map.put("userId",          f.getUser().getId());
            map.put("nom",             f.getNom());
            map.put("prenom",          f.getPrenom());
            map.put("specialite",      f.getSpecialite());
            map.put("noteMoyenne",     f.getNoteMoyenne());
            map.put("nombreAvis",      f.getNombreAvis());
            map.put("tarifJournalier", f.getTarifJournalier());
            map.put("ville",           f.getVille());
            map.put("experience",      f.getExperience());
            map.put("competences",     f.getCompetence());
            map.put("certified",       false); // pas de champ dédié en base — voir remarque plus bas
            map.put("disponibilite",   f.getDisponibilite());
            map.put("nombreProjets",   0);
            map.put("photoUrl",        f.getPhotoUrl());
            return map;
        }).toList();
        return ResponseEntity.ok(result);
    }
    @PutMapping("/{id}/completion")
    public ResponseEntity<Integer> updateCompletion(
            @PathVariable Long id,
            @RequestBody CompletionRequest request
    ) {

        if (request == null || request.completion() == null) {
            return ResponseEntity.badRequest().build();
        }

        int completion = request.completion();

        if (completion < 0 || completion > 100) {
            return ResponseEntity.badRequest().build();
        }

        Freelancer freelancer = freelancerRepository
                .findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Freelancer introuvable : " + id
                        )
                );

        freelancer.setCompletudeProfil(completion);

        freelancerRepository.save(freelancer);

        return ResponseEntity.ok(
                freelancer.getCompletudeProfil()
        );
    }
}
