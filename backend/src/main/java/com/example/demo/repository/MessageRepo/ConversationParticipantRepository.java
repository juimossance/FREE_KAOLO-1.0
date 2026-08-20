package com.example.demo.repository.MessageRepo;

import com.example.demo.entity.Message.ConversationParticipant;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ConversationParticipantRepository extends JpaRepository<ConversationParticipant, Long> {

    Optional<ConversationParticipant> findByConversation_IdAndUserId(Long conversationId, Long userId);

    List<ConversationParticipant> findByConversation_Id(Long conversationId);

    boolean existsByConversation_IdAndUserId(Long conversationId, Long userId);
}
