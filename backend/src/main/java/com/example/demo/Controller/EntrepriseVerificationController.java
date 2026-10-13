package com.example.demo.Controller;

import com.example.demo.Dto.EntrepriseVerificationDto;
import com.example.demo.Dto.EntrepriseVerificationRequest;
import com.example.demo.Enum.VerificationStatus;
import com.example.demo.config.OwnershipGuard;
import com.example.demo.entity.Entreprise;
import com.example.demo.entity.EntrepriseVerification;
import com.example.demo.repository.EntrepriseVerificationRepository;
import com.example.demo.repository.entrepriseRepository;
import com.example.demo.service.FileStorageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequiredArgsConstructor
public class EntrepriseVerificationController {

    private final EntrepriseVerificationRepository repo;
    private final entrepriseRepository entrepriseRepo;
    private final FileStorageService storage;

    // TODO : vérifier que l'utilisateur connecté est propriétaire de {entrepriseId}
    @GetMapping("/api/entreprises/{entrepriseId}/verifications")
    @PreAuthorize("hasAnyRole('ENTREPRISE','ADMIN')")
    public List<EntrepriseVerificationDto> mine(@PathVariable Long entrepriseId, Authentication auth) {
        OwnershipGuard.requireEntreprise(auth, entrepriseId);
        var e = entrepriseRepo.findById(entrepriseId).orElse(null);
        return repo.findByEntrepriseIdOrderByDateSoumissionDesc(entrepriseId)
                .stream().map(v -> toDto(v, e)).toList();
    }

    @PostMapping("/api/entreprises/{entrepriseId}/verifications")
    @PreAuthorize("hasRole('ENTREPRISE')")
    @Transactional
    public EntrepriseVerificationDto create(@PathVariable Long entrepriseId,
                                            @Valid @RequestBody EntrepriseVerificationRequest req,
                                            Authentication auth) {
        OwnershipGuard.requireEntreprise(auth, entrepriseId);
        var e = entrepriseRepo.findById(entrepriseId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Entreprise introuvable"));
        if (repo.existsByEntrepriseIdAndStatusIn(entrepriseId,
                List.of(VerificationStatus.EN_ATTENTE, VerificationStatus.VALIDEE))) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Une demande est déjà en cours ou validée.");
        }
        var v = new EntrepriseVerification();
        v.setEntrepriseId(entrepriseId);
        apply(v, req);
        return toDto(repo.save(v), e);
    }

    // Uniquement si la demande est REJETEE
    @PutMapping("/api/entreprise-verifications/{id}/resubmit")
    @PreAuthorize("hasRole('ENTREPRISE')")
    @Transactional
    public EntrepriseVerificationDto resubmit(@PathVariable Long id,
                                              @Valid @RequestBody EntrepriseVerificationRequest req,
                                              Authentication auth) {
        var v = repo.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        OwnershipGuard.requireEntreprise(auth, v.getEntrepriseId());

        if (v.getStatus() != VerificationStatus.REJETEE)
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Seule une demande rejetée peut être resoumise.");
        apply(v, req);
        return toDto(v, entrepriseRepo.findById(v.getEntrepriseId()).orElse(null));
    }

    @PostMapping(value = "/api/entreprise-verifications/documents",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ENTREPRISE')")
    public Map<String, String> upload(@RequestPart("file") MultipartFile file) {
        String url = storage.store(
                file,
                "entreprise-verifications",
                FileStorageService.DOCUMENT_TYPES,
                10L * 1024 * 1024);
        return Map.of("url", url);
    }
    private void apply(EntrepriseVerification v, EntrepriseVerificationRequest r) {
        v.setRaisonSociale(r.raisonSociale().trim());
        v.setRegistreCommerce(r.registreCommerce().trim());
        v.setNumeroFiscal(r.numeroFiscal());
        v.setDocumentUrl(r.documentUrl());
        v.setStatus(VerificationStatus.EN_ATTENTE);
        v.setMotifRejet(null);
        v.setDateDecision(null);
        v.setDateSoumission(LocalDateTime.now());
    }

    private EntrepriseVerificationDto toDto(EntrepriseVerification v, Entreprise e) {
        String nom = e == null ? "Inconnue" : e.getNomEntreprise();
        String email = (e == null || e.getUser() == null) ? "" : e.getUser().getEmail();
        return EntrepriseVerificationDto.from(v, nom, email);
    }
}