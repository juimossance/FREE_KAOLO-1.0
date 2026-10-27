package com.example.demo.Controller;

import com.example.demo.Dto.*;
import com.example.demo.service.PaiementPortfolioService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/freelancer-paiement")
@CrossOrigin(origins = {
    "http://localhost:5173",
    "https://free-kaolo-1-0.onrender.com"
})
public class PaiementPortfolioController {

    private final PaiementPortfolioService service;

    public PaiementPortfolioController(PaiementPortfolioService service) {
        this.service = service;
    }

    // ── PAIEMENTS ────────────────────────────────────────

    @GetMapping("/{id}/solde")
    public ResponseEntity<Map<String, Object>> getSolde(@PathVariable Long id) {
        return ResponseEntity.ok(service.getSolde(id));
    }

    @GetMapping("/{id}/transactions")
    public ResponseEntity<List<TransactionDto>> getTransactions(
            @PathVariable Long id,
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(service.getTransactions(id, search));
    }

    @GetMapping("/{id}/factures")
    public ResponseEntity<List<TransactionDto>> getFactures(@PathVariable Long id) {
        return ResponseEntity.ok(service.getFactures(id));
    }

    @PostMapping("/{id}/retrait")
    public ResponseEntity<Map<String, Object>> demanderRetrait(
            @PathVariable Long id,
            @RequestBody RetraitDto dto) {
        return ResponseEntity.ok(service.demanderRetrait(id, dto));
    }

    @GetMapping("/{id}/gains-mensuels")
    public ResponseEntity<List<Map<String, Object>>> getGainsMensuels(@PathVariable Long id) {
        return ResponseEntity.ok(service.getGainsMensuels(id));
    }

    // ── PORTFOLIO ─────────────────────────────────────────

    @GetMapping("/{id}/portfolio")
    public ResponseEntity<List<PortfolioDto>> getPortfolio(@PathVariable Long id) {
        return ResponseEntity.ok(service.getPortfolio(id));
    }

    @PostMapping("/{id}/portfolio")
    public ResponseEntity<PortfolioDto> ajouterProjet(
            @PathVariable Long id,
            @RequestBody PortfolioDto dto) {
        return ResponseEntity.ok(service.ajouterProjet(id, dto));
    }

    @PutMapping("/portfolio/{projetId}")
    public ResponseEntity<PortfolioDto> modifierProjet(
            @PathVariable Long projetId,
            @RequestBody PortfolioDto dto) {
        return ResponseEntity.ok(service.modifierProjet(projetId, dto));
    }

    @DeleteMapping("/portfolio/{projetId}")
    public ResponseEntity<Void> supprimerProjet(@PathVariable Long projetId) {
        service.supprimerProjet(projetId);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/portfolio/{projetId}/featured")
    public ResponseEntity<PortfolioDto> toggleFeatured(@PathVariable Long projetId) {
        return ResponseEntity.ok(service.toggleFeatured(projetId));
    }
}
