package com.example.demo.Controller;

import com.example.demo.Dto.UserPrincipal;
import com.example.demo.Dto.entrepriseDto;
import com.example.demo.Enum.Role;
import com.example.demo.Enum.StatusCandidature;
import com.example.demo.entity.Candidature;
import com.example.demo.entity.Entreprise;
import com.example.demo.entity.User;
import com.example.demo.repository.CandidatureRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.repository.entrepriseRepository;
import com.example.demo.repository.freelancerRepository;
import com.example.demo.service.entrepriseservice;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Contrôleur REST pour les entreprises.
 *
 * IMPORTANT — deux familles de routes ici :
 *  - Routes /me/**      : données de l'entreprise CONNECTÉE, résolues via le JWT
 *                          (UserPrincipal), jamais via un id fourni par le client.
 *  - Routes /{id}/**     : routes d'administration (gestion des comptes), à
 *                          restreindre à ADMIN dans SecurityConfig — ne pas les
 *                          utiliser depuis l'espace entreprise du frontend.
 */
@RestController
@CrossOrigin(origins = "http://localhost:5173")
@RequestMapping("/api/entreprise")
public class entrepriseController {

    private final freelancerRepository prestatairerepository;
    private final entrepriseRepository entrepriseRepository;
    private final CandidatureRepository candidatureRepository;

    public entrepriseController(freelancerRepository prestatairerepository, entrepriseRepository entrepriseRepository, CandidatureRepository candidatureRepository) {
        this.prestatairerepository = prestatairerepository;
        this.entrepriseRepository = entrepriseRepository;
        this.candidatureRepository = candidatureRepository;
    }

    @Autowired
    private entrepriseservice Service;
    @Autowired
    private UserRepository repository;

    /* ============================================================
       ESPACE ENTREPRISE CONNECTÉE — routes /me/**
       ============================================================ */

    @GetMapping("/me/profil")
    public ResponseEntity<Map<String, Object>> getMyProfil(@AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        if (principal.getRole() != Role.ENTREPRISE) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        Entreprise e = entrepriseRepository.findByUserId(principal.getId())
                .orElseThrow(() -> new RuntimeException("Entreprise non trouvée"));

        Map<String, Object> result = new HashMap<>();
        result.put("nomEntreprise", e.getNomEntreprise());
        result.put("responsable",   e.getResponsable());
        result.put("secteur",       e.getSecteur());
        result.put("ville",         e.getVille());
        result.put("adresse",       e.getAdresse());
        result.put("siteweb",       e.getSiteweb());
        return ResponseEntity.ok(result);
    }

    @GetMapping("/me/recrutements")
    public ResponseEntity<List<Map<String, Object>>> getMyRecrutements(@AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        if (principal.getRole() != Role.ENTREPRISE) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        Entreprise e = entrepriseRepository.findByUserId(principal.getId())
                .orElseThrow(() -> new RuntimeException("Entreprise non trouvée"));

        List<Candidature> candidatures = candidatureRepository
                .findByProjetEntrepriseIdAndStatusIn(
                        e.getId(),
                        List.of(StatusCandidature.ACCEPTEE, StatusCandidature.EN_COURS, StatusCandidature.EN_ATTENTE)
                );

        List<Map<String, Object>> result = candidatures.stream().map(c -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id",               c.getId());
            map.put("candidatureId",    c.getId());
            map.put("projetTitre",      c.getProjet().getTitre());
            map.put("projetCategorie",  c.getProjet().getCategorie());
            map.put("freelancerNom",    c.getFreelancer().getNom());
            map.put("freelancerPrenom", c.getFreelancer().getPrenom());
            map.put("dateDebut",        c.getDate());
            map.put("dateFin",          c.getDateFin());
            map.put("montant",          c.getMontantFinal() != null
                    ? c.getMontantFinal()
                    : c.getProjet().getBudget());
            map.put("note",             c.getNote());
            map.put("commentaire",      c.getCommentaireEntreprise());
            map.put("status",           c.getStatus().name());
            return map;
        }).toList();

        return ResponseEntity.ok(result);
    }

    @GetMapping("/me/recrutements/stats")
    public ResponseEntity<Map<String, Object>> getMyStatsRecrutements(@AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        if (principal.getRole() != Role.ENTREPRISE) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        Entreprise e = entrepriseRepository.findByUserId(principal.getId())
                .orElseThrow(() -> new RuntimeException("Entreprise non trouvée"));

        List<Candidature> candidatures = candidatureRepository
                .findByProjetEntrepriseId(e.getId());

        long termines = candidatures.stream()
                .filter(c -> c.getStatus() == StatusCandidature.ACCEPTEE).count();

        double noteMoy = candidatures.stream()
                .filter(c -> c.getNote() != null && c.getNote() > 0)
                .mapToInt(Candidature::getNote)
                .average().orElse(0.0);

        double totalDepense = candidatures.stream()
                .filter(c -> c.getStatus() == StatusCandidature.ACCEPTEE)
                .mapToDouble(c -> c.getMontantFinal() != null
                        ? c.getMontantFinal() : 0)
                .sum();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalRecrutements",  candidatures.size());
        stats.put("projetsTermines",    termines);
        stats.put("noteMoyenneDonnee",  noteMoy);
        stats.put("totalDepense",       totalDepense);

        return ResponseEntity.ok(stats);
    }

    @GetMapping("/me/candidatures")
    public ResponseEntity<List<Map<String, Object>>> getMyCandidatures(@AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        if (principal.getRole() != Role.ENTREPRISE) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        Entreprise e = entrepriseRepository.findByUserId(principal.getId())
                .orElseThrow(() -> new RuntimeException("Entreprise non trouvée"));

        List<Candidature> candidatures = candidatureRepository
                .findByProjetEntrepriseId(e.getId());

        List<Map<String, Object>> result = candidatures.stream().map(c -> {
            Map<String, Object> m = new HashMap<>();
            m.put("id",                    c.getId());
            m.put("freelancerId",          c.getFreelancer().getId());
            m.put("freelancerNom",         c.getFreelancer().getNom());
            m.put("freelancerPrenom",      c.getFreelancer().getPrenom());
            m.put("freelancerSpecialite",  c.getFreelancer().getSpecialite());
            m.put("freelancerRating",      c.getFreelancer().getNoteMoyenne());
            m.put("freelancerNbAvis",      c.getFreelancer().getNombreAvis());
            m.put("freelancerCompetences", c.getFreelancer().getCompetence());
            m.put("projetId",              c.getProjet().getId());
            m.put("projetTitre",           c.getProjet().getTitre());
            m.put("montantPropose",        c.getMontantFinal());
            m.put("lettreDemotivation",    c.getCommentaireEntreprise());
            m.put("status",                c.getStatus().name());
            m.put("date",                  c.getDate());
            return m;
        }).toList();

        return ResponseEntity.ok(result);
    }

    /* ============================================================
       ADMINISTRATION — routes /{id}/** (à restreindre à ADMIN
       dans SecurityConfig ; ne pas appeler depuis l'espace entreprise)
       ============================================================ */

    @PostMapping
    public ResponseEntity<Entreprise> create(@RequestBody @Valid entrepriseDto dto) {
        Entreprise created = Service.create(dto);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @GetMapping
    public List<User> getAllEntreprises() {
        return repository.findByRole(Role.ENTREPRISE);
    }

    @GetMapping("/{id}")
    public User getEntrepriseById(@PathVariable Long id) {
        return repository.findByIdAndRole(id, Role.ENTREPRISE)
                .orElseThrow(() -> new RuntimeException("Entreprise non trouvée"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Entreprise> update(@PathVariable Long id, @RequestBody @Valid entrepriseDto dto) {
        Entreprise updated = Service.update(id, dto);
        return ResponseEntity.ok(updated);
    }

    @PutMapping("/{id}/desactiver")
    public ResponseEntity<String> desactiver(@PathVariable Long id) {
        Service.desactiverCompte(id);
        return ResponseEntity.ok("Compte désactivé");
    }

    @PutMapping("/{id}/activer")
    public ResponseEntity<String> activer(@PathVariable Long id) {
        Service.activerCompte(id);
        return ResponseEntity.ok("Compte activé");
    }
}