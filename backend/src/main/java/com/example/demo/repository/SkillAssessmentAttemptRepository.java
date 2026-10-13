package com.example.demo.repository;

import com.example.demo.entity.testIA.SkillAssessmentAttempt;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SkillAssessmentAttemptRepository
        extends JpaRepository<SkillAssessmentAttempt, Long> {

    Optional<SkillAssessmentAttempt>
    findTopByFreelancerIdAndSkillAndStatusOrderByCreatedAtDesc(
            Long freelancerId,
            String skill,
            String status
    );

    List<SkillAssessmentAttempt>
    findByFreelancerIdAndSkillOrderByCreatedAtDesc(
            Long freelancerId,
            String skill
    );
}