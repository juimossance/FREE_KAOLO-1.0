package com.example.demo.service.testIA;


import com.example.demo.Dto.testIA.SkillQuestionDto;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import java.util.List;

@Service
public class GroqSkillService {

    @Value("${groq.api.key}")
    private String apiKey;

    @Value("${groq.api.url}")
    private String apiUrl;

    @Value("${groq.model}")
    private String model;

    private final ObjectMapper objectMapper;

    public GroqSkillService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public List<SkillQuestionDto> generateQuestions(String skill) {

        String prompt = """
                Tu es un expert en évaluation technique informatique.

                Génère exactement 10 questions à choix multiples
                pour évaluer les fondamentaux de la compétence suivante :

                COMPÉTENCE : %s

                Règles obligatoires :

                1. Les questions doivent porter uniquement sur les fondamentaux.
                2. Elles doivent être adaptées à un freelancer.
                3. Chaque question doit avoir exactement 4 propositions.
                4. Une seule réponse est correcte.
                5. Les questions doivent être différentes.
                6. Ne génère pas de questions trop avancées.
                7. Évite les questions ambiguës.
                8. L'index de la bonne réponse commence à 0.
                9. Retourne UNIQUEMENT du JSON valide.
                10. Aucun markdown.
                11. Aucun texte avant ou après le JSON.

                Format obligatoire :

                [
                  {
                    "question": "Question...",
                    "options": [
                      "Réponse A",
                      "Réponse B",
                      "Réponse C",
                      "Réponse D"
                    ],
                    "answer": 1
                  }
                ]
                """.formatted(skill);

        try {

            RestTemplate restTemplate = new RestTemplate();

            HttpHeaders headers = new HttpHeaders();

            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(apiKey);

            String body = """
                    {
                      "model": "%s",
                      "temperature": 0.2,
                      "messages": [
                        {
                          "role": "system",
                          "content": "Tu génères des évaluations techniques fiables."
                        },
                        {
                          "role": "user",
                          "content": %s
                        }
                      ]
                    }
                    """.formatted(
                    model,
                    objectMapper.writeValueAsString(prompt)
            );

            HttpEntity<String> request =
                    new HttpEntity<>(body, headers);

            ResponseEntity<String> response =
                    restTemplate.exchange(
                            apiUrl,
                            HttpMethod.POST,
                            request,
                            String.class
                    );

            if (!response.getStatusCode().is2xxSuccessful()) {
                throw new RuntimeException(
                        "Erreur Groq : " + response.getStatusCode()
                );
            }

            JsonNode root =
                    objectMapper.readTree(response.getBody());

            String content =
                    root.path("choices")
                            .get(0)
                            .path("message")
                            .path("content")
                            .asText();

            content = cleanJson(content);

            return objectMapper.readValue(
                    content,
                    objectMapper.getTypeFactory()
                            .constructCollectionType(
                                    List.class,
                                    SkillQuestionDto.class
                            )
            );

        } catch (Exception e) {

            throw new RuntimeException(
                    "Impossible de générer les questions avec Groq",
                    e
            );
        }
    }

    private String cleanJson(String content) {

        content = content.trim();

        if (content.startsWith("```json")) {
            content = content.substring(7);
        }

        if (content.startsWith("```")) {
            content = content.substring(3);
        }

        if (content.endsWith("```")) {
            content = content.substring(
                    0,
                    content.length() - 3
            );
        }

        return content.trim();
    }
}