package com.example.demo.Dto;

import java.util.List;

public class iACV {

    public record AtsCvDto(
            InfosPersonnelles infosPersonnelles,
            String titrePoste,
            String resume,
            Liens liens,
            List<String> competences,
            List<Experience> experiences,
            List<Formation> formations,
            List<String> langues,
            List<String> motsClesAts,
            List<Diagnostic> diagnostics,
            List<String> suggestions     // ce que l'IA a changé/recommande — à valider par l'utilisateur
    ) {
        public record InfosPersonnelles(
                String prenom,
                String nom,
                String email,
                String telephone,
                String ville
        ) {}

        public record Experience(
                String poste,
                String entreprise,
                String periode,
                List<String> bullets
        ) {}

        public record Formation(
                String diplome,
                String etablissement,
                String periode
        ) {}

        public record Liens(
                String linkedin,
                String github,
                String siteweb
        ) {}


        public record Diagnostic(
                String probleme,
                String impact,
                String recommandation,
                String gravite
        ) {}
    }

}