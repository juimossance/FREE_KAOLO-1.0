package com.example.demo.Controller;


import com.example.demo.Dto.Candidaturedto;
import com.example.demo.Dto.ProjetDto;
import com.example.demo.Dto.UserPrincipal;
import com.example.demo.entity.Projet;
import com.example.demo.service.ProjetEntrepriseService;
import com.example.demo.service.Projetservice;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/projets")
@CrossOrigin(origins = "http://localhost:5173")
public class ProjetController {

    private final ProjetEntrepriseService service;
private  final Projetservice projetService;

    public ProjetController(ProjetEntrepriseService service, Projetservice projetService) {
        this.service = service;
        this.projetService = projetService;


    }

    // ── PROJETS ENTREPRISE ───────────────────────────────

    @PostMapping("/{id}/projets")
    public ResponseEntity<ProjetDto> publierProjet(
            @PathVariable Long id,
            @RequestBody ProjetDto dto) {

        return ResponseEntity.ok(service.publierProjet(id, dto));
    }
    @GetMapping("/me")
    public ResponseEntity<List<ProjetDto>> getMesProjets(
            Authentication authentication
    ) {
        UserPrincipal principal =
                (UserPrincipal) authentication.getPrincipal();

        Long entrepriseId = principal.getEntrepriseId();

        if (entrepriseId == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        return ResponseEntity.ok(
                service.getMesProjets(entrepriseId)
        );
    }
    @GetMapping("/{id}/projets")
    public ResponseEntity<List<ProjetDto>> getMesProjets(@PathVariable Long id) {
        return ResponseEntity.ok(service.getMesProjets(id));
    }
    

    @GetMapping("/projets/{projetId}")
    public ResponseEntity<ProjetDto> getProjet(@PathVariable Long projetId) {
        return ResponseEntity.ok(service.getProjet(projetId));
    }


    @PostMapping("/{id}/view")
    public ResponseEntity<Void> enregistrerVue(
            @PathVariable Long id,
            Authentication authentication
    ) {

        UserPrincipal principal =
                (UserPrincipal) authentication.getPrincipal();

        Long utilisateurId = principal.getId();

        service.enregistrerVue(id, utilisateurId);

        return ResponseEntity.noContent().build();
    }
    @DeleteMapping("/projets/{projetId}")
    public ResponseEntity<Void> supprimerProjet(@PathVariable Long projetId) {
        service.supprimerProjet(projetId);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/projets/{projetId}/statut")
    public ResponseEntity<ProjetDto> changerStatut(
            @PathVariable Long projetId,
            @RequestParam String statut) {
        return ResponseEntity.ok(service.changerStatut(projetId, statut));
    }

    @GetMapping("/projets/{projetId}/stats")
    public ResponseEntity<Map<String, Object>> getStatsProjet(
            @PathVariable Long projetId) {
        return ResponseEntity.ok(service.getStatsProjet(projetId));
    }

    @GetMapping("/{id}/stats")
    public ResponseEntity<Map<String, Object>> getStatsDashboard(
            @PathVariable Long id) {
        return ResponseEntity.ok(service.getStatsDashboard(id));
    }

    // ── CANDIDATURES ─────────────────────────────────────

    @GetMapping("/projets/{projetId}/candidatures")
    public ResponseEntity<List<Candidaturedto>> getCandidatures(
            @PathVariable Long projetId) {
        return ResponseEntity.ok(service.getCandidaturesProjet(projetId));
    }

    @PutMapping("/candidatures/{candidatureId}/statut")
    public ResponseEntity<Candidaturedto> changerStatutCandidature(
            @PathVariable Long candidatureId,
            @RequestParam String statut) {
        return ResponseEntity.ok(service.changerStatutCandidature(candidatureId, statut));
    }

    // ── PROJETS PUBLICS (freelancers) ────────────────────

    @GetMapping
    public ResponseEntity<List<ProjetDto>> getProjetsPublics(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String categorie) {
        return ResponseEntity.ok(service.getProjetsPublics(search, categorie));
    }
    @PostMapping("/candidatures/confirmer")
    public ResponseEntity<Void> confirmerSelection(@RequestBody Map<String, List<Long>> body) {
        List<Long> candidatureIds = body.get("candidatureIds");
        if (candidatureIds != null) {
            candidatureIds.forEach(id ->
                    service.changerStatutCandidature(id, "ACCEPTEE")
            );
        }
        return ResponseEntity.ok().build();
    }
    @PutMapping("/projets/{projetId}")
    public ResponseEntity<ProjetDto> modifierProjet(
            @PathVariable Long projetId,
            @RequestBody ProjetDto dto,
            Authentication authentication) {

        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();

        Long entrepriseId = principal.getEntrepriseId();

        if (entrepriseId == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        return ResponseEntity.ok(
                service.modifierProjet(projetId, dto, entrepriseId)
        );
    }

}