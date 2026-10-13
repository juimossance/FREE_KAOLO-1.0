package com.example.demo.Dto;

import com.example.demo.entity.EntrepriseVerification;
import jakarta.validation.constraints.NotBlank;

import java.time.LocalDateTime;

public record EntrepriseVerificationDto(
        Long id, Long entrepriseId, String entrepriseNom, String entrepriseEmail,
        String raisonSociale, String registreCommerce, String numeroFiscal,
        String documentUrl, String status, String motifRejet, LocalDateTime dateSoumission) {

    public static EntrepriseVerificationDto from(EntrepriseVerification v,String nom, String entrepriseEmail) {

        return new EntrepriseVerificationDto(v.getId(),v.getEntrepriseId(), nom, entrepriseEmail,
                v.getRaisonSociale(), v.getRegistreCommerce(), v.getNumeroFiscal(), v.getDocumentUrl(),
                v.getStatus().name(), v.getMotifRejet(), v.getDateSoumission());
    }
}

