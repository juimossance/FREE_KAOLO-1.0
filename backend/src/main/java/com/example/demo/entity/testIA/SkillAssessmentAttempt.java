package com.example.demo.entity.testIA;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "skill_assessment_attempt")
public class SkillAssessmentAttempt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long freelancerId;

    private String skill;

    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String questionsJson;

    private LocalDateTime createdAt;

    private LocalDateTime completedAt;

    private String status;

    public SkillAssessmentAttempt() {
    }

    @PrePersist
    public void prePersist() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }

        if (status == null) {
            status = "EN_COURS";
        }
    }

    public Long getId() {
        return id;
    }

    public Long getFreelancerId() {
        return freelancerId;
    }

    public void setFreelancerId(Long freelancerId) {
        this.freelancerId = freelancerId;
    }

    public String getSkill() {
        return skill;
    }

    public void setSkill(String skill) {
        this.skill = skill;
    }

    public String getQuestionsJson() {
        return questionsJson;
    }

    public void setQuestionsJson(String questionsJson) {
        this.questionsJson = questionsJson;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(LocalDateTime completedAt) {
        this.completedAt = completedAt;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}