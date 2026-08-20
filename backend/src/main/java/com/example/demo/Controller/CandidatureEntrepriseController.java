package com.example.demo.Controller;

import com.example.demo.Dto.Candidaturedto;
import com.example.demo.Dto.UserPrincipal;
import com.example.demo.Enum.StatusCandidature;
import com.example.demo.service.CandidatureEntrepriseService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/entreprise/candidatures")
@CrossOrigin(origins = "http://localhost:5173")
public class CandidatureEntrepriseController {

    private final CandidatureEntrepriseService service;

    public CandidatureEntrepriseController(
            CandidatureEntrepriseService service
    ) {
        this.service = service;
    }


    // =========================================================
    // TOUTES LES CANDIDATURES
    // =========================================================

    @GetMapping
    public ResponseEntity<List<Candidaturedto>> getCandidatures(
            @AuthenticationPrincipal UserPrincipal principal
    ) {

        if (principal == null) {
            return ResponseEntity.status(401).build();
        }

        Long entrepriseId =
                principal.getEntrepriseId();

        if (entrepriseId == null) {
            return ResponseEntity.status(403).build();
        }

        return ResponseEntity.ok(
                service.getCandidatures(entrepriseId)
        );
    }


    // =========================================================
    // FILTRE PAR STATUS
    // =========================================================

    @GetMapping("/status/{status}")
    public ResponseEntity<List<Candidaturedto>> getByStatus(
            @PathVariable StatusCandidature status,
            @AuthenticationPrincipal UserPrincipal principal
    ) {

        if (principal == null) {
            return ResponseEntity.status(401).build();
        }

        Long entrepriseId =
                principal.getEntrepriseId();

        if (entrepriseId == null) {
            return ResponseEntity.status(403).build();
        }

        return ResponseEntity.ok(
                service.getCandidaturesByStatut(
                        entrepriseId,
                        status
                )
        );
    }


    // =========================================================
    // CHANGER STATUS
    // =========================================================

    @PatchMapping("/{candidatureId}/status")
    public ResponseEntity<Candidaturedto> changerStatus(
            @PathVariable Long candidatureId,
            @RequestParam StatusCandidature status,
            @AuthenticationPrincipal UserPrincipal principal
    ) {

        if (principal == null) {
            return ResponseEntity.status(401).build();
        }

        Long entrepriseId =
                principal.getEntrepriseId();

        if (entrepriseId == null) {
            return ResponseEntity.status(403).build();
        }

        return ResponseEntity.ok(
                service.changerStatut(
                        entrepriseId,
                        candidatureId,
                        status
                )
        );
    }
}