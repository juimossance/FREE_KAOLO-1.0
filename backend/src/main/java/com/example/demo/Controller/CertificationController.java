package com.example.demo.Controller;


import com.example.demo.Dto.CertificationDTO;
import com.example.demo.Dto.CertificationFormDTO;
import com.example.demo.service.Certificationservice;
import com.example.demo.service.FileStorageService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
public class CertificationController {

    private final Certificationservice certificationService;


    public CertificationController(Certificationservice certificationService) {
        this.certificationService = certificationService;

    }

    @GetMapping("/api/freelancers/{freelancerId}/certifications")
    public List<CertificationDTO> getAll(@PathVariable Long freelancerId) {
        return certificationService.getAllByFreelancer(freelancerId);
    }

    @PostMapping("/api/freelancers/{freelancerId}/certifications")
    @ResponseStatus(HttpStatus.CREATED)
    public CertificationDTO create(@PathVariable Long freelancerId, @Valid @RequestBody CertificationFormDTO form) {
        return certificationService.create(freelancerId, form);
    }

    @PutMapping("/api/certifications/{id}/resubmit")
    public CertificationDTO resubmit(@PathVariable Long id, @Valid @RequestBody CertificationFormDTO form) {
        return certificationService.resubmit(id, form);
    }

    @DeleteMapping("/api/certifications/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        certificationService.delete(id);
        return ResponseEntity.noContent().build();
    }
}