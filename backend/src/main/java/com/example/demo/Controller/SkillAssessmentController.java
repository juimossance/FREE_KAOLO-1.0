package com.example.demo.Controller;



import com.example.demo.Dto.testIA.SkillAssessmentDto;
import com.example.demo.Dto.testIA.SkillAssessmentResultDto;
import com.example.demo.Dto.testIA.SkillAssessmentSubmitDto;
import com.example.demo.entity.testIA.SkillAssessmentResult;
import com.example.demo.service.testIA.SkillAssessmentService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/skill-assessment")
@CrossOrigin(origins = "http://localhost:5173")
public class SkillAssessmentController {

    private final SkillAssessmentService service;

    public SkillAssessmentController(
            SkillAssessmentService service
    ) {
        this.service = service;
    }

    /**
     * Retourne les compétences du freelancer.
     */
    @GetMapping("/skills/{freelancerId}")
    public List<String> getSkills(
            @PathVariable Long freelancerId
    ) {

        return service.getFreelancerSkills(
                freelancerId
        );
    }

    /**
     * Génère une évaluation IA.
     */
    @PostMapping("/generate/{freelancerId}")
    public SkillAssessmentDto generate(
            @PathVariable Long freelancerId,
            @RequestParam String skill
    ) {

        return service.generateAssessment(
                freelancerId,
                skill
        );
    }

    /**
     * Soumet les réponses.
     */
    @PostMapping("/submit/{freelancerId}")
    public SkillAssessmentResultDto submit(
            @PathVariable Long freelancerId,
            @RequestBody SkillAssessmentSubmitDto dto
    ) {

        return service.submitAssessment(
                freelancerId,
                dto
        );
    }

    /**
     * Résultats précédents.
     */
    @GetMapping("/results/{freelancerId}")
    public List<SkillAssessmentResult> results(
            @PathVariable Long freelancerId
    ) {

        return service.getResults(
                freelancerId
        );
    }
}
