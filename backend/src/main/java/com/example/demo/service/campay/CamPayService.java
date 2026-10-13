package com.example.demo.service.campay;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class CamPayService {

    private static final Logger log = LoggerFactory.getLogger(CamPayService.class);

    private final RestTemplate restTemplate;

    @Value("${campay.base-url}")
    private String baseUrl;

    @Value("${campay.app-username}")
    private String appUsername;

    @Value("${campay.app-password}")
    private String appPassword;

    private String cachedToken;
    private LocalDateTime tokenExpiry;

    public CamPayService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    private synchronized String getAccessToken() {
        if (cachedToken != null && tokenExpiry != null
                && LocalDateTime.now().isBefore(tokenExpiry)) {
            return cachedToken;
        }

        log.info("Demande d'un nouveau token CamPay");

        Map<String, String> body = new HashMap<>();
        body.put("username", appUsername);
        body.put("password", appPassword);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setAccept(List.of(MediaType.APPLICATION_JSON));

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(
                    baseUrl + "/api/token/",
                    new HttpEntity<>(body, headers),
                    Map.class
            );

            Map<?, ?> data = response.getBody();
            if (data == null) {
                throw new IllegalStateException("Réponse vide de CamPay lors de l'authentification");
            }

            if (!(data.get("token") instanceof String token) || token.isBlank()) {
                throw new IllegalStateException("Token CamPay invalide : " + data);
            }

            if (!(data.get("expires_in") instanceof Number expires)) {
                throw new IllegalStateException("expires_in manquant dans la réponse CamPay : " + data);
            }

            // on garde une marge de 30s avant l'expiration réelle
            int cacheSeconds = Math.max(expires.intValue() - 30, 10);
            cachedToken = token;
            tokenExpiry = LocalDateTime.now().plusSeconds(cacheSeconds);

            log.info("Token CamPay obtenu, valable {} s en cache", cacheSeconds);
            return cachedToken;

        } catch (HttpStatusCodeException e) {
            log.error("Authentification CamPay échouée. HTTP {} - {}",
                    e.getStatusCode().value(), e.getResponseBodyAsString());
            throw new IllegalStateException(
                    "Authentification CamPay échouée (HTTP " + e.getStatusCode().value() + ")", e);
        } catch (RestClientException e) {
            log.error("CamPay injoignable pendant l'authentification", e);
            throw new IllegalStateException("Impossible d'obtenir le token CamPay", e);
        }
    }

    public CamPayCollectResponse collect(
            String telephone,
            BigDecimal montant,
            String externalReference,
            String description
    ) {
        Map<String, Object> body = new HashMap<>();
        body.put("amount", montant.setScale(0, RoundingMode.CEILING).toString());
        body.put("from", normalizeNumeroCameroun(telephone));
        body.put("description", description);
        body.put("external_reference", externalReference);

        return post("/api/collect/", body, "COLLECT");
    }

    public CamPayCollectResponse withdraw(
            String telephone,
            BigDecimal montant,
            String externalReference,
            String description
    ) {
        Map<String, Object> body = new HashMap<>();
        body.put("amount", montant.setScale(0, RoundingMode.FLOOR).toString());
        body.put("to", normalizeNumeroCameroun(telephone));
        body.put("description", description);
        body.put("external_reference", externalReference);

        return post("/api/withdraw/", body, "WITHDRAW");
    }

    private CamPayCollectResponse post(String path, Map<String, Object> body, String label) {
        log.info("CamPay {} - montant={}, ref={}", label, body.get("amount"), body.get("external_reference"));

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(
                    baseUrl + path,
                    new HttpEntity<>(body, authHeaders()),
                    Map.class
            );

            Map<?, ?> data = response.getBody();
            if (data == null) {
                throw new IllegalStateException("Réponse vide de CamPay (" + label + ")");
            }

            log.info("CamPay {} - réponse : {}", label, data);

            Object ref = data.get("reference");
            Object status = data.get("status");

            if (ref == null || ref.toString().isBlank()) {
                throw new IllegalStateException("CamPay n'a pas retourné de référence : " + data);
            }

            return new CamPayCollectResponse(
                    ref.toString(),
                    status != null ? status.toString() : null
            );

        } catch (HttpStatusCodeException e) {
            log.error("CamPay {} refusé. HTTP {} - {}",
                    label, e.getStatusCode().value(), e.getResponseBodyAsString());
            throw new IllegalStateException(
                    label + " CamPay refusé (HTTP " + e.getStatusCode().value() + ") : "
                            + e.getResponseBodyAsString(), e);
        } catch (RestClientException e) {
            log.error("CamPay injoignable ({})", label, e);
            throw new IllegalStateException("Impossible de joindre CamPay (" + label + ")", e);
        }
    }

    private HttpHeaders authHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setAccept(List.of(MediaType.APPLICATION_JSON));
        // CamPay veut "Token xxx", pas "Bearer xxx"
        headers.set(HttpHeaders.AUTHORIZATION, "Token " + getAccessToken());
        return headers;
    }

    // 690123456 / 0690123456 / 237690123456 -> 237690123456
    private String normalizeNumeroCameroun(String numero) {
        if (numero == null || numero.isBlank()) {
            throw new IllegalArgumentException("Le numéro de téléphone est obligatoire");
        }

        String digits = numero.replaceAll("[^0-9]", "");

        if (digits.startsWith("237")) return digits;
        if (digits.startsWith("0")) return "237" + digits.substring(1);
        return "237" + digits;
    }

    public record CamPayCollectResponse(String reference, String status) {
    }
}