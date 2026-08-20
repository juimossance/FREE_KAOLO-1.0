package com.example.demo.Controller;





import com.example.demo.Dto.MessagingDtos;
import com.example.demo.Dto.UserPrincipal;
import com.example.demo.service.MessagingService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/conversations")
public class MessagingController {

    private final MessagingService messagingService;

    public MessagingController(MessagingService messagingService) {
        this.messagingService = messagingService;
    }

    @GetMapping
    public List<MessagingDtos.ConversationSummaryDto> listConversations(@AuthenticationPrincipal UserPrincipal currentUser) {
        return messagingService.listConversationsForUser(currentUser.getId());
    }

    @GetMapping("/{id}/messages")
    public List<MessagingDtos.MessageDto> listMessages(@PathVariable Long id, @AuthenticationPrincipal UserPrincipal currentUser) {
        return messagingService.listMessages(id, currentUser.getId());
    }

    @PostMapping("/{id}/messages")
    public ResponseEntity<MessagingDtos.MessageDto> sendMessage(
            @PathVariable Long id,
            @Valid @RequestBody MessagingDtos.SendMessageRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        var saved = messagingService.sendMessage(id, currentUser.getId(), request.content());
        return ResponseEntity.ok(saved);
    }


    @PostMapping("/{id}/read")
    public ResponseEntity<Void> markRead(@PathVariable Long id, @AuthenticationPrincipal UserPrincipal currentUser) {
        messagingService.markConversationRead(id, currentUser.getId());
        return ResponseEntity.noContent().build();
    }
    @PostMapping("/start")
    public ResponseEntity<MessagingDtos.ConversationSummaryDto> startConversation(
            @Valid @RequestBody MessagingDtos.StartConversationRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        var conversation = messagingService.getOrCreateConversation(currentUser.getId(), request.targetUserId());
        return ResponseEntity.ok(conversation);
    }

}