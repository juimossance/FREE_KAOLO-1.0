package com.example.demo.repository;


import com.example.demo.entity.Freelancer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
@Repository
public interface freelancerRepository extends JpaRepository<Freelancer,Long> , JpaSpecificationExecutor<Freelancer> {
    @Query("SELECT f FROM Freelancer f WHERE f.user.id = :userId")
    Optional<Freelancer> findByUserId(@Param("userId") Long userId);


    @Query("""
        SELECT f FROM Freelancer f
        WHERE f.disponibilite = 'disponible'
        AND (:competence IS NULL OR LOWER(f.competence) LIKE LOWER(CONCAT('%', :competence, '%')))
        AND (:experience IS NULL OR LOWER(f.Experience) = LOWER(:experience))
        ORDER BY f.noteMoyenne DESC
        """)
    List<Freelancer> findDisponiblesByFiltres(
            @Param("competence") String competence,
            @Param("experience") String experience
    );

    // FreelancerRepository
    @Query("""
    SELECT f FROM Freelancer f
    WHERE f.disponibilite = 'disponible'
    AND (
        LOWER(f.specialite) LIKE %:q%
        OR LOWER(f.ville) LIKE %:q%
        OR LOWER(f.Experience) LIKE %:q%
        OR LOWER(f.description) LIKE %:q%
    )
    ORDER BY f.noteMoyenne DESC
    """)
    List<Freelancer> searchByQuery(@Param("q") String q);




        @Query("SELECT AVG(f.note) FROM Freelancer f WHERE f.id = :freelancerId")
        Double averageNote(@Param("freelancerId") Long freelancerId);

}
