package com.example.demo.Dto.testIA;



import java.util.List;

public class SkillAssessmentDto {

    private String skill;

    private List<SkillQuestionDto> questions;

    public SkillAssessmentDto() {
    }

    public SkillAssessmentDto(
            String skill,
            List<SkillQuestionDto> questions
    ) {
        this.skill = skill;
        this.questions = questions;
    }

    public String getSkill() {
        return skill;
    }

    public void setSkill(String skill) {
        this.skill = skill;
    }

    public List<SkillQuestionDto> getQuestions() {
        return questions;
    }

    public void setQuestions(List<SkillQuestionDto> questions) {
        this.questions = questions;
    }
}