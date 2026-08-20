// src/main/java/com/example/demo/Controller/AIController.java
package com.example.demo.Controller;

import com.example.demo.Dto.RecommendationDto;
import com.example.demo.entity.Freelancer;
import com.example.demo.repository.CandidatureRepository;
import com.example.demo.repository.freelancerRepository;
import com.example.demo.service.RecommendationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import java.util.*;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "http://localhost:5173")
public class AIController {
    @Autowired
    private RecommendationService recommendationService;
    @Value("${groq.api.key}")
    private String groqApiKey;

    private final RestTemplate restTemplate = new RestTemplate();
    private static final String GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
    // ✅ Modèle gratuit avec beaucoup de tokens
    private static final String MODEL = "openai/gpt-oss-120b";
    // ── Endpoint générique ────────────────────────────────────────────────────
    @PostMapping("/chat")
    public ResponseEntity<Map<String, Object>> chat(@RequestBody Map<String, Object> body) {
        try {
            String systemPrompt = (String) body.getOrDefault("systemPrompt",
                    "Tu es un assistant IA pour la plateforme freelance free-kaolo en Afrique centrale. Réponds en français.");
            List<Map<String, String>> messages = (List<Map<String, String>>) body.get("messages");

            Map<String, Object> result = callOpenRouter(systemPrompt, messages);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    // ── Générer un CV ─────────────────────────────────────────────────────────
    @PostMapping("/generate-cv")
    public ResponseEntity<Map<String, Object>> generateCV(@RequestBody Map<String, Object> body) {
        try {
            String systemPrompt = """
                Tu es un expert en rédaction de CV professionnels pour freelancers africains.
                Tu crées des CVs percutants, bien structurés et adaptés au marché international.
                Réponds UNIQUEMENT avec le CV en Markdown propre, sans commentaires supplémentaires.
                """;

            String userPrompt = buildCVPrompt(body);
            List<Map<String, String>> messages = List.of(Map.of("role", "user", "content", userPrompt));

            Map<String, Object> result = callOpenRouter(systemPrompt, messages);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    // ── Générer un rapport ────────────────────────────────────────────────────
    @PostMapping("/generate-report")
    public ResponseEntity<Map<String, Object>> generateReport(@RequestBody Map<String, Object> body) {
        try {
            String role = (String) body.getOrDefault("role", "FREELANCER");
            String type = (String) body.getOrDefault("type", "performance");
            String dateDebut = (String) body.getOrDefault("dateDebut", "2026-01-01");
            String dateFin = (String) body.getOrDefault("dateFin", "2026-06-30");

            String systemPrompt = role.equals("FREELANCER")
                    ? "Tu es un analyste spécialisé dans les freelancers africains. Tu génères des rapports professionnels avec des insights pertinents."
                    : "Tu es un analyste business spécialisé dans les entreprises africaines. Tu génères des rapports professionnels avec des recommandations concrètes.";

            String userPrompt = buildReportPrompt(role, type, dateDebut, dateFin);
            List<Map<String, String>> messages = List.of(Map.of("role", "user", "content", userPrompt));

            Map<String, Object> result = callOpenRouter(systemPrompt, messages);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    // ── Profil idéal (entreprise) ─────────────────────────────────────────────
    @Autowired
    private freelancerRepository freelancerRepository;
    @Autowired private CandidatureRepository candidatureRepository;

    @PostMapping("/ideal-profile")
    public ResponseEntity<Map<String, Object>> idealProfile(@RequestBody Map<String, Object> body) {
        try {

            String competences = (String) body.getOrDefault("competences", "");
            String niveau = (String) body.getOrDefault("niveau", "");
            String projet = (String) body.getOrDefault("projet", "");
            String budget = String.valueOf(body.getOrDefault("budget", ""));
            String duree = (String) body.getOrDefault("duree", "");

            // Tous les freelancers
            List<Freelancer> tousLesFreelancers = freelancerRepository.findAll();

            // Compétences recherchées
            List<String> competencesRecherchees = Arrays.stream(competences.split("[,;]+"))
                    .map(String::trim)
                    .map(String::toLowerCase)
                    .filter(c -> !c.isEmpty())
                    .toList();

            // Budget
            Double budgetDouble = null;
            try {
                budgetDouble = budget.isBlank() ? null : Double.parseDouble(budget);
            } catch (Exception ignored) {
            }

            // Construction des recommandations
            Double finalBudgetDouble = budgetDouble;
            List<RecommendationDto> recommendations = tousLesFreelancers.stream()

                    .filter(f -> f.getCompetence() != null && !f.getCompetence().isEmpty())

                    .map(f -> {

                        int score = recommendationService.calculerScore(
                                f,
                                competencesRecherchees,
                                niveau,
                                finalBudgetDouble
                        );

                        String raison = recommendationService.genererRaison(f);

                        return recommendationService.convertir(
                                f,
                                score,
                                raison
                        );

                    })

                    // Ne garder que les profils ayant au moins une compétence recherchée
                    .filter(r -> r.getScoreIA() > 0)

                    // Trier par score
                    .sorted(Comparator.comparingInt(RecommendationDto::getScoreIA).reversed())

                    // Top 10
                    .limit(10)

                    .toList();

            // Aucun résultat
            if (recommendations.isEmpty()) {

                return ResponseEntity.ok(Map.of(
                        "summary", "Aucun freelancer ne correspond aux critères de votre recherche.",
                        "recommendations", Collections.emptyList(),
                        "totalTrouves", 0
                ));

            }

            // Résumé envoyé à l'IA
            StringBuilder top = new StringBuilder();

            for (RecommendationDto r : recommendations) {

                top.append(String.format("""
                    Nom : %s %s
                    Score : %d%%
                    Spécialité : %s
                    
                    """,
                        r.getPrenom(),
                        r.getNom(),
                        r.getScoreIA(),
                        r.getSpecialite()));

            }

            String systemPrompt = """
                Tu es un recruteur expérimenté.

                Les profils ont déjà été sélectionnés automatiquement.

                Ne répète jamais leurs informations.

                En moins de 80 mots :

                - résume la qualité générale des profils ;
                - indique s'ils répondent bien au besoin ;
                - conseille quel type de profil contacter en premier.

                Réponse naturelle.
                """;

            String userPrompt = String.format("""
                Projet :
                %s

                Compétences recherchées :
                %s

                Niveau :
                %s

                Budget :
                %s FCFA

                Durée :
                %s

                Meilleurs profils :

                %s
                """,
                    projet,
                    competences,
                    niveau,
                    budget,
                    duree,
                    top.toString());

            List<Map<String, String>> messages = List.of(
                    Map.of(
                            "role",
                            "user",
                            "content",
                            userPrompt
                    )
            );

            Map<String, Object> ia = callOpenRouter(systemPrompt, messages);

            Map<String, Object> response = new HashMap<>();

            response.put("summary", ia.get("content"));
            response.put("recommendations", recommendations);
            response.put("totalTrouves", recommendations.size());

            return ResponseEntity.ok(response);

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "error",
                            e.getMessage()
                    ));
        }
    }

    // ── Analyse marché ────────────────────────────────────────────────────────
    @PostMapping("/analysis")
    public ResponseEntity<Map<String, Object>> analysis(@RequestBody Map<String, Object> body) {
        try {
            String type = (String) body.getOrDefault("type", "market");
            String role = (String) body.getOrDefault("role", "FREELANCER");

            Map<String, String> freelancerPrompts = Map.of(
                    "market",      "Analyse le marché des freelancers tech en Afrique de l'Ouest 2026. Tendances, opportunités, compétences demandées. 200 mots max.",
                    "profile",     "Conseils pour optimiser un profil freelancer africain. Points forts, certifications, tarification. 200 mots max.",
                    "competition", "Comment se démarquer comme freelancer junior en Afrique. Stratégies concrètes. 200 mots max.",
                    "forecast",    "Prévisions marché freelance tech Afrique second semestre 2026. Secteurs porteurs. 200 mots max."
            );

            Map<String, String> enterprisePrompts = Map.of(
                    "market",  "Marché des freelancers tech disponibles en Afrique de l'Ouest. Compétences, tarifs, profils. 200 mots max.",
                    "budget",  "Comment budgétiser les projets freelance pour une PME africaine. Fourchettes de prix. 200 mots max.",
                    "risk",    "Risques lors du recrutement de freelancers et comment les mitiger. Conseils pratiques. 200 mots max.",
                    "trends",  "Tendances 2026 pour les entreprises externalisant en Afrique. Nouvelles pratiques. 200 mots max."
            );

            Map<String, String> prompts = role.equals("FREELANCER") ? freelancerPrompts : enterprisePrompts;
            String userPrompt = prompts.getOrDefault(type, "Analyse le marché freelance africain.");

            List<Map<String, String>> messages = List.of(Map.of("role", "user", "content", userPrompt));
            Map<String, Object> result = callOpenRouter(
                    "Tu es un analyste expert du marché freelance africain. Réponds en français, de façon concise et actionnable.",
                    messages
            );
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    // ── Helper OpenRouter ─────────────────────────────────────────────────────
    private Map<String, Object> callOpenRouter(String systemPrompt, List<Map<String, String>> userMessages) {
        try {
            // 🔍 Log de la clé (masquée pour sécurité)
            System.out.println("🔑 Clé API (4 derniers): ..." +
                    (groqApiKey != null ? groqApiKey.substring(Math.max(0, groqApiKey.length() - 4)) : "NULL"));
            System.out.println("📝 System prompt: " + systemPrompt.substring(0, Math.min(100, systemPrompt.length())));
            System.out.println("💬 Messages utilisateur: " + userMessages.size() + " message(s)");
            System.out.println("MODEL UTILISÉ = " + MODEL);
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " +groqApiKey);
            headers.set("HTTP-Referer", "http://localhost:5173");
            headers.set("X-Title", "Free-Kaolo");

            List<Map<String, String>> allMessages = new ArrayList<>();
            allMessages.add(Map.of("role", "system", "content", systemPrompt));
            allMessages.addAll(userMessages);

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", MODEL);
            requestBody.put("messages", allMessages);
            requestBody.put("max_tokens", 2000);
            requestBody.put("temperature", 0.7);

            // 🔍 Log du body envoyé
            System.out.println("📤 Envoi à OpenRouter: " + requestBody);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

            // 🔍 Log avant l'appel
            System.out.println("🌐 Appel OpenRouter...");
            ResponseEntity<Map> response = restTemplate.postForEntity(GROQ_URL, request, Map.class);

            // 🔍 Log de la réponse brute
            System.out.println("📥 Statut réponse: " + response.getStatusCode());
            System.out.println("📥 Body réponse: " + response.getBody());

            Map<String, Object> responseBody = response.getBody();

            // ✅ Vérification défensive
            if (responseBody == null) {
                throw new RuntimeException("Réponse vide d'OpenRouter");
            }

            // ✅ Vérifier si erreur OpenRouter
            if (responseBody.containsKey("error")) {
                Map<String, Object> error = (Map<String, Object>) responseBody.get("error");
                String errorMessage = error != null ? error.toString() : "Erreur inconnue";
                System.err.println("❌ Erreur OpenRouter: " + errorMessage);
                throw new RuntimeException("Erreur OpenRouter: " + errorMessage);
            }

            // ✅ Vérifier la structure
            if (!responseBody.containsKey("choices")) {
                System.err.println("❌ Pas de 'choices' dans la réponse: " + responseBody.keySet());
                throw new RuntimeException("Structure de réponse inattendue: " + responseBody.keySet());
            }

            List<Map<String, Object>> choices = (List<Map<String, Object>>) responseBody.get("choices");
            if (choices == null || choices.isEmpty()) {
                throw new RuntimeException("Liste 'choices' vide");
            }

            Map<String, Object> firstChoice = choices.get(0);
            Map<String, Object> message = (Map<String, Object>) firstChoice.get("message");

            if (message == null) {
                throw new RuntimeException("Pas de 'message' dans le choix");
            }

            String content = (String) message.get("content");
            if (content == null) {
                throw new RuntimeException("Contenu du message null");
            }

            System.out.println("✅ Réponse extraite: " + content.substring(0, Math.min(100, content.length())) + "...");

            return Map.of("content", content, "model", MODEL);

        } catch (Exception e) {
            // 🔍 Log complet de l'erreur
            System.err.println("💥 ERREUR callOpenRouter: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Erreur appel OpenRouter: " + e.getMessage(), e);
        }
    }

    private String buildCVPrompt(Map<String, Object> data) {
        return String.format("""
            Génère un CV professionnel complet en Markdown pour :
            
            Nom : %s %s
            Titre : %s
            Email : %s | Téléphone : %s | Ville : %s
            Niveau : %s
            
            Résumé : %s
            Compétences : %s
            Expériences : %s
            Formation : %s
            Langues : %s
            Projets : %s
            
            Instructions :
            - Structure professionnelle avec sections claires
            - Adapte selon le niveau (%s)
            - Bullet points pour la lisibilité
            - Section "Points forts" basée sur les infos
            - Adapté au marché africain et international
            """,
                data.get("prenom"), data.get("nom"), data.get("titre"),
                data.get("email"), data.get("telephone"), data.get("ville"),
                data.get("niveau"), data.get("description"), data.get("competences"),
                data.get("experience"), data.get("formation"), data.get("langues"),
                data.get("projets"), data.get("niveau")
        );
    }

    private String buildReportPrompt(String role, String type, String dateDebut, String dateFin) {
        Map<String, String> freelancerTypes = Map.of(
                "performance",   "performance globale",
                "applications",  "analyse des candidatures",
                "earnings",      "rapport financier",
                "profile",       "analyse de profil"
        );
        Map<String, String> enterpriseTypes = Map.of(
                "recruitment",  "recrutement et gestion des freelancers",
                "budget",       "analyse budgétaire des projets",
                "performance",  "performance des projets",
                "roi",          "retour sur investissement freelance"
        );

        Map<String, String> types = role.equals("FREELANCER") ? freelancerTypes : enterpriseTypes;
        String typeLabel = types.getOrDefault(type, type);

        return String.format(
                "Génère un rapport détaillé de %s pour la période du %s au %s sur la plateforme free-kaolo. " +
                        "Inclus des métriques réalistes pour le marché africain, des analyses pertinentes et des recommandations actionnables. " +
                        "Format Markdown avec titres, sous-titres et tableaux si nécessaire.",
                typeLabel, dateDebut, dateFin
        );
    }
}