package com.example.demo.Controller;

import com.example.demo.Dto.InitierPaiementDto;
import com.example.demo.Dto.PaiementDto;
import com.example.demo.service.PaiementService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/paiements")
@CrossOrigin(origins = "http://localhost:5173")
public class PaiementController {

    private final PaiementService paiementService;

    public PaiementController(PaiementService paiementService) {
        this.paiementService = paiementService;
    }

    // Entreprise initie le paiement
    @PostMapping("/initier")
    public ResponseEntity<PaiementDto> initierPaiement(
            @RequestBody InitierPaiementDto dto) {
        return ResponseEntity.ok(paiementService.initierPaiement(dto));
    }

    // Entreprise valide la livraison → libère l'argent
    @PostMapping("/valider/{paiementId}")
    public ResponseEntity<PaiementDto> validerLivraison(
            @PathVariable Long paiementId) {
        return ResponseEntity.ok(paiementService.validerLivraison(paiementId));
    }

    // Freelancer retire son argent
    @PostMapping("/retrait/{freelancerId}")
    public ResponseEntity<Map<String, Object>> simulerRetrait(
            @PathVariable Long freelancerId,
            @RequestParam Double montant,
            @RequestParam String methode) {
        return ResponseEntity.ok(paiementService.simulerRetrait(freelancerId, montant, methode));
    }

    // Historique paiements freelancer
    @GetMapping("/freelancer/{freelancerId}")
    public ResponseEntity<List<PaiementDto>> getPaiementsFreelancer(
            @PathVariable Long freelancerId) {
        return ResponseEntity.ok(paiementService.getPaiementsFreelancer(freelancerId));
    }

    // Historique paiements entreprise
    @GetMapping("/entreprise/{entrepriseId}")
    public ResponseEntity<List<PaiementDto>> getPaiementsEntreprise(
            @PathVariable Long entrepriseId) {
        return ResponseEntity.ok(paiementService.getPaiementsEntreprise(entrepriseId));
    }
}