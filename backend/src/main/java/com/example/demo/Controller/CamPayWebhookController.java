package com.example.demo.Controller;

import com.example.demo.Dto.campay.CamPayWebhookPayload;
import com.example.demo.service.EscrowService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/webhooks/campay")
public class CamPayWebhookController {

    private final EscrowService escrowService;
    private final String webhookSecret;

    public CamPayWebhookController(
            EscrowService escrowService,
            @Value("${campay.webhook-key}") String webhookSecret) {
        this.escrowService = escrowService;
        this.webhookSecret = webhookSecret;
    }

    @PostMapping
    public ResponseEntity<Void> recevoir(
            @RequestBody CamPayWebhookPayload payload,
            @RequestHeader(value = "X-Campay-Secret", required = false) String headerSecret) {

        if (headerSecret == null || !headerSecret.equals(webhookSecret)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        escrowService.traiterWebhook(payload);
        return ResponseEntity.ok().build();
    }
}