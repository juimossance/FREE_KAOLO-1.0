package com.example.demo.repository.MessageRepo;



import com.example.demo.entity.Message.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface MessageRepository extends JpaRepository<Message, Long> {

    List<Message> findByConversation_IdOrderByCreatedAtAsc(Long conversationId);

    Optional<Message> findTopByConversation_IdOrderByCreatedAtDesc(Long conversationId);

    @Query("""
        select count(m) from Message m
        where m.conversation.id = :conversationId
          and m.senderId <> :userId
          and :userId not member of m.readBy
    """)
    long countUnreadForUser(@Param("conversationId") Long conversationId, @Param("userId") Long userId);

}