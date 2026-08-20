package com.example.demo.service;





import com.example.demo.entity.Freelancer;
import com.example.demo.entity.Competence;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public class FreelancerSpecifications {

    public static Specification<Freelancer> withFilters(
            String search,
            String categorie,
            String ville,
            Double minTarif,
            Double maxTarif,
            Boolean disponible,
            List<String> competences
    ) {
        return (root, query, cb) -> {

            List<Predicate> predicates = new ArrayList<>();
            query.distinct(true);

            if (search != null && !search.isBlank()) {
                String like = "%" + search.toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("nom")), like),
                        cb.like(cb.lower(root.get("prenom")), like),
                        cb.like(cb.lower(root.get("description")), like)
                ));
            }

            if (categorie != null && !categorie.isBlank()) {
                predicates.add(cb.equal(cb.lower(root.get("specialite")), categorie.toLowerCase()));
            }

            if (ville != null && !ville.isBlank()) {
                predicates.add(cb.equal(cb.lower(root.get("ville")), ville.toLowerCase()));
            }

            if (minTarif != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("tarifJournalier"), minTarif));
            }

            if (maxTarif != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("tarifJournalier"), maxTarif));
            }

            if (disponible != null && disponible) {
                predicates.add(cb.equal(root.get("disponibilite"), "Disponible"));
            }

            if (competences != null && !competences.isEmpty()) {
                Join<Freelancer, Competence> competenceJoin = root.join("competence");
                predicates.add(competenceJoin.get("nom").in(competences));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}