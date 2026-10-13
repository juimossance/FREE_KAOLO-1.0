package com.example.demo.Dto.testIA;



public class SkillAssessmentResultDto {

    private String skill;
    private int score;
    private String level;
    private int totalQuestions;
    private int correctAnswers;

    public SkillAssessmentResultDto() {
    }

    public SkillAssessmentResultDto(
            String skill,
            int score,
            String level,
            int totalQuestions,
            int correctAnswers
    ) {
        this.skill = skill;
        this.score = score;
        this.level = level;
        this.totalQuestions = totalQuestions;
        this.correctAnswers = correctAnswers;
    }

    public String getSkill() {
        return skill;
    }

    public int getScore() {
        return score;
    }

    public String getLevel() {
        return level;
    }

    public int getTotalQuestions() {
        return totalQuestions;
    }

    public int getCorrectAnswers() {
        return correctAnswers;
    }
}