package com.example.demo.Dto.testIA;


import java.util.List;

public class SkillAssessmentSubmitDto {

    private String skill;

    private List<Integer> answers;

    public SkillAssessmentSubmitDto() {
    }

    public String getSkill() {
        return skill;
    }

    public void setSkill(String skill) {
        this.skill = skill;
    }

    public List<Integer> getAnswers() {
        return answers;
    }

    public void setAnswers(List<Integer> answers) {
        this.answers = answers;
    }
}
