package com.example.demo.Controller;



import com.example.demo.Dto.UserPrincipal;
import com.example.demo.Dto.freelancerDto;
import com.example.demo.Dto.iACV;
import com.example.demo.entity.Cv;
import com.example.demo.entity.Freelancer;
import com.example.demo.repository.CvRepository;
import com.example.demo.repository.freelancerRepository;
import com.example.demo.service.CvService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import tools.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Map;


@RestController
@RequestMapping("/api/freelancers/{freelancerId}/cv")
@RequiredArgsConstructor
public class CvController {

    private final CvService cvService;
    @Autowired
    private freelancerRepository freelancerRepo;
    @Autowired
    private ObjectMapper objectMapper;
    @Autowired
    private CvRepository cvRepository;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public freelancerDto.CvResponse importCv(
            @PathVariable Long freelancerId,
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) throws IOException {
        return cvService.importCv(freelancerId, file, currentUser);
    }

    @GetMapping
    public ResponseEntity<byte[]> getCv(
            @PathVariable Long freelancerId,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        CvService.CvFile cv = cvService.getCv(freelancerId, currentUser);

        if (cv == null) {
            return ResponseEntity.noContent().build();
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(cv.contentType()))
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        ContentDisposition.inline().filename(cv.fileName()).build().toString()
                )
                .body(cv.data());
    }

    @DeleteMapping
    public ResponseEntity<Void> deleteCv(
            @PathVariable Long freelancerId,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        cvService.deleteCv(freelancerId, currentUser);
        return ResponseEntity.noContent().build(); // 204 → apiFetch() gère déjà ce cas
    }
    @GetMapping("/cv-draft")
    public ResponseEntity<?> getCvDraft(@AuthenticationPrincipal UserPrincipal currentUser) {
        if (currentUser.getFreelancerId() == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Réservé aux freelancers"));
        }

        Freelancer freelancer = freelancerRepo.findById(currentUser.getFreelancerId())
                .orElseThrow(() -> new RuntimeException("Freelancer introuvable"));

        Cv cv = cvRepository.findByFreelancerId(currentUser.getFreelancerId())
                .orElseGet(() -> new Cv(freelancer));
        if (cv == null || cv.getAtsCvDraft() == null || cv.getAtsCvDraft().isBlank()) {
            return ResponseEntity.noContent().build();
        }

        try {
            iACV.AtsCvDto draft = objectMapper.readValue(cv.getAtsCvDraft(), iACV.AtsCvDto.class);
            return ResponseEntity.ok(draft);
        } catch (Exception e) {
            // Brouillon corrompu/format obsolète : on le traite comme s'il n'y en avait pas.
            return ResponseEntity.noContent().build();
        }
    }

    @PutMapping("/cv-draft")
    public ResponseEntity<?> saveCvDraft(
            @RequestBody iACV.AtsCvDto draft,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        if (currentUser.getFreelancerId() == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Réservé aux freelancers"));
        }

        Freelancer freelancer = freelancerRepo.findById(currentUser.getFreelancerId())
                .orElseThrow(() -> new RuntimeException("Freelancer introuvable"));

        try {
            String json = objectMapper.writeValueAsString(draft);

            Cv cv = cvRepository.findByFreelancerId(currentUser.getFreelancerId())
                    .orElseGet(() -> new Cv(freelancer));
            cv.setAtsCvDraft(json);
            cv.setAtsCvDraftUpdatedAt(LocalDateTime.now());
            cvRepository.save(cv);
            freelancerRepo.save(freelancer);

            return ResponseEntity.ok(Map.of("saved", true, "updatedAt", cv.getAtsCvDraftUpdatedAt()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Impossible d'enregistrer le brouillon"));
        }
    }
}