package com.example.demo.service.idealprofil;

import com.example.demo.Dto.idealprofil.IdealProfileDto;
import com.example.demo.entity.Cv;
import com.example.demo.entity.Freelancer;
import com.example.demo.entity.testIA.SkillAssessmentResult;
import com.example.demo.repository.CandidatureRepository;
import com.example.demo.repository.CvRepository;
import com.example.demo.repository.SkillAssessmentResultRepository;
import com.example.demo.repository.freelancerRepository;

import org.springframework.stereotype.Service;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import java.text.Normalizer;
import java.util.*;
import java.util.stream.Stream;

@Service
public class RecommendationIAService {

    private static final ObjectMapper MAPPER = new ObjectMapper();

    /** Nombre max de profils pour une correspondance exacte. */
    private static final int LIMITE_EXACTE = 10;

    /** Nombre de profils proposés en alternative quand rien ne correspond. */
    private static final int LIMITE_ALTERNATIVES = 5;

    // champs du brouillon CV utiles pour la recherche (pas les coordonnées)
    private static final List<String> CHAMPS_CV = List.of(
            "titrePoste",
            "resume",
            "competences",
            "experiences",
            "formations",
            "langues",
            "motsClesAts"
    );

    /**
     * Résultat d'une recherche.
     *
     * correspondanceExacte = true  : au moins un profil correspond à la demande.
     * correspondanceExacte = false : aucun profil ne correspond, ce sont des
     *                                propositions alternatives (les mieux classées).
     */
    public record Resultat(
            List<IdealProfileDto.Recommendation> recommandations,
            boolean correspondanceExacte
    ) {}

    private final freelancerRepository freelancerRepository;
    private final CandidatureRepository candidatureRepository;
    private final SkillAssessmentResultRepository skillAssessmentResultRepository;
    private final CvRepository cvRepository;

    public RecommendationIAService(
            freelancerRepository freelancerRepository,
            CandidatureRepository candidatureRepository,
            SkillAssessmentResultRepository skillAssessmentResultRepository,
            CvRepository cvRepository
    ) {
        this.freelancerRepository = freelancerRepository;
        this.candidatureRepository = candidatureRepository;
        this.skillAssessmentResultRepository = skillAssessmentResultRepository;
        this.cvRepository = cvRepository;
    }

    // ------------------------------------------------------------
    // API PUBLIQUE
    // ------------------------------------------------------------

    // anciennes signatures conservées pour ne pas casser le reste du code
    public List<IdealProfileDto.Recommendation> recommander(
            List<String> competencesRecherchees,
            String localisation,
            String niveau,
            Double budget
    ) {
        return recommander(competencesRecherchees, List.of(), localisation, niveau, budget);
    }

    public List<IdealProfileDto.Recommendation> recommander(
            List<String> competencesRecherchees,
            List<String> motsCles,
            String localisation,
            String niveau,
            Double budget
    ) {
        return rechercher(competencesRecherchees, motsCles, localisation, niveau, budget)
                .recommandations();
    }

    /**
     * Recherche principale.
     *
     * Ne renvoie une liste vide que s'il n'existe aucun freelancer en base :
     * si rien ne correspond, on propose les meilleurs profils en alternative.
     */
    public Resultat rechercher(
            List<String> competencesRecherchees,
            List<String> motsCles,
            String localisation,
            String niveau,
            Double budget
    ) {
        // compétences demandées + synonymes / mots-clés, utilisés pour le score
        List<String> cibles = Stream.concat(
                        competencesRecherchees == null ? Stream.<String>empty() : competencesRecherchees.stream(),
                        motsCles == null ? Stream.<String>empty() : motsCles.stream()
                )
                .filter(Objects::nonNull)
                .map(String::trim)
                .filter(s -> !s.isBlank())
                .distinct()
                .toList();

        boolean rechercheCiblee = !cibles.isEmpty();

        List<IdealProfileDto.Recommendation> tous = new ArrayList<>();
        Set<Long> idsCorrespondants = new HashSet<>();

        for (Freelancer freelancer : freelancerRepository.findAll()) {

            List<SkillAssessmentResult> assessments =
                    skillAssessmentResultRepository.findByFreelancerId(freelancer.getId());

            Double noteMoyenne = candidatureRepository.moyenneNote(freelancer.getId());
            long nombreAvis = candidatureRepository.countAvis(freelancer.getId());

            if (noteMoyenne == null) {
                noteMoyenne = 0.0;
            }

            String texte = texteProfil(freelancer, texteCv(freelancer.getId()));

            int scoreCompetences = calculerScoreCompetences(freelancer, assessments, cibles, texte);

            // un profil "correspond" s'il n'y a pas de critère, ou s'il matche au moins un critère
            if (!rechercheCiblee || scoreCompetences > 0) {
                idsCorrespondants.add(freelancer.getId());
            }

            int scoreTests = calculerScoreTests(assessments, cibles);
            int scoreNote = normaliserNote(noteMoyenne);
            int scoreProfil = limiter(freelancer.getCompletudeProfil());
            int scoreLocalisation = calculerScoreLocalisation(freelancer, localisation);
            int scoreBudget = calculerScoreBudget(freelancer, budget);

            int scoreFinal = calculerScoreFinal(
                    scoreCompetences,
                    scoreTests,
                    scoreNote,
                    scoreProfil,
                    scoreLocalisation,
                    scoreBudget
            );

            List<IdealProfileDto.SkillEvaluation> skills =
                    construireCompetences(assessments, competencesRecherchees);

            tous.add(new IdealProfileDto.Recommendation(
                    freelancer.getId(),
                    freelancer.getPrenom(),
                    freelancer.getNom(),
                    freelancer.getSpecialite(),
                    freelancer.getVille(),
                    freelancer.getPays(),
                    freelancer.getPhotoUrl(),
                    scoreFinal,
                    arrondir(noteMoyenne),
                    (int) nombreAvis,
                    scoreProfil,
                    scoreCompetences,
                    skills,
                    freelancer.getDisponibilite(),
                    freelancer.getTarifJournalier(),
                    null
            ));
        }

        List<IdealProfileDto.Recommendation> classes = tous.stream()
                .sorted(Comparator.comparingInt(IdealProfileDto.Recommendation::scoreIA).reversed())
                .toList();

        List<IdealProfileDto.Recommendation> exacts = classes.stream()
                .filter(r -> idsCorrespondants.contains(r.id()))
                .limit(LIMITE_EXACTE)
                .toList();

        if (!exacts.isEmpty()) {
            return new Resultat(exacts, true);
        }

        // Fallback : rien ne correspond, on propose quand même les meilleurs profils
        return new Resultat(
                classes.stream().limit(LIMITE_ALTERNATIVES).toList(),
                false
        );
    }

    // ------------------------------------------------------------
    // TEXTE DE RECHERCHE : profil + contenu du CV
    // ------------------------------------------------------------

    private String texteProfil(Freelancer f, String texteCv) {
        String competences = f.getCompetence() == null
                ? ""
                : String.join(" ", f.getCompetence());

        return normaliser(String.join(" ",
                nz(f.getSpecialite()),
                nz(f.getDescription()),
                nz(f.getBioEtCompetences()),
                nz(f.getExperience()),
                competences,
                texteCv
        ));
    }

    private String texteCv(Long freelancerId) {
        try {
            String json = cvRepository
                    .findByFreelancerId(freelancerId)
                    .map(Cv::getAtsCvDraft)
                    .orElse(null);

            if (json == null || json.isBlank()) {
                return "";
            }

            JsonNode root = MAPPER.readTree(json);
            StringBuilder sb = new StringBuilder();

            for (String champ : CHAMPS_CV) {
                collecterTextes(root.get(champ), sb);
            }

            return sb.toString();

        } catch (Exception e) {
            return "";
        }
    }

    private void collecterTextes(JsonNode node, StringBuilder sb) {
        if (node == null || node.isNull()) {
            return;
        }
        if (node.isTextual()) {
            sb.append(node.asText()).append(' ');
            return;
        }
        if (node.isContainer()) {
            node.forEach(child -> collecterTextes(child, sb));
        }
    }

    private String nz(String s) {
        return s == null ? "" : s;
    }

    // ------------------------------------------------------------
    // SCORES
    // ------------------------------------------------------------

    private int calculerScoreCompetences(
            Freelancer freelancer,
            List<SkillAssessmentResult> assessments,
            List<String> recherchees,
            String texte
    ) {
        if (recherchees == null || recherchees.isEmpty()) {
            return 50;
        }

        List<String> declarees = freelancer.getCompetence() == null
                ? List.of()
                : freelancer.getCompetence();

        int total = 0;
        int count = 0;

        for (String recherchee : recherchees) {
            String cible = racine(normaliser(recherchee));

            if (cible.isBlank()) {
                continue;
            }

            boolean dansListe = declarees.stream()
                    .anyMatch(skill -> normaliser(skill).contains(cible));
            boolean dansTexte = texte.contains(cible);

            if (!dansListe && !dansTexte) {
                continue;
            }

            // une compétence déclarée vaut un peu plus qu'une simple mention
            int score = dansListe ? 60 : 50;

            Optional<SkillAssessmentResult> assessment = derniereEvaluation(assessments, cible);

            if (assessment.isPresent() && assessment.get().getScore() != null) {
                score = limiter(assessment.get().getScore());
            }

            total += score;
            count++;
        }

        if (count == 0) {
            return 0;
        }

        return Math.round((float) total / count);
    }

    private int calculerScoreTests(
            List<SkillAssessmentResult> assessments,
            List<String> recherchees
    ) {
        if (recherchees == null || recherchees.isEmpty()) {
            return 50;
        }

        List<Integer> scores = new ArrayList<>();

        for (String recherchee : recherchees) {
            derniereEvaluation(assessments, racine(normaliser(recherchee))).ifPresent(a -> {
                if (a.getScore() != null) {
                    scores.add(limiter(a.getScore()));
                }
            });
        }

        if (scores.isEmpty()) {
            return 50;
        }

        return (int) Math.round(
                scores.stream().mapToInt(Integer::intValue).average().orElse(50)
        );
    }

    private Optional<SkillAssessmentResult> derniereEvaluation(
            List<SkillAssessmentResult> assessments,
            String cible
    ) {
        if (cible == null || cible.isBlank()) {
            return Optional.empty();
        }

        return assessments.stream()
                .filter(a -> a.getSkill() != null && normaliser(a.getSkill()).contains(cible))
                .max(Comparator.comparing(
                        SkillAssessmentResult::getCreatedAt,
                        Comparator.nullsFirst(Comparator.naturalOrder())
                ));
    }

    private int calculerScoreLocalisation(Freelancer freelancer, String localisation) {
        if (localisation == null || localisation.isBlank()) {
            return 100;
        }
        if (freelancer.getVille() == null) {
            return 0;
        }
        return normaliser(freelancer.getVille()).contains(normaliser(localisation)) ? 100 : 0;
    }

    private int calculerScoreBudget(Freelancer freelancer, Double budget) {
        if (budget == null || budget <= 0 || freelancer.getTarifJournalier() == null) {
            return 100;
        }
        if (freelancer.getTarifJournalier() <= budget) {
            return 100;
        }

        double pourcentage = (freelancer.getTarifJournalier() - budget) / budget;

        if (pourcentage <= 0.10) {
            return 80;
        }
        if (pourcentage <= 0.20) {
            return 60;
        }
        return 30;
    }

    private int calculerScoreFinal(
            int competences,
            int tests,
            int note,
            int profil,
            int localisation,
            int budget
    ) {
        double score = competences * 0.30
                + tests * 0.30
                + note * 0.15
                + profil * 0.15
                + localisation * 0.05
                + budget * 0.05;

        return limiter((int) Math.round(score));
    }

    private int normaliserNote(Double note) {
        if (note == null) {
            return 50;
        }
        return limiter((int) Math.round(note * 20));
    }

    private List<IdealProfileDto.SkillEvaluation> construireCompetences(
            List<SkillAssessmentResult> assessments,
            List<String> recherchees
    ) {
        if (recherchees == null || recherchees.isEmpty()) {
            return assessments.stream()
                    .limit(10)
                    .map(a -> new IdealProfileDto.SkillEvaluation(
                            a.getSkill(),
                            a.getScore(),
                            a.getLevel()
                    ))
                    .toList();
        }

        return recherchees.stream()
                .map(recherchee -> derniereEvaluation(assessments, racine(normaliser(recherchee)))
                        .map(a -> new IdealProfileDto.SkillEvaluation(
                                a.getSkill(),
                                a.getScore(),
                                a.getLevel()
                        ))
                        .orElse(new IdealProfileDto.SkillEvaluation(
                                recherchee,
                                null,
                                "Non évalué"
                        )))
                .toList();
    }

    // ------------------------------------------------------------
    // UTILITAIRES
    // ------------------------------------------------------------

    // minuscules et sans accents : "Développeur" et "developpeur" deviennent identiques
    private String normaliser(String value) {
        if (value == null) {
            return "";
        }
        return Normalizer.normalize(value, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .toLowerCase(Locale.ROOT)
                .trim();
    }

    // "developpeurs" doit aussi trouver "developpeur"
    private String racine(String cible) {
        return cible.length() > 3 && cible.endsWith("s")
                ? cible.substring(0, cible.length() - 1)
                : cible;
    }

    private int limiter(int score) {
        return Math.max(0, Math.min(100, score));
    }

    private double arrondir(double value) {
        return Math.round(value * 10.0) / 10.0;
    }
}