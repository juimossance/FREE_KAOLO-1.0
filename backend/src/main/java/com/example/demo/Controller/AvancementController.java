package com.example.demo.Controller;

import com.example.demo.Dto.AvancementDtos;
import com.example.demo.Dto.UserPrincipal;
import com.example.demo.service.AvancementService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/projets/{projetId}/avancement")
@RequiredArgsConstructor
public class AvancementController {

    private final AvancementService avancementService;

    @GetMapping
    public AvancementDtos.AvancementProjetDTO get(
            @PathVariable Long projetId,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        return avancementService.getAvancement(projetId, currentUser);
    }

    @PostMapping
    public AvancementDtos.AvancementProjetDTO publier(
            @PathVariable Long projetId,
            @Valid @RequestBody AvancementDtos.NouvelleMiseAJourRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        return avancementService.publierMiseAJour(projetId, request, currentUser);
    }
}