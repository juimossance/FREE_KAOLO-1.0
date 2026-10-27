package com.example.demo.Controller;


import com.example.demo.Dto.EscrowDto;
import com.example.demo.Dto.UserPrincipal;
import com.example.demo.service.EscrowService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;


@RestController
@RequestMapping("/api/paiements")
@CrossOrigin(origins = {
    "http://localhost:5173",
    "https://free-kaolo-1-3.onrender.com"
})
public class EscrowController {

    private final EscrowService escrowService;

    public EscrowController(EscrowService escrowService) {
        this.escrowService = escrowService;
    }

    @PostMapping("/depot")
    @PreAuthorize("hasRole('ENTREPRISE')")
    public ResponseEntity<EscrowDto.EscrowTransactionDto> initierDepot(
            @RequestBody EscrowDto.DepotRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(escrowService.initierDepot(principal.getEntrepriseId(), request));
    }

    @PostMapping("/{id}/liberer")
    @PreAuthorize("hasRole('ENTREPRISE')")
    public ResponseEntity<EscrowDto.EscrowTransactionDto> libererFonds(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(escrowService.libererFonds(id, principal.getEntrepriseId()));
    }

    @PostMapping("/retrait")
    @PreAuthorize("hasRole('FREELANCER')")
    public ResponseEntity<EscrowDto.EscrowTransactionDto> initierRetrait(
            @RequestBody EscrowDto.RetraitRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(escrowService.initierRetrait(principal.getFreelancerId(), request));
    }

    @GetMapping("/solde")
    @PreAuthorize("hasRole('FREELANCER')")
    public ResponseEntity<EscrowDto.SoldeDto> monSolde(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(escrowService.getSolde(principal.getFreelancerId()));
    }

    @GetMapping("/mes-transactions")
    public ResponseEntity<List<EscrowDto.EscrowTransactionDto>> mesTransactions(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(escrowService.getTransactionsPour(principal));
    }

    @GetMapping("/{id}/statut")
    public ResponseEntity<EscrowDto.EscrowTransactionDto> verifierStatut(@PathVariable Long id) {
        // permet au front de "poller" une transaction en attente de confirmation CamPay
        return ResponseEntity.ok(escrowService.rafraichirStatut(id));
    }

}
