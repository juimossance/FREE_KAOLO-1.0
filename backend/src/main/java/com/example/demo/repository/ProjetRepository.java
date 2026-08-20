package com.example.demo.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.demo.entity.Projet;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
@Repository
public interface ProjetRepository extends JpaRepository<Projet,Long> {

    Optional<Projet> findById(Long projetId);
    // Projets d'une entreprise
    List<Projet> findByEntrepriseIdOrderByDatePublicationDesc(Long entrepriseId);

    // Recherche par titre
    List<Projet> findByTitreContainingIgnoreCase(String search);

    // Filtre par statut
    List<Projet> findByStatut(String statut);

    // Tous les projets publics
    List<Projet> findByVisibiliteAndStatutOrderByDatePublicationDesc(
            String visibilite, String statut);

    // Recherche avec filtre
    List<Projet> findByTitreContainingIgnoreCaseAndStatut(
            String search, String statut);

    // Projets urgents
    List<Projet> findByUrgentTrueAndStatut(String statut);

    // Par catégorie
    List<Projet> findByCategorieAndStatut(String categorie, String statut);








    //----------------------------------------------------------------------
    // Récupérer les projets d'une entreprise
    List<Projet> findByEntrepriseId(Long entrepriseId);

    // Récupérer les projets par visibilité
    List<Projet> findByVisibilite(String visibilite);

    // Récupérer les projets par catégorie et visibilité
    List<Projet> findByCategorieAndVisibilite(String categorie, String visibilite);

    // Récupérer les projets d'une entreprise par catégorie
    List<Projet> findByEntrepriseIdAndCategorie(Long entrepriseId, String categorie);

    // Recherche par titre ou description
    @Query("SELECT p FROM Projet p WHERE " +
            "LOWER(p.titre) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(p.description) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Projet> findByTitreContainingOrDescriptionContaining(@Param("query") String titre, @Param("query") String description);

    // Récupérer les projets urgents
    List<Projet> findByUrgentTrue();



    // Récupérer les projets par lieu
    List<Projet> findByLieu(String lieu);

    // Récupérer les projets par niveau d'expérience requis
    List<Projet> findByExperience(String experience);



}
