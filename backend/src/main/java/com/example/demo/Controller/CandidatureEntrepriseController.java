package com.example.demo.Controller;

import com.example.demo.Dto.Candidaturedto;
import com.example.demo.Dto.MissionNotationDto;
import com.example.demo.Dto.NoteRequest;
import com.example.demo.Dto.UserPrincipal;
import com.example.demo.Enum.StatusCandidature;
import com.example.demo.repository.CandidatureRepository;
import com.example.demo.service.CandidatureEntrepriseService;

import com.example.demo.service.CandidatureService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/entreprise/candidatures")
@CrossOrigin(origins = {
    "http://localhost:5173",
    "https://free-kaolo-1-0.onrender.com"
})
public class CandidatureEntrepriseController {

    private final CandidatureEntrepriseService service;
private final CandidatureService cand;
private final CandidatureRepository  candidatureRepository;

    public CandidatureEntrepriseController(CandidatureEntrepriseService service, CandidatureService cand, CandidatureRepository candidatureRepository) {
        this.service = service;
        this.cand = cand;
        this.candidatureRepository = candidatureRepository;
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
    @PostMapping("/{id}/note")
    public ResponseEntity<Candidaturedto> noter(
            @PathVariable Long id,
            @Valid @RequestBody NoteRequest req,
            @AuthenticationPrincipal UserPrincipal user
    ) {
        return ResponseEntity.ok(
                cand.noterFreelance(id, req.note(), req.commentaire(), user)
        );
    }
    @GetMapping("/terminees")
    public List<MissionNotationDto> terminees(
            @AuthenticationPrincipal UserPrincipal user) {

        if (user.getEntrepriseId() == null) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Réservé aux entreprises"
            );
        }

        return candidatureRepository
                .findMissionsTerminees(user.getEntrepriseId())
                .stream()
                .filter(c -> c.getFreelancer() != null)
                .filter(c -> c.getProjet() != null)
                .map(c -> new MissionNotationDto(
                        c.getId(),
                        c.getFreelancer().getId(),
                        c.getFreelancer().getPrenom()
                                + " "
                                + c.getFreelancer().getNom(),
                        c.getProjet().getTitre(),
                        c.getDateFin(),
                        c.getNote(),
                        c.getCommentaireEntreprise()
                ))
                .toList();
    }
}
