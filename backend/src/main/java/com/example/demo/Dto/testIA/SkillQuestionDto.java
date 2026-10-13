package com.example.demo.Dto.testIA;

import java.util.List;

public class SkillQuestionDto {

    private String question;
    private List<String> options;
    private Integer answer;

    public SkillQuestionDto() {
    }

    public SkillQuestionDto(
            String question,
            List<String> options,
            Integer answer
    ) {
        this.question = question;
        this.options = options;
        this.answer = answer;
    }

    public String getQuestion() {
        return question;
    }

    public void setQuestion(String question) {
        this.question = question;
    }

    public List<String> getOptions() {
        return options;
    }

    public void setOptions(List<String> options) {
        this.options = options;
    }

    public Integer getAnswer() {
        return answer;
    }

    public void setAnswer(Integer answer) {
        this.answer = answer;
    }
}