package com.example.demo.Dto;

import jakarta.validation.constraints.NotBlank;

public record EntrepriseVerificationRequest(
        @NotBlank String raisonSociale,
        @NotBlank String registreCommerce,
        String numeroFiscal,
        @NotBlank String documentUrl) {}