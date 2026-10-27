package com.example.demo.Controller;



import com.example.demo.Dto.AvisDto;
import com.example.demo.Dto.Candidaturedto;
import com.example.demo.Dto.NotationRequest;
import com.example.demo.Dto.UserPrincipal;
import com.example.demo.service.CandidatureService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.lang.Long;
import java.util.Map;

@RestController
@RequestMapping("/api/freelancer/candidatures")
@CrossOrigin(origins = {
    "http://localhost:5173",
    "https://free-kaolo-1-0.onrender.com"
})
public class CandidatureController {

    private final CandidatureService candidatureService;

    public CandidatureController(CandidatureService candidatureService) {
        this.candidatureService = candidatureService;
    }

    @PostMapping("/postuler/{freelancerId}/{projetId}")
    public ResponseEntity<Candidaturedto> postuler(
            @PathVariable Long freelancerId,
            @PathVariable Long projetId) {
        return ResponseEntity.ok(candidatureService.postuler(freelancerId, projetId));
    }

    @GetMapping("/recentes/{freelancerId}")
    public ResponseEntity<List<Candidaturedto>> getRecentes(@PathVariable Long freelancerId) {
        return ResponseEntity.ok(candidatureService.getRecentes(freelancerId));
    }

    @GetMapping("/{freelancerId}")
    public ResponseEntity<List<Candidaturedto>> getAll(@PathVariable Long freelancerId) {
        return ResponseEntity.ok(candidatureService.getAll(freelancerId));
    }

    @GetMapping("/{id}/projets-historique")
    public ResponseEntity<List<Candidaturedto>> getHistorique(
            @PathVariable Long id,
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(candidatureService.getHistorique(id, status));
    }

    @GetMapping("/{id}/stats")
    public ResponseEntity<Map<String, Object>> getStats(@PathVariable Long id) {
        return ResponseEntity.ok(candidatureService.getStatsProjet(id));
    }
    @PutMapping("/{id}/avis")
    public ResponseEntity<Candidaturedto> noter(
            @PathVariable Long id,
            @RequestBody NotationRequest request,     @AuthenticationPrincipal UserPrincipal user) {
        return ResponseEntity.ok(candidatureService.noterFreelance(id, request.getNote(), request.getCommentaire(),user));
    }
    @GetMapping("/{id}/avis")
    public ResponseEntity<List<AvisDto>> getAvis(@PathVariable Long id) {
        return ResponseEntity.ok(candidatureService.getAvis(id));
    }
}
