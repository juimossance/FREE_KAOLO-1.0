package com.example.demo.service;


import com.example.demo.Dto.MessagingDtos;
import com.example.demo.Enum.Role;
import com.example.demo.entity.Entreprise;
import com.example.demo.entity.Freelancer;
import com.example.demo.entity.Message.Conversation;
import com.example.demo.entity.Message.ConversationParticipant;
import com.example.demo.entity.Message.Message;

import com.example.demo.entity.User;
import com.example.demo.repository.MessageRepo.ConversationParticipantRepository;
import com.example.demo.repository.MessageRepo.ConversationRepository;
import com.example.demo.repository.MessageRepo.MessageRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.repository.entrepriseRepository;
import com.example.demo.repository.freelancerRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class MessagingService {


    private final ConversationRepository conversationRepository;
    private final ConversationParticipantRepository participantRepository;
    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final freelancerRepository free;
    private final entrepriseRepository ent;

    public MessagingService(
            ConversationRepository conversationRepository,
            ConversationParticipantRepository participantRepository,
            MessageRepository messageRepository,
            UserRepository userRepository,
            freelancerRepository free,
            entrepriseRepository ent
    ) {
        this.conversationRepository = conversationRepository;
        this.participantRepository = participantRepository;
        this.messageRepository = messageRepository;
        this.userRepository = userRepository;
        this.free = free;
        this.ent = ent;
    }

    @Transactional(readOnly = true)
    public List<MessagingDtos.ConversationSummaryDto> listConversationsForUser(Long userId) {
        return conversationRepository.findAllForUser(userId).stream()
                .map(c -> {
                    var last = messageRepository.findTopByConversation_IdOrderByCreatedAtDesc(c.getId()).orElse(null);
                    long unread = messageRepository.countUnreadForUser(c.getId(), userId);
                    return new MessagingDtos.ConversationSummaryDto(
                            c.getId(),
                            resolveConversationDisplayName(c, userId),
                            c.getType().name(),
                            c.getType() == Conversation.Type.GROUP ? c.getParticipants().size() : null,
                            last != null ? last.getContent() : null,
                            last != null ? last.getCreatedAt() : null,
                            unread
                    );
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public MessagingDtos.ConversationSummaryDto getOrCreateConversation(Long currentUserId, Long targetUserId) {
        if (currentUserId.equals(targetUserId)) {
            throw new IllegalArgumentException("Impossible de démarrer une conversation avec soi-même");
        }

        Conversation conversation = conversationRepository
                .findPrivateConversationBetween(currentUserId, targetUserId)
                .orElseGet(() -> createPrivateConversation(currentUserId, targetUserId));

        var last = messageRepository.findTopByConversation_IdOrderByCreatedAtDesc(conversation.getId()).orElse(null);
        long unread = messageRepository.countUnreadForUser(conversation.getId(), currentUserId);

        return new MessagingDtos.ConversationSummaryDto(
                conversation.getId(),
                resolveConversationDisplayName(conversation, currentUserId),
                conversation.getType().name(),
                null,
                last != null ? last.getContent() : null,
                last != null ? last.getCreatedAt() : null,
                unread
        );
    }

    private Conversation createPrivateConversation(Long userId1, Long userId2) {
        Conversation conversation = new Conversation();
        conversation.setType(Conversation.Type.PRIVATE);
        conversation = conversationRepository.save(conversation);

        ConversationParticipant p1 = new ConversationParticipant();
        p1.setConversation(conversation);
        p1.setUserId(userId1);

        ConversationParticipant p2 = new ConversationParticipant();
        p2.setConversation(conversation);
        p2.setUserId(userId2);

        participantRepository.save(p1);
        participantRepository.save(p2);

        conversation.getParticipants().add(p1);
        conversation.getParticipants().add(p2);

        return conversation;
    }

    @Transactional(readOnly = true)
    public List<MessagingDtos.MessageDto> listMessages(Long conversationId, Long requestingUserId) {
        assertParticipant(conversationId, requestingUserId);
        var participants = participantRepository.findByConversation_Id(conversationId);
        return messageRepository.findByConversation_IdOrderByCreatedAtAsc(conversationId).stream()
                .map(m -> toDto(m, participants.size()))
                .collect(Collectors.toList());
    }

    @Transactional
    public MessagingDtos.MessageDto sendMessage(Long conversationId, Long senderId, String content) {
        assertParticipant(conversationId, senderId);

        var conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Conversation introuvable"));

        var message = new Message();
        message.setConversation(conversation);
        message.setSenderId(senderId);
        message.setContent(content);
        // L'expéditeur est considéré comme ayant lu son propre message.
        message.getReadBy().add(senderId);

        var saved = messageRepository.save(message);
        var participantCount = participantRepository.findByConversation_Id(conversationId).size();
        return toDto(saved, participantCount);
    }

    @Transactional
    public void markConversationRead(Long conversationId, Long userId) {
        assertParticipant(conversationId, userId);
        var messages = messageRepository.findByConversation_IdOrderByCreatedAtAsc(conversationId);
        messages.forEach(m -> m.getReadBy().add(userId));
        messageRepository.saveAll(messages);
    }

    private void assertParticipant(Long conversationId, Long userId) {
        if (!participantRepository.existsByConversation_IdAndUserId(conversationId, userId)) {
            throw new AccessDeniedException("Vous ne faites pas partie de cette conversation");
        }
    }

    private MessagingDtos.MessageDto toDto(Message m, int participantCount) {
        boolean readByAllOthers = m.getReadBy().size() >= participantCount; // inclut l'expéditeur lui-même
        return new MessagingDtos.MessageDto(
                m.getId(),
                m.getConversation().getId(),
                m.getSenderId(),
                resolveUserDisplayName(m.getSenderId()),
                m.getContent(),
                m.getCreatedAt(),
                readByAllOthers
        );
    }

    private String resolveUserDisplayName(Long userId) {
        User user = userRepository.findById(userId).orElse(null);

        if (user == null) {
            return "Utilisateur #" + userId;
        }

        if (user.getRole() == Role.FREELANCER) {
            return free.findByUserId(userId)
                    .map(f -> {
                        String fullName = ((f.getPrenom() != null ? f.getPrenom() : "") + " " +
                                (f.getNom() != null ? f.getNom() : "")).trim();
                        return fullName.isEmpty() ? "Freelancer #" + userId : fullName;
                    })
                    .orElse("Freelancer #" + userId);
        }

        if (user.getRole() == Role.ENTREPRISE) {
            return ent.findByUserId(userId)
                    .map(e -> e.getNomEntreprise() != null ? e.getNomEntreprise() : "Entreprise #" + userId)
                    .orElse("Entreprise #" + userId);
        }

        return "Utilisateur #" + userId;
    }


    private String resolveConversationDisplayName(Conversation c, Long currentUserId) {
        if (c.getType() == Conversation.Type.GROUP) {
            return c.getName() != null ? c.getName() : "Groupe #" + c.getId();
        }
        var other = c.getParticipants().stream()
                .map(ConversationParticipant::getUserId)
                .filter(id -> !id.equals(currentUserId))
                .findFirst();
        return other.map(this::resolveUserDisplayName).orElse("Conversation #" + c.getId());
    }
}