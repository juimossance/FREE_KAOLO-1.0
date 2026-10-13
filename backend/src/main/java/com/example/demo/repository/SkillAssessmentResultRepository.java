package com.example.demo.repository;

import com.example.demo.entity.testIA.SkillAssessmentResult;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SkillAssessmentResultRepository
        extends JpaRepository<SkillAssessmentResult, Long> {

    List<SkillAssessmentResult> findByFreelancerId(
            Long freelancerId
    );

    List<SkillAssessmentResult> findByFreelancerIdAndSkill(
            Long freelancerId,
            String skill
    );

    Optional<SkillAssessmentResult>
    findTopByFreelancerIdAndSkillOrderByCreatedAtDesc(
            Long freelancerId,
            String skill
    );

}