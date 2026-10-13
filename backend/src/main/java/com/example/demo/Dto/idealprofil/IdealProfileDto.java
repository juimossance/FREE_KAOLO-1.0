package com.example.demo.Dto.idealprofil;

import java.util.List;

public class IdealProfileDto {

    public record SkillEvaluation(
            String nom,
            Integer score,
            String niveau
    ) {}

    public record Recommendation(
            Long id,
            String prenom,
            String nom,
            String specialite,
            String ville,
            String pays,
            String photoUrl,

            Integer scoreIA,

            Double noteMoyenne,
            Integer nombreAvis,

            Integer completudeProfil,

            Integer scoreCompetences,

            List<SkillEvaluation> competences,

            String disponibilite,
            Double tarifJournalier,

            String explication
    ) {}

    public record Response(
            String summary,
            List<Recommendation> recommendations,
            int totalTrouves
    ) {}
}
