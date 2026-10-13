package com.example.demo.Dto;

import java.time.LocalDateTime;

public record MissionNotationDto(
        Long candidatureId, Long freelancerId, String freelancerNom,
        String projetTitre, LocalDateTime dateFin,
        Integer note, String commentaire) {}