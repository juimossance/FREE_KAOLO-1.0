package com.example.demo.service.testIA;

import com.example.demo.Dto.testIA.SkillAssessmentDto;
import com.example.demo.Dto.testIA.SkillAssessmentResultDto;
import com.example.demo.Dto.testIA.SkillAssessmentSubmitDto;
import com.example.demo.Dto.testIA.SkillQuestionDto;
import com.example.demo.entity.Freelancer;
import com.example.demo.entity.testIA.SkillAssessmentResult;
import com.example.demo.repository.SkillAssessmentResultRepository;
import com.example.demo.repository.freelancerRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class SkillAssessmentService {

    private final freelancerRepository freelancerRepository;
    private final GroqSkillService groqSkillService;
    private final SkillAssessmentResultRepository resultRepository;

    /**
     * Nombre de jours à attendre avant de repasser
     * le test de la même compétence.
     */
    private static final long RETRY_DELAY_DAYS = 14;

    public SkillAssessmentService(
            freelancerRepository freelancerRepository,
            GroqSkillService groqSkillService,
            SkillAssessmentResultRepository resultRepository
    ) {
        this.freelancerRepository = freelancerRepository;
        this.groqSkillService = groqSkillService;
        this.resultRepository = resultRepository;
    }

    /**
     * Récupère les compétences du freelancer.
     */
    public List<String> getFreelancerSkills(Long freelancerId) {

        Freelancer freelancer =
                freelancerRepository.findById(freelancerId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Freelancer introuvable"
                                )
                        );

        if (freelancer.getCompetence() == null) {
            return List.of();
        }

        return freelancer.getCompetence();
    }

    /**
     * Génère les questions pour une compétence.
     */
    public SkillAssessmentDto generateAssessment(
            Long freelancerId,
            String skill
    ) {


        Freelancer freelancer =
                freelancerRepository.findById(freelancerId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Freelancer introuvable"
                                )
                        );

        List<String> skills =
                freelancer.getCompetence();

        if (skills == null || skills.isEmpty()) {
            throw new RuntimeException(
                    "Aucune compétence enregistrée dans votre profil."
            );
        }

        boolean skillExists =
                skills.stream()
                        .anyMatch(
                                s -> s.equalsIgnoreCase(skill)
                        );

        if (!skillExists) {
            throw new RuntimeException(
                    "Cette compétence n'est pas présente dans votre profil."
            );
        }

        // --------------------------------------------------
        // 3. Vérifier le délai de 14 jours
        // --------------------------------------------------

        Optional<SkillAssessmentResult> lastResult =
                resultRepository
                        .findTopByFreelancerIdAndSkillOrderByCreatedAtDesc(
                                freelancerId,
                                skill
                        );

        if (lastResult.isPresent()) {

            SkillAssessmentResult previousResult =
                    lastResult.get();

            LocalDateTime lastTestDate =
                    previousResult.getCreatedAt();

            LocalDateTime nextAttemptDate =
                    lastTestDate.plusDays(RETRY_DELAY_DAYS);

            if (LocalDateTime.now().isBefore(nextAttemptDate)) {

                throw new RuntimeException(
                        "Vous avez déjà passé le test de cette compétence. "
                                + "Vous pourrez le repasser à partir du "
                                + nextAttemptDate
                );
            }
        }


        // 4. Appeler Groq pour générer les questions
        List<SkillQuestionDto> questions =
                groqSkillService.generateQuestions(skill);


        // 5. Vérifier que Groq a bien généré 10 questions


        if (questions == null || questions.size() != 10) {
            throw new RuntimeException(
                    "L'IA n'a pas généré 10 questions valides."
            );
        }

        return new SkillAssessmentDto(
                skill,
                questions
        );
    }

    /**
     * Corrige le test.
     */
    public SkillAssessmentResultDto submitAssessment(
            Long freelancerId,
            SkillAssessmentSubmitDto dto
    ) {

        SkillAssessmentDto assessment =
                generateAssessment(
                        freelancerId,
                        dto.getSkill()
                );

        List<SkillQuestionDto> questions =
                assessment.getQuestions();

        List<Integer> answers =
                dto.getAnswers();

        if (answers == null) {
            throw new RuntimeException(
                    "Les réponses sont obligatoires."
            );
        }

        int correct = 0;

        for (int i = 0;
             i < questions.size() && i < answers.size();
             i++) {

            Integer userAnswer =
                    answers.get(i);

            Integer correctAnswer =
                    questions.get(i).getAnswer();

            if (userAnswer != null &&
                    userAnswer.equals(correctAnswer)) {

                correct++;
            }
        }
        // Calcul du score


        int score =
                Math.round(
                        ((float) correct / questions.size()) * 100
                );

        String level =
                calculateLevel(score);

        // Enregistrer le résultat


        SkillAssessmentResult result =
                new SkillAssessmentResult();

        result.setFreelancerId(freelancerId);
        result.setSkill(dto.getSkill());
        result.setScore(score);
        result.setLevel(level);
        result.setTotalQuestions(questions.size());
        result.setCorrectAnswers(correct);

        resultRepository.save(result);

        // --------------------------------------------------
        // Retourner le résultat
        // --------------------------------------------------

        return new SkillAssessmentResultDto(
                dto.getSkill(),
                score,
                level,
                questions.size(),
                correct
        );
    }

    /**
     * Détermine le niveau du freelancer.
     */
    private String calculateLevel(int score) {

        if (score >= 90) {
            return "Expert";
        }

        if (score >= 75) {
            return "Avancé";
        }

        if (score >= 60) {
            return "Intermédiaire";
        }

        return "Débutant";
    }

    /**
     * Récupère les résultats du freelancer.
     */
    public List<SkillAssessmentResult> getResults(
            Long freelancerId
    ) {

        return resultRepository
                .findByFreelancerId(freelancerId);
    }
}