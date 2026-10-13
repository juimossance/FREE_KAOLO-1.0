package com.example.demo.Dto.Admin;

import com.example.demo.entity.Certification;

import java.time.Instant;
import java.time.LocalDate;

public record AdminCertificationDto(
        Long id,
        String type,
        String nom,
        String organisme,
        String credentialId,
        String categorie,
        LocalDate dateObtention,
        LocalDate dateExpiration,
        String documentUrl,
        String status,
        String motifRejet,
        Long freelancerId,
        String freelancerNom,
        String freelancerEmail,
        Instant dateCreation
) {

    public static AdminCertificationDto from(
            Certification c,
            String nom,
            String email
    ) {
        return new AdminCertificationDto(
                c.getId(),
                c.getType().name(),
                c.getNom(),
                c.getOrganisme(),
                c.getCredentialId(),
                c.getCategorie(),
                c.getDateObtention(),
                c.getDateExpiration(),
                c.getDocumentUrl(),
                c.getStatus().name(),
                c.getMotifRejet(),
                c.getFreelancerId(),
                nom,
                email,
                c.getDateCreation()
        );
    }
}