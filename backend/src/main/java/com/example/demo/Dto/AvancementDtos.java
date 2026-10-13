package com.example.demo.Dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;
import java.util.List;

public class AvancementDtos {

    public record MiseAJourDTO(
            Long id,
            Integer pourcentage,
            String message,
            LocalDateTime date
    ) {}

    public record AvancementProjetDTO(
            Long projetId,
            Integer progression,
            LocalDateTime derniereMiseAJour,
            List<MiseAJourDTO> historique
    ) {}


    public record NouvelleMiseAJourRequest(
            @NotNull @Min(0) @Max(100) Integer pourcentage,
            String message
    ) {}
}
