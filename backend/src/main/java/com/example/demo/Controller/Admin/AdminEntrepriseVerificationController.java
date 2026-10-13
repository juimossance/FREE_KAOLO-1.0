package com.example.demo.Controller.Admin;



import com.example.demo.Dto.EntrepriseVerificationDto;
import com.example.demo.Enum.VerificationStatus;
import com.example.demo.entity.Entreprise;
import com.example.demo.entity.EntrepriseVerification;
import com.example.demo.repository.EntrepriseVerificationRepository;
import com.example.demo.repository.entrepriseRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/entreprise-verifications")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminEntrepriseVerificationController {

    private final EntrepriseVerificationRepository repo;
    private final entrepriseRepository entrepriseRepo;

    public record RejectRequest(@NotBlank @Size(max = 500) String motif) {}

    @GetMapping
    public List<EntrepriseVerificationDto> list(@RequestParam(required = false) VerificationStatus status) {
        var items = status == null ? repo.findAllByOrderByDateSoumissionDesc()
                : repo.findByStatusOrderByDateSoumissionDesc(status);
        var ids = items.stream().map(EntrepriseVerification::getEntrepriseId).collect(Collectors.toSet());
        Map<Long, Entreprise> byId = entrepriseRepo.findAllById(ids).stream()
                .collect(Collectors.toMap(Entreprise::getId, e -> e));
        return items.stream().map(v -> toDto(v, byId.get(v.getEntrepriseId()))).toList();
    }

    @PutMapping("/{id}/validate")
    @Transactional
    public EntrepriseVerificationDto validate(@PathVariable Long id) {
        var v = find(id);
        v.setStatus(VerificationStatus.VALIDEE);
        v.setMotifRejet(null);
        v.setDateDecision(LocalDateTime.now());
        return toDto(v, entrepriseRepo.findById(v.getEntrepriseId()).orElse(null));
    }

    @PutMapping("/{id}/reject")
    @Transactional
    public EntrepriseVerificationDto reject(@PathVariable Long id, @Valid @RequestBody RejectRequest req) {
        var v = find(id);
        v.setStatus(VerificationStatus.REJETEE);
        v.setMotifRejet(req.motif());
        v.setDateDecision(LocalDateTime.now());
        return toDto(v, entrepriseRepo.findById(v.getEntrepriseId()).orElse(null));
    }

    private EntrepriseVerification find(Long id) {
        return repo.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
    }

    private EntrepriseVerificationDto toDto(EntrepriseVerification v, Entreprise e) {
        String nom = e == null ? "Inconnue" : e.getNomEntreprise();
        String email = (e == null || e.getUser() == null) ? "" : e.getUser().getEmail();
        return EntrepriseVerificationDto.from(v, nom, email);
    }
}