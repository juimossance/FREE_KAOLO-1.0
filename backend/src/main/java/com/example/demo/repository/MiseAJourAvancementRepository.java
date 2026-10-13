package com.example.demo.repository;

import com.example.demo.entity.MiseAJourAvancement;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MiseAJourAvancementRepository extends JpaRepository<MiseAJourAvancement, Long> {

    List<MiseAJourAvancement> findByProjetIdOrderByDateAsc(Long projetId);
}
