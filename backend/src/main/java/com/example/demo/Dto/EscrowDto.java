package com.example.demo.Dto;

import com.example.demo.Enum.StatutEscrow;
import com.example.demo.Enum.TypeOperation;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class EscrowDto {
    public record SoldeDto(
            BigDecimal soldeDisponible,
            BigDecimal soldeEnAttente
    ) {}

    public record DepotRequest(
            Long projetId,
            BigDecimal montant,
            String telephone,
            String operateur
    ) {}
    public record RetraitRequest(
            BigDecimal montant,
            String telephone,
            String operateur
    ) {}
    public record EscrowTransactionDto(
            Long id,
            String projetTitre,
            BigDecimal montant,
            BigDecimal frais,
            TypeOperation typeOperation,
            StatutEscrow statut,
            String operateur,
            LocalDateTime createdAt
    ) {}
}
