package com.example.demo.Controller;

import com.example.demo.Dto.FreelancerProfilDto;
import com.example.demo.Dto.NotificationDto;
import com.example.demo.entity.Freelancer;
import com.example.demo.repository.freelancerRepository;
import com.example.demo.service.FreelancerProfilService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/freelancer")
@CrossOrigin(origins = {
    "http://localhost:5173",
    "https://free-kaolo-1-0.onrender.com"
})
public class FreelancerProfilController {

    private final FreelancerProfilService service;

private final freelancerRepository Repository;
    public FreelancerProfilController(FreelancerProfilService service, freelancerRepository repository) {
        this.service = service;
        Repository = repository;
    }

    // ── PROFIL ──────────────────────────────────────────

    // Nouvel endpoint qui prend l'userId
    @GetMapping("/by-user/{userId}/profil")
    public ResponseEntity<FreelancerProfilDto> getProfilByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(service.getProfilByUserId(userId));
    }

 @PutMapping("/by-user/{userId}/profil")
    public ResponseEntity<FreelancerProfilDto> updateProfilByUserId(
            @PathVariable Long userId,
            @RequestBody FreelancerProfilDto dto) {

        Freelancer f = Repository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Freelancer non trouvé"));

        return ResponseEntity.ok(service.updateProfil(f.getId(), dto));
    }

    @PutMapping("/{id}/profil")
    public ResponseEntity<FreelancerProfilDto> updateProfil(
            @PathVariable Long id,
            @RequestBody FreelancerProfilDto dto) {
        return ResponseEntity.ok(service.updateProfil(id, dto));
    }

    @GetMapping("/{id}/completion")
    public ResponseEntity<?> getCompletion(@PathVariable Long id) {
        FreelancerProfilDto dto = service.getProfil(id);
        return ResponseEntity.ok(
                java.util.Map.of("pourcentage", dto.getCompletionPourcentage())
        );
    }
    @GetMapping("/{id}/completions")
    public ResponseEntity<Integer> calculerCompletion(@PathVariable Long id) {

        Freelancer freelancer = Repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Freelancer introuvable"));

        int completion = service.calculerCompletion(freelancer);

        return ResponseEntity.ok(completion);
    }

    }
