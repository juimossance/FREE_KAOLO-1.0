package com.example.demo.repository;

import com.example.demo.entity.Entreprise;
import com.example.demo.entity.Freelancer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
@Repository
public interface entrepriseRepository extends JpaRepository<Entreprise,Long> {

    @Query("SELECT E FROM Entreprise E WHERE E.user.id = :userId")
    Optional<Entreprise> findByUserId(@Param("userId") Long userId);
}
