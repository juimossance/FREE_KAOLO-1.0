package com.example.demo.repository;

import com.example.demo.entity.ProjetVue;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ProjetVueRepository extends JpaRepository<ProjetVue, Long> {

    Optional<ProjetVue> findByProjetIdAndUtilisateurId(
            Long projetId,
            Long utilisateurId
    );

    long countByProjetId(Long projetId);
}
