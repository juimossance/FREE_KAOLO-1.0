package com.example.demo.service;


import com.example.demo.entity.Projet;
import com.example.demo.repository.ProjetRepository;
import com.example.demo.repository.entrepriseRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class Projetservice {

    private final ProjetRepository projetRepository;
    private final entrepriseRepository entrepriseRepository;

    /**
     * Récupère tous les projets d'une entreprise
     */
    public List<Projet> getProjetsByEntreprise(Long entrepriseId) {
        return projetRepository.findByEntrepriseId(entrepriseId);
    }

    /**
     * Récupère tous les projets publics
     */
    public List<Projet> getProjetsPublics() {
        return projetRepository.findByVisibilite("Public");
    }

    /**
     * Récupère un projet par son ID
     */
    public Projet getProjetById(Long id) {
        return projetRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Projet non trouvé avec l'ID: " + id));
    }

    /**
     * Crée un nouveau projet
     */
    @Transactional
    public Projet createProjet(Projet projet) {
        // Définir les valeurs par défaut
        if (projet.getStatut() == null) {
            projet.setStatut("Ouvert");
        }
        if (projet.getVisibilite() == null) {
            projet.setVisibilite("Public");
        }
        if (projet.getVues() == 0) {
            projet.setVues(0);
        }
        projet.setDatePublication(LocalDateTime.now());

        // Vérifier que l'entreprise existe
        if (projet.getEntreprise() != null && projet.getEntreprise().getId() != null) {
            entrepriseRepository.findById(projet.getEntreprise().getId())
                    .orElseThrow(() -> new EntityNotFoundException("Entreprise non trouvée"));
        }

        return projetRepository.save(projet);
    }

    /**
     * Met à jour un projet existant
     */
    @Transactional
    public Projet updateProjet(Long id, Projet projetDetails) {
        Projet projet = getProjetById(id);

        // Mettre à jour les champs
        if (projetDetails.getTitre() != null) projet.setTitre(projetDetails.getTitre());
        if (projetDetails.getDescription() != null) projet.setDescription(projetDetails.getDescription());
        if (projetDetails.getBudget() != null) projet.setBudget(projetDetails.getBudget());
        if (projetDetails.getTypeBudget() != null) projet.setTypeBudget(projetDetails.getTypeBudget());
        if (projetDetails.getDeadline() != null) projet.setDeadline(projetDetails.getDeadline());
        if (projetDetails.getDuree() != null) projet.setDuree(projetDetails.getDuree());
        if (projetDetails.getExperience() != null) projet.setExperience(projetDetails.getExperience());
        if (projetDetails.getVisibilite() != null) projet.setVisibilite(projetDetails.getVisibilite());
        if (projetDetails.getLieu() != null) projet.setLieu(projetDetails.getLieu());
        if (projetDetails.getCategorie() != null) projet.setCategorie(projetDetails.getCategorie());
        if (projetDetails.getLivrable() != null) projet.setLivrable(projetDetails.getLivrable());
        if (projetDetails.getCompetences() != null) projet.setCompetences(projetDetails.getCompetences());

        // Mise à jour du statut urgent
        projet.setUrgent(projetDetails.isUrgent());

        return projetRepository.save(projet);
    }

    /**
     * Supprime un projet
     */
    @Transactional
    public void deleteProjet(Long id) {
        if (!projetRepository.existsById(id)) {
            throw new EntityNotFoundException("Projet non trouvé avec l'ID: " + id);
        }
        projetRepository.deleteById(id);
    }

    /**
     * Change le statut d'un projet
     */
    @Transactional
    public Projet changeStatut(Long id, String nouveauStatut) {
        Projet projet = getProjetById(id);

        // Valider le statut
        List<String> statutsValides = List.of("Ouvert", "En cours", "Terminé", "Suspendu");
        if (!statutsValides.contains(nouveauStatut)) {
            throw new IllegalArgumentException("Statut invalide: " + nouveauStatut);
        }

        projet.setStatut(nouveauStatut);
        return projetRepository.save(projet);
    }

    /**
     * Bascule le statut urgent
     */
    @Transactional
    public Projet toggleUrgent(Long id) {
        Projet projet = getProjetById(id);
        projet.setUrgent(!projet.isUrgent());
        return projetRepository.save(projet);
    }

    /**
     * Récupère les projets par catégorie
     */
    public List<Projet> getProjetsByCategorie(String categorie) {
        return projetRepository.findByCategorieAndVisibilite(categorie, "Public");
    }

    /**
     * Récupère les projets d'une entreprise par catégorie
     */
    public List<Projet> getProjetsByEntrepriseAndCategorie(Long entrepriseId, String categorie) {
        return projetRepository.findByEntrepriseIdAndCategorie(entrepriseId, categorie);
    }

    /**
     * Récupère toutes les catégories uniques
     */
    public List<String> getAllCategories() {
        return projetRepository.findAll()
                .stream()
                .map(Projet::getCategorie)
                .distinct()
                .sorted()
                .collect(Collectors.toList());
    }

    /**
     * Recherche des projets par titre ou description
     */
    public List<Projet> searchProjets(String query) {
        return projetRepository.findByTitreContainingOrDescriptionContaining(query, query);
    }

    /**
     * Incrémente le nombre de vues
     */
    @Transactional
    public void incrementerVues(Long id) {
        Projet projet = getProjetById(id);
        projet.setVues(projet.getVues() + 1);
        projetRepository.save(projet);
    }
}