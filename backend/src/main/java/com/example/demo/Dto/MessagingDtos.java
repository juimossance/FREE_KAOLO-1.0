package com.example.demo.Dto;
 // TODO: adapter au package réel du projet

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.Instant;

public class MessagingDtos {

    public record ConversationSummaryDto(
            Long id,
            String name,
            String type,          // "PRIVATE" | "GROUP"
            Integer memberCount,  // null pour une conversation privée
            String lastMessage,
            Instant lastMessageAt,
            long unreadCount
    ) {}
    public record StartConversationRequest(
            @NotNull Long targetUserId
    ) {}
    public record MessageDto(
            Long id,
            Long conversationId,
            Long senderId,
            String senderName,    // résolu côté service, utile pour l'attribution en groupe
            String content,
            Instant createdAt,
            boolean read          // true si tous les autres participants ont lu le message
    ) {}

    public record SendMessageRequest(
            @NotBlank(message = "Le contenu du message ne peut pas être vide")
            String content
    ) {}
}
