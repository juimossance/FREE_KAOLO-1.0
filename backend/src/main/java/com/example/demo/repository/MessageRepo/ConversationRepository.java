package com.example.demo.repository.MessageRepo;

import com.example.demo.entity.Message.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ConversationRepository extends JpaRepository<Conversation, Long> {

    @Query("""
        select c from Conversation c
        join c.participants p
        where p.userId = :userId
        order by c.createdAt desc
    """)
    List<Conversation> findAllForUser(@Param("userId") Long userId);
    @Query("""
    select c from Conversation c
    where c.type = com.example.demo.entity.Message.Conversation.Type.PRIVATE
      and size(c.participants) = 2
      and exists (select 1 from ConversationParticipant p1 where p1.conversation = c and p1.userId = :userId1)
      and exists (select 1 from ConversationParticipant p2 where p2.conversation = c and p2.userId = :userId2)
""")
    Optional<Conversation> findPrivateConversationBetween(@Param("userId1") Long userId1, @Param("userId2") Long userId2);
}
