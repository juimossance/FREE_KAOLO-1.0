package com.example.demo.Controller.Admin;


import com.example.demo.Dto.Admin.AdminCertificationDto;
import com.example.demo.Enum.CertStatus;
import com.example.demo.entity.Certification;
import com.example.demo.entity.Freelancer;
import com.example.demo.repository.CertificationRepository;
 // adapte si le nom diffère
import com.example.demo.repository.freelancerRepository;
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
@RequestMapping("/api/admin/certifications")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminCertificationController {

    private final CertificationRepository repo;
    private final freelancerRepository freelancerRepo;

    public record RejectRequest(@NotBlank @Size(max = 500) String motif) {}

    @GetMapping
    public List<AdminCertificationDto> list(@RequestParam(required = false) CertStatus status) {
        var items = status == null ? repo.findAllByOrderByDateCreationDesc()
                : repo.findByStatusOrderByDateCreationDesc(status);
        var ids = items.stream().map(Certification::getFreelancerId).collect(Collectors.toSet());
        Map<Long, Freelancer> byId = freelancerRepo.findAllById(ids).stream()
                .collect(Collectors.toMap(Freelancer::getId, f -> f));
        return items.stream().map(c -> toDto(c, byId.get(c.getFreelancerId()))).toList();
    }

    @PutMapping("/{id}/validate")
    @Transactional
    public AdminCertificationDto validate(@PathVariable Long id) {
        var c = find(id);
        c.setStatus(CertStatus.VALIDEE);
        c.setMotifRejet(null);
        c.setDateDecision(LocalDateTime.now());
        return toDto(c, freelancerRepo.findById(c.getFreelancerId()).orElse(null));
    }

    @PutMapping("/{id}/reject")
    @Transactional
    public AdminCertificationDto reject(@PathVariable Long id, @Valid @RequestBody RejectRequest req) {
        var c = find(id);
        c.setStatus(CertStatus.REJETEE);
        c.setMotifRejet(req.motif());
        c.setDateDecision(LocalDateTime.now());
        return toDto(c, freelancerRepo.findById(c.getFreelancerId()).orElse(null));
    }

    private Certification find(Long id) {
        return repo.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
    }

    private AdminCertificationDto toDto(Certification c, Freelancer f) {
        String nom = f == null ? "Inconnu" : f.getPrenom() + " " + f.getNom();
        String email = (f == null || f.getUser() == null) ? "" : f.getUser().getEmail();
        return AdminCertificationDto.from(c, nom, email);
    }
}