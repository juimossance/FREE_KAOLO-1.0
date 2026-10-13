package com.example.demo.Controller;

import com.example.demo.Dto.UserPrincipal;
import com.example.demo.Dto.iACV;
import com.example.demo.Dto.idealprofil.IdealProfileDto;
import com.example.demo.entity.Cv;
import com.example.demo.entity.Freelancer;
import com.example.demo.repository.CvRepository;
import com.example.demo.repository.freelancerRepository;
import com.example.demo.service.IAcvservice.AtsPdfGenerator;
import com.example.demo.service.IAcvservice.CvTextExtractionService;
import com.example.demo.service.idealprofil.RecommendationIAService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import tools.jackson.databind.ObjectMapper;

import java.text.Normalizer;
import java.time.LocalDateTime;
import java.util.*;

/**
 * Contrôleur des fonctionnalités IA de Free-Kaolo.
 *
 * Architecture de /api/ai/ideal-profile :
 *
 * React
 *    ↓
 * Groq comprend le besoin (extraction des critères)
 *    ↓
 * RecommendationIAService interroge MySQL
 *    ↓
 * calcul déterministe des scores
 *    (si aucune correspondance : meilleurs profils en alternative)
 *    ↓
 * Groq explique les recommandations
 *    ↓
 * réponse : summary + recommendations + exactMatch
 */
@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "http://localhost:5173")
public class AIController {

    private static final Logger log = LoggerFactory.getLogger(AIController.class);

    /** Mots sans valeur de recherche, ignorés lors du repli sur la phrase brute. */
    private static final Set<String> MOTS_VIDES = Set.of(
            "veux", "voudrais", "cherche", "cherchons", "recherche", "recherchons",
            "besoin", "pour", "avec", "dans", "sans", "nous", "plus", "tres", "mois",
            "semaines", "annee", "annees", "experience", "minimum", "moins", "entreprise",
            "projet", "freelance", "freelancer", "freelances", "profil", "trouver",
            "trouve", "aide", "quelqu", "personne", "pouvez", "souhaite", "souhaitons",
            "unique", "bonjour", "merci"
    );

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final RestTemplate restTemplate = new RestTemplate();

    private final RecommendationIAService recommendationIAService;
    private final freelancerRepository freelancerRepo;
    private final CvRepository cvRepository;
    private final CvTextExtractionService cvTextExtractionService;
    private final AtsPdfGenerator atsPdfGenerator;

    @Value("${groq.api.key}")
    private String groqApiKey;

    @Value("${groq.api.url:https://api.groq.com/openai/v1/chat/completions}")
    private String groqApiUrl;

    @Value("${groq.model:openai/gpt-oss-120b}")
    private String groqModel;

    public AIController(
            RecommendationIAService recommendationIAService,
            freelancerRepository freelancerRepo,
            CvRepository cvRepository,
            CvTextExtractionService cvTextExtractionService,
            AtsPdfGenerator atsPdfGenerator
    ) {
        this.recommendationIAService = recommendationIAService;
        this.freelancerRepo = freelancerRepo;
        this.cvRepository = cvRepository;
        this.cvTextExtractionService = cvTextExtractionService;
        this.atsPdfGenerator = atsPdfGenerator;
    }

    // ============================================================
    // CHAT GENERIQUE
    // ============================================================

    @PostMapping("/chat")
    public ResponseEntity<Map<String, Object>> chat(@RequestBody Map<String, Object> body) {
        try {
            String systemPrompt = String.valueOf(body.getOrDefault("systemPrompt", """
                    Tu es l'assistant IA de Free-Kaolo,
                    une plateforme camerounaise de mise
                    en relation entre entreprises et freelances.

                    Réponds en français.
                    Sois précis, professionnel et utile.
                    """));

            List<Map<String, String>> messages = convertMessages(body.get("messages"));

            return ResponseEntity.ok(callGroq(systemPrompt, messages, false));

        } catch (Exception e) {
            log.error("Erreur /api/ai/chat", e);
            return erreur("Erreur lors de la communication avec l'assistant IA.");
        }
    }

    // ============================================================
    // ANALYSE CV
    // ============================================================

    @PostMapping("/analyze-cv")
    public ResponseEntity<?> analyzeCv(@AuthenticationPrincipal UserPrincipal currentUser) {
        try {
            if (!estFreelancer(currentUser)) {
                return interdit("Cette fonctionnalité est réservée aux freelancers.");
            }

            Long freelancerId = currentUser.getFreelancerId();
            Freelancer freelancer = chargerFreelancer(freelancerId);

            Cv cv = cvRepository.findByFreelancerId(freelancerId)
                    .orElseGet(() -> new Cv(freelancer));

            if (cv.getCvData() == null || cv.getCvcontentType() == null) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Aucun CV n'a été importé."));
            }

            String texteCv = cvTextExtractionService.extract(
                    cv.getCvData(),
                    cv.getCvcontentType()
            );

            String systemPrompt = """
                    Tu es un expert en recrutement et en optimisation
                    de CV pour les systèmes ATS.

                    RÈGLE ABSOLUE :

                    Tu ne dois JAMAIS inventer une information absente
                    du CV.

                    Tu ne dois notamment pas inventer :
                    - employeur ;
                    - diplôme ;
                    - certification ;
                    - date ;
                    - expérience ;
                    - compétence ;
                    - projet ;
                    - année d'expérience.

                    Tu peux uniquement :
                    - reformuler ;
                    - structurer ;
                    - améliorer la présentation ;
                    - proposer des mots-clés dans suggestions.

                    Les suggestions doivent rester des propositions
                    que le candidat devra valider.

                    Génère 3 à 6 diagnostics concrets.

                    Chaque diagnostic doit contenir :
                    - probleme ;
                    - impact ;
                    - recommandation ;
                    - gravite.

                    gravite doit être :
                    critique
                    important
                    mineur

                    Retourne UNIQUEMENT un objet JSON valide.

                    Format obligatoire :

                    {
                      "infosPersonnelles": {
                        "prenom": "",
                        "nom": "",
                        "email": "",
                        "telephone": "",
                        "ville": ""
                      },
                      "liens": {
                        "linkedin": "",
                        "github": "",
                        "siteweb": ""
                      },
                      "titrePoste": "",
                      "resume": "",
                      "diagnostics": [],
                      "competences": [],
                      "experiences": [],
                      "formations": [],
                      "langues": [],
                      "motsClesAts": [],
                      "suggestions": []
                    }
                    """;

            String userPrompt = """
                    Voici le texte brut extrait du CV.

                    Analyse-le sans inventer d'informations.

                    TEXTE DU CV :

                    %s
                    """.formatted(texteCv);

            Map<String, Object> result = callGroq(systemPrompt, messageUtilisateur(userPrompt), true);

            String json = cleanJson(String.valueOf(result.get("content")));

            iACV.AtsCvDto atsCv = objectMapper.readValue(json, iACV.AtsCvDto.class);

            return ResponseEntity.ok(atsCv);

        } catch (Exception e) {
            log.error("Erreur analyse CV", e);
            return erreur("Impossible d'analyser le CV : " + e.getMessage());
        }
    }

    // ============================================================
    // GENERATION PDF ATS
    // ============================================================

    @PostMapping("/generate-ats-cv/pdf")
    public ResponseEntity<byte[]> generateAtsCvPdf(@RequestBody iACV.AtsCvDto cv) {

        byte[] pdf = atsPdfGenerator.generate(cv);

        String nom = cv.infosPersonnelles() != null
                && cv.infosPersonnelles().nom() != null
                && !cv.infosPersonnelles().nom().isBlank()
                ? cv.infosPersonnelles().nom()
                : "cv";

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        ContentDisposition.attachment()
                                .filename("CV-" + nom + "-ATS.pdf")
                                .build()
                                .toString()
                )
                .body(pdf);
    }

    // ============================================================
    // GENERATION RAPPORT
    // ============================================================

    @PostMapping("/generate-report")
    public ResponseEntity<Map<String, Object>> generateReport(@RequestBody Map<String, Object> body) {
        try {
            String role = String.valueOf(body.getOrDefault("role", "FREELANCER"));
            String type = String.valueOf(body.getOrDefault("type", "performance"));
            String dateDebut = String.valueOf(body.getOrDefault("dateDebut", "2026-01-01"));
            String dateFin = String.valueOf(body.getOrDefault("dateFin", "2026-06-30"));

            String systemPrompt = role.equals("FREELANCER")
                    ? """
                      Tu es un analyste spécialisé
                      dans les freelancers africains.
                      Génère des analyses professionnelles,
                      réalistes et actionnables.
                      """
                    : """
                      Tu es un analyste business spécialisé
                      dans les entreprises africaines.
                      Génère des analyses professionnelles,
                      réalistes et actionnables.
                      """;

            String userPrompt = buildReportPrompt(role, type, dateDebut, dateFin);

            return ResponseEntity.ok(callGroq(systemPrompt, messageUtilisateur(userPrompt), false));

        } catch (Exception e) {
            log.error("Erreur génération rapport", e);
            return erreur("Impossible de générer le rapport.");
        }
    }

    // ============================================================
    // PROFIL IDEAL
    // ============================================================

    @PostMapping("/ideal-profile")
    public ResponseEntity<?> idealProfile(@RequestBody Map<String, Object> body) {

        try {
            // ── 1. Critères : phrase libre et/ou champs structurés ────────────
            String message = getString(body, "message");
            String competences = getString(body, "competences");
            String niveau = getString(body, "niveau");
            String projet = getString(body, "projet");
            String duree = getString(body, "duree");
            String localisation = getString(body, "localisation");
            String budgetText = getString(body, "budget");

            if (!message.isBlank()) {
                Map<String, String> criteresIA = extractIdealProfileCriteria(message);

                competences = firstNonBlank(criteresIA.get("competences"), competences);
                niveau = firstNonBlank(criteresIA.get("niveau"), niveau);
                projet = firstNonBlank(criteresIA.get("projet"), projet);
                duree = firstNonBlank(criteresIA.get("duree"), duree);
                localisation = firstNonBlank(criteresIA.get("localisation"), localisation);
                budgetText = firstNonBlank(criteresIA.get("budget"), budgetText);
            }

            Double budget = parseBudget(budgetText);

            List<String> competencesRecherchees = Arrays.stream(competences.split("[,;]+"))
                    .map(String::trim)
                    .filter(s -> !s.isBlank())
                    .toList();

            // Requête trop vague : Groq n'a rien extrait.
            // On se rabat sur les mots significatifs de la phrase d'origine.
            List<String> motsCles = competencesRecherchees.isEmpty()
                    ? extraireMotsCles(message)
                    : List.of();

            // ── 2. Calcul métier (MySQL, scores déterministes) ────────────────
            RecommendationIAService.Resultat resultat = recommendationIAService.rechercher(
                    competencesRecherchees,
                    motsCles,
                    localisation,
                    niveau,
                    budget
            );

            List<IdealProfileDto.Recommendation> recommandations = resultat.recommandations();
            boolean exact = resultat.correspondanceExacte();

            Map<String, Object> criteria = construireCriteres(
                    competencesRecherchees, niveau, projet, duree, localisation, budget
            );

            // Seul cas réel de liste vide : aucun freelancer en base
            if (recommandations.isEmpty()) {
                return ResponseEntity.ok(reponse(
                        "Aucun freelance n'est encore inscrit sur la plateforme.",
                        List.of(),
                        false,
                        criteria
                ));
            }

            // ── 3. Explications par Groq (facultatives) ───────────────────────
            Map<Long, String> explications = new HashMap<>();
            String summary = exact
                    ? "Voici les profils les plus pertinents pour votre besoin."
                    : "Aucun profil ne correspond exactement à votre demande. "
                      + "Voici les profils les plus proches, à vérifier avec vous.";

            try {
                String systemPrompt = """
                        Tu es l'assistant intelligent de recrutement
                        de Free-Kaolo.

                        Tu aides une entreprise camerounaise à sélectionner
                        des freelances.

                        Les profils reçus ont déjà été classés par
                        l'algorithme métier de Free-Kaolo.

                        TON ROLE :

                        - expliquer les résultats ;
                        - mettre en évidence les points forts ;
                        - signaler les éléments à vérifier ;
                        - aider l'entreprise à comprendre le classement.

                        RÈGLE ABSOLUE :

                        Tu dois utiliser UNIQUEMENT les informations
                        fournies.

                        Tu ne dois jamais inventer :
                        - compétence ;
                        - expérience ;
                        - diplôme ;
                        - certification ;
                        - projet ;
                        - client ;
                        - note ;
                        - score ;
                        - niveau technique ;
                        - disponibilité.

                        Le score global est calculé par Free-Kaolo.
                        Tu ne dois jamais le modifier.

                        Si une compétence est "Non évalué",
                        indique simplement qu'elle n'a pas encore été évaluée.

                        Ne transforme jamais "Non évalué" en "faible".

                        Si le message précise qu'aucun profil ne correspond
                        exactement, dis-le clairement dans le summary, présente
                        les profils comme des alternatives et précise ce qui
                        diffère de la demande.

                        Retourne UNIQUEMENT un JSON valide.

                        Format :

                        {
                          "summary": "...",
                          "recommendations": [
                            {
                              "freelancerId": 1,
                              "explication": "...",
                              "pointsForts": [],
                              "pointsAttention": []
                            }
                          ]
                        }
                        """;

                String contexteMatch = exact
                        ? ""
                        : """
                          ATTENTION : aucun profil ne correspond exactement à la demande.
                          Les profils ci-dessous sont des propositions alternatives.

                          """;

                String userPrompt = """
                        %sBESOIN DE L'ENTREPRISE

                        Demande d'origine :
                        %s

                        Projet :
                        %s

                        Compétences recherchées :
                        %s

                        Niveau recherché :
                        %s

                        Localisation :
                        %s

                        Budget :
                        %s

                        Durée :
                        %s


                        PROFILS SELECTIONNES :

                        %s
                        """.formatted(
                        contexteMatch,
                        safe(message),
                        safe(projet),
                        competencesRecherchees.isEmpty()
                                ? "Non précisées"
                                : String.join(", ", competencesRecherchees),
                        safe(niveau),
                        safe(localisation),
                        budget != null ? budget + " FCFA" : "Non précisé",
                        safe(duree),
                        formatProfils(recommandations)
                );

                Map<String, Object> ia = callGroq(systemPrompt, messageUtilisateur(userPrompt), true);

                Map<?, ?> parsed = objectMapper.readValue(
                        cleanJson(String.valueOf(ia.get("content"))),
                        Map.class
                );

                summary = stringValue(parsed, "summary", summary);

                if (parsed.get("recommendations") instanceof List<?> list) {
                    for (Object item : list) {
                        if (!(item instanceof Map<?, ?> map) || map.get("freelancerId") == null) {
                            continue;
                        }
                        try {
                            Long id = Long.valueOf(String.valueOf(map.get("freelancerId")));
                            explications.put(id, stringValue(map, "explication", ""));
                        } catch (NumberFormatException ignored) {
                            // id invalide : on ignore cette explication
                        }
                    }
                }

            } catch (Exception e) {
                // Groq en panne ou JSON invalide : les recommandations restent affichées
                log.warn("Explications IA indisponibles, repli sur le texte par défaut", e);
            }

            // ── 4. Fusion score métier + explication ──────────────────────────
            String explicationParDefaut = exact
                    ? "Profil correspondant aux critères recherchés."
                    : "Profil proposé en alternative : il ne correspond pas exactement à la demande.";

            List<IdealProfileDto.Recommendation> finales = recommandations.stream()
                    .map(r -> {
                        String explication = explications.get(r.id());

                        return new IdealProfileDto.Recommendation(
                                r.id(),
                                r.prenom(),
                                r.nom(),
                                r.specialite(),
                                r.ville(),
                                r.pays(),
                                r.photoUrl(),
                                r.scoreIA(),
                                r.noteMoyenne(),
                                r.nombreAvis(),
                                r.completudeProfil(),
                                r.scoreCompetences(),
                                r.competences(),
                                r.disponibilite(),
                                r.tarifJournalier(),
                                explication != null && !explication.isBlank()
                                        ? explication
                                        : explicationParDefaut
                        );
                    })
                    .toList();

            return ResponseEntity.ok(reponse(summary, finales, exact, criteria));

        } catch (Exception e) {
            log.error("Erreur recommandations IA", e);
            return erreur("Erreur lors de la génération des recommandations.");
        }
    }

    // ============================================================
    // EXTRACTION DES CRITERES PAR GROQ
    // ============================================================

    private Map<String, String> extractIdealProfileCriteria(String message) {

        String systemPrompt = """
                Tu es un moteur d'extraction de critères
                pour une plateforme de recrutement freelance.

                Analyse la demande de l'entreprise.

                Extrais uniquement les informations réellement
                présentes dans la demande.

                Retourne UNIQUEMENT un JSON valide :

                {
                  "competences": "",
                  "niveau": "",
                  "projet": "",
                  "duree": "",
                  "localisation": "",
                  "budget": ""
                }

                Règles :

                - competences : liste séparée par des virgules ;
                - niveau : niveau ou expérience demandée ;
                - projet : description courte du projet ;
                - duree : durée du projet ;
                - localisation : ville ou zone ;
                - budget : montant si présent.

                Si une information n'est pas présente,
                retourne une chaîne vide.

                N'invente aucune information.
                """;

        try {
            Map<String, Object> result = callGroq(systemPrompt, messageUtilisateur(message), true);

            Map<?, ?> parsed = objectMapper.readValue(
                    cleanJson(String.valueOf(result.get("content"))),
                    Map.class
            );

            Map<String, String> criteres = new HashMap<>();
            for (String cle : List.of("competences", "niveau", "projet", "duree", "localisation", "budget")) {
                criteres.put(cle, stringValue(parsed, cle, ""));
            }
            return criteres;

        } catch (Exception e) {
            // L'extraction ne doit jamais bloquer la recherche
            log.warn("Impossible d'extraire les critères IA", e);
            return Map.of();
        }
    }

    // ============================================================
    // ANALYSE MARCHE
    // ============================================================

    @PostMapping("/analysis")
    public ResponseEntity<Map<String, Object>> analysis(@RequestBody Map<String, Object> body) {
        try {
            String type = String.valueOf(body.getOrDefault("type", "market"));
            String role = String.valueOf(body.getOrDefault("role", "FREELANCER"));

            Map<String, String> freelancerPrompts = Map.of(
                    "market",
                    "Analyse le marché des freelancers tech en Afrique en 2026. Tendances, opportunités et compétences demandées.",
                    "profile",
                    "Conseils pour optimiser un profil freelancer africain.",
                    "competition",
                    "Comment se démarquer comme freelancer junior en Afrique.",
                    "forecast",
                    "Prévisions du marché freelance tech africain pour 2026."
            );

            Map<String, String> enterprisePrompts = Map.of(
                    "market",
                    "Analyse le marché des freelancers tech disponibles en Afrique.",
                    "budget",
                    "Comment budgétiser les projets freelance pour une PME africaine.",
                    "risk",
                    "Risques lors du recrutement de freelancers et moyens de les réduire.",
                    "trends",
                    "Tendances 2026 pour les entreprises externalisant leurs projets en Afrique."
            );

            Map<String, String> prompts = role.equals("FREELANCER")
                    ? freelancerPrompts
                    : enterprisePrompts;

            String userPrompt = prompts.getOrDefault(type, "Analyse le marché freelance africain.");

            return ResponseEntity.ok(callGroq(
                    """
                    Tu es un analyste expert du marché
                    freelance africain.

                    Réponds en français.

                    Sois concis, professionnel
                    et actionnable.
                    """,
                    messageUtilisateur(userPrompt),
                    false
            ));

        } catch (Exception e) {
            log.error("Erreur analyse marché", e);
            return erreur("Impossible de générer l'analyse.");
        }
    }

    // ============================================================
    // CV DRAFT - GET
    // ============================================================

    @GetMapping("/cv-draft")
    public ResponseEntity<?> getCvDraft(@AuthenticationPrincipal UserPrincipal currentUser) {

        if (!estFreelancer(currentUser)) {
            return interdit("Réservé aux freelancers.");
        }

        try {
            Long freelancerId = currentUser.getFreelancerId();
            Freelancer freelancer = chargerFreelancer(freelancerId);

            Cv cv = cvRepository.findByFreelancerId(freelancerId)
                    .orElseGet(() -> new Cv(freelancer));

            if (cv.getAtsCvDraft() == null || cv.getAtsCvDraft().isBlank()) {
                return ResponseEntity.noContent().build();
            }

            iACV.AtsCvDto draft = objectMapper.readValue(cv.getAtsCvDraft(), iACV.AtsCvDto.class);

            return ResponseEntity.ok(draft);

        } catch (Exception e) {
            log.warn("Impossible de charger le brouillon CV", e);
            return ResponseEntity.noContent().build();
        }
    }

    // ============================================================
    // CV DRAFT - PUT
    // ============================================================

    @PutMapping("/cv-draft")
    public ResponseEntity<?> saveCvDraft(
            @RequestBody iACV.AtsCvDto cvDto,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {

        if (!estFreelancer(currentUser)) {
            return interdit("Réservé aux freelancers.");
        }

        try {
            Long freelancerId = currentUser.getFreelancerId();
            Freelancer freelancer = chargerFreelancer(freelancerId);

            Cv cv = cvRepository.findByFreelancerId(freelancerId)
                    .orElseGet(() -> new Cv(freelancer));

            cv.setAtsCvDraft(objectMapper.writeValueAsString(cvDto));
            cv.setAtsCvDraftUpdatedAt(LocalDateTime.now());

            // On sauvegarde bien le Cv (et non le Freelancer)
            cvRepository.save(cv);

            return ResponseEntity.ok(Map.of(
                    "saved", true,
                    "updatedAt", cv.getAtsCvDraftUpdatedAt()
            ));

        } catch (Exception e) {
            log.error("Erreur sauvegarde brouillon CV", e);
            return erreur("Impossible d'enregistrer le brouillon.");
        }
    }

    // ============================================================
    // APPEL GROQ
    // ============================================================

    private Map<String, Object> callGroq(
            String systemPrompt,
            List<Map<String, String>> messages,
            boolean jsonMode
    ) {
        try {
            if (groqApiKey == null || groqApiKey.isBlank()) {
                throw new IllegalStateException("La clé API Groq n'est pas configurée.");
            }

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(groqApiKey);

            List<Map<String, String>> allMessages = new ArrayList<>();
            allMessages.add(Map.of("role", "system", "content", systemPrompt));

            if (messages != null) {
                allMessages.addAll(messages);
            }

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", groqModel);
            requestBody.put("messages", allMessages);
            requestBody.put("max_tokens", 4000);
            requestBody.put("temperature", jsonMode ? 0.1 : 0.7);

            // JSON mode uniquement quand on demande réellement du JSON
            if (jsonMode) {
                requestBody.put("response_format", Map.of("type", "json_object"));
            }

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

            ResponseEntity<Map> response = restTemplate.postForEntity(groqApiUrl, request, Map.class);

            if (!response.getStatusCode().is2xxSuccessful()) {
                throw new RuntimeException("Groq HTTP " + response.getStatusCode());
            }

            Map<?, ?> responseBody = response.getBody();

            if (responseBody == null) {
                throw new RuntimeException("Réponse Groq vide.");
            }

            if (responseBody.get("error") != null) {
                throw new RuntimeException("Erreur Groq : " + responseBody.get("error"));
            }

            if (!(responseBody.get("choices") instanceof List<?> choices) || choices.isEmpty()) {
                throw new RuntimeException("La réponse Groq ne contient aucun choix.");
            }

            if (!(choices.get(0) instanceof Map<?, ?> firstChoice)) {
                throw new RuntimeException("Structure choices Groq invalide.");
            }

            if (!(firstChoice.get("message") instanceof Map<?, ?> message)) {
                throw new RuntimeException("Message Groq introuvable.");
            }

            if (message.get("content") == null) {
                throw new RuntimeException("Contenu Groq vide.");
            }

            Map<String, Object> result = new HashMap<>();
            result.put("content", String.valueOf(message.get("content")));
            result.put("model", groqModel);

            return result;

        } catch (Exception e) {
            log.error("Erreur appel Groq", e);
            throw new RuntimeException("Erreur lors de l'appel à Groq : " + e.getMessage(), e);
        }
    }

    // ============================================================
    // HELPERS - REPONSES
    // ============================================================

    private ResponseEntity<Map<String, Object>> erreur(String message) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", message));
    }

    private ResponseEntity<Map<String, Object>> interdit(String message) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(Map.of("error", message));
    }

    private boolean estFreelancer(UserPrincipal user) {
        return user != null && user.getFreelancerId() != null;
    }

    private Freelancer chargerFreelancer(Long id) {
        return freelancerRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Freelancer introuvable."));
    }

    private List<Map<String, String>> messageUtilisateur(String contenu) {
        return List.of(Map.of("role", "user", "content", contenu));
    }

    /**
     * Réponse de /ideal-profile.
     *
     * "summary" et "content" portent le même texte : le front lit "content"
     * en priorité, cela garantit l'affichage même si son type n'a pas "summary".
     */
    private Map<String, Object> reponse(
            String summary,
            List<IdealProfileDto.Recommendation> recommendations,
            boolean exactMatch,
            Map<String, Object> criteria
    ) {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("summary", summary);
        response.put("content", summary);
        response.put("recommendations", recommendations);
        response.put("count", recommendations.size());
        response.put("exactMatch", exactMatch);
        response.put("criteria", criteria);
        return response;
    }

    private Map<String, Object> construireCriteres(
            List<String> competences,
            String niveau,
            String projet,
            String duree,
            String localisation,
            Double budget
    ) {
        Map<String, Object> criteria = new LinkedHashMap<>();
        criteria.put("competences", competences);
        criteria.put("niveau", niveau);
        criteria.put("experience", niveau); // clé lue par l'interface
        criteria.put("projet", projet);
        criteria.put("duree", duree);
        criteria.put("localisation", localisation);
        criteria.put("budget", budget);
        return criteria;
    }

    private String formatProfils(List<IdealProfileDto.Recommendation> recommandations) {
        StringBuilder profils = new StringBuilder();

        for (IdealProfileDto.Recommendation r : recommandations) {
            profils.append("""

                    PROFIL ID : %d

                    Nom : %s %s
                    Spécialité : %s
                    Ville : %s
                    Pays : %s

                    Score global : %d/100

                    Note moyenne : %.1f/5
                    Nombre d'avis : %d

                    Complétude du profil : %d/100

                    Score compétences : %d/100

                    Disponibilité : %s

                    Tarif journalier : %s FCFA

                    Évaluations techniques :
                    %s

                    --------------------------------------------------
                    """.formatted(
                    r.id(),
                    safe(r.prenom()),
                    safe(r.nom()),
                    safe(r.specialite()),
                    safe(r.ville()),
                    safe(r.pays()),
                    r.scoreIA(),
                    r.noteMoyenne(),
                    r.nombreAvis(),
                    r.completudeProfil(),
                    r.scoreCompetences(),
                    safe(r.disponibilite()),
                    r.tarifJournalier() != null ? r.tarifJournalier() : "Non renseigné",
                    formatSkills(r.competences())
            ));
        }

        return profils.toString();
    }

    // ============================================================
    // HELPERS - DONNEES
    // ============================================================

    private List<Map<String, String>> convertMessages(Object value) {

        if (!(value instanceof List<?> list)) {
            return List.of();
        }

        List<Map<String, String>> result = new ArrayList<>();

        for (Object item : list) {
            if (!(item instanceof Map<?, ?> map)) {
                continue;
            }

            Object role = map.get("role");
            Object content = map.get("content");

            if (role == null || content == null) {
                continue;
            }

            result.add(Map.of(
                    "role", String.valueOf(role),
                    "content", String.valueOf(content)
            ));
        }

        return result;
    }

    private String getString(Map<String, Object> body, String key) {
        Object value = body.get(key);
        return value == null ? "" : String.valueOf(value).trim();
    }

    /** Lecture sûre d'une valeur texte dans une Map issue du JSON. */
    private String stringValue(Map<?, ?> map, String key, String defaut) {
        Object value = map.get(key);

        if (value == null) {
            return defaut;
        }

        String text = String.valueOf(value).trim();
        return text.isBlank() ? defaut : text;
    }

    private String firstNonBlank(String first, String second) {
        if (first != null && !first.isBlank()) {
            return first;
        }
        return second == null ? "" : second;
    }

    private Double parseBudget(String budgetText) {

        if (budgetText == null || budgetText.isBlank()) {
            return null;
        }

        try {
            String cleaned = budgetText
                    .replaceAll("[^0-9.,]", "")
                    .replace(",", ".");

            if (cleaned.isBlank()) {
                return null;
            }

            return Double.parseDouble(cleaned);

        } catch (Exception e) {
            return null;
        }
    }

    /** Mots significatifs d'une phrase libre (repli quand Groq n'extrait rien). */
    private List<String> extraireMotsCles(String message) {

        if (message == null || message.isBlank()) {
            return List.of();
        }

        String normalise = Normalizer.normalize(message, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .toLowerCase(Locale.ROOT);

        return Arrays.stream(normalise.split("[^a-z0-9+#.]+"))
                .filter(mot -> mot.length() >= 4)
                .filter(mot -> !MOTS_VIDES.contains(mot))
                .distinct()
                .limit(8)
                .toList();
    }

    private String safe(String value) {
        return value == null || value.isBlank() ? "Non renseigné" : value;
    }

    private String formatSkills(List<IdealProfileDto.SkillEvaluation> skills) {

        if (skills == null || skills.isEmpty()) {
            return "Aucune évaluation technique disponible.";
        }

        StringBuilder result = new StringBuilder();

        for (IdealProfileDto.SkillEvaluation skill : skills) {
            if (skill == null) {
                continue;
            }

            result.append("- ").append(safe(skill.nom())).append(" : ");

            if (skill.score() == null) {
                result.append("Non évalué");
            } else {
                result.append(skill.score())
                        .append("/100 - ")
                        .append(skill.niveau() != null ? skill.niveau() : "Niveau non précisé");
            }

            result.append("\n");
        }

        return result.toString();
    }

    private String cleanJson(String raw) {

        if (raw == null) {
            return "{}";
        }

        String trimmed = raw.trim();

        if (trimmed.startsWith("```json")) {
            trimmed = trimmed.substring(7);
        } else if (trimmed.startsWith("```")) {
            trimmed = trimmed.substring(3);
        }

        if (trimmed.endsWith("```")) {
            trimmed = trimmed.substring(0, trimmed.length() - 3);
        }

        return trimmed.trim();
    }

    private String buildReportPrompt(String role, String type, String dateDebut, String dateFin) {

        Map<String, String> freelancerTypes = Map.of(
                "performance", "performance globale",
                "applications", "analyse des candidatures",
                "earnings", "rapport financier",
                "profile", "analyse de profil"
        );

        Map<String, String> enterpriseTypes = Map.of(
                "recruitment", "recrutement et gestion des freelancers",
                "budget", "analyse budgétaire des projets",
                "performance", "performance des projets",
                "roi", "retour sur investissement freelance"
        );

        Map<String, String> types = role.equals("FREELANCER")
                ? freelancerTypes
                : enterpriseTypes;

        String typeLabel = types.getOrDefault(type, type);

        return """
                Génère un rapport professionnel de %s
                pour la période du %s au %s
                sur la plateforme Free-Kaolo.

                Le rapport doit être clair, structuré
                et exploitable.

                Utilise le format Markdown.
                """.formatted(typeLabel, dateDebut, dateFin);
    }
}