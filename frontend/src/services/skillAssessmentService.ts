import { apiFetch } from "./http";

export interface SkillQuestion {
  question: string;
  options: string[];
  answer: number;
}

export interface SkillAssessment {
  skill: string;
  questions: SkillQuestion[];
}

export interface SkillResult {
  skill: string;
  score: number;
  level: string;
  totalQuestions: number;
  correctAnswers: number;
}

export const skillAssessmentService = {

  async getSkills(
    freelancerId: number
  ): Promise<string[]> {

    return apiFetch(
      `/skill-assessment/skills/${freelancerId}`
    );
  },

  async generate(
    freelancerId: number,
    skill: string
  ): Promise<SkillAssessment> {

    return apiFetch(
      `/skill-assessment/generate/${freelancerId}?skill=${encodeURIComponent(skill)}`,
      {
        method: "POST",
      }
    );
  },

  async submit(
    freelancerId: number,
    skill: string,
    answers: number[]
  ): Promise<SkillResult> {

    return apiFetch(
      `/skill-assessment/submit/${freelancerId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          skill,
          answers,
        }),
      }
    );
  },

  async getResults(
    freelancerId: number
  ): Promise<SkillResult[]> {

    return apiFetch(
      `/skill-assessment/results/${freelancerId}`
    );
  },
};