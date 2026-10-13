package com.example.demo.repository;

import com.example.demo.Dto.DashboardDto.RecentApplicationDto;
import com.example.demo.Dto.DashboardDto.monthlyDto;
import com.example.demo.Dto.NotificationDto;
import com.example.demo.Enum.StatusCandidature;
import com.example.demo.entity.Candidature;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface CandidatureRepository extends JpaRepository<Candidature, Long> {
    List<Candidature> findByFreelancerId(Long freelancerId);
    List<Candidature> findTop5ByFreelancerIdOrderByDateDesc(Long freelancerId); // ← date pas dateCandidature
    // ✅ Ajoute cette ligne
    boolean existsByFreelancerIdAndProjetId(Long freelancerId, Long projetId);

    List<Candidature> findByProjetId(Long projetId);
    // CandidatureRepository
    @Query("""
    SELECT c
    FROM Candidature c
    WHERE c.projet.entreprise.id = :eid
      AND c.projet.statut = 'Terminé'
    ORDER BY c.projet.id DESC
""")
    List<Candidature> findMissionsTerminees(@Param("eid") Long entrepriseId);
    // CandidatureRepository
    @Query("""
    SELECT AVG(c.note)
    FROM Candidature c
    WHERE c.freelancer.id = :id
      AND c.note IS NOT NULL
      AND c.note > 0
""")
    Double moyenneNote(@Param("id") Long id);
    List<Candidature> findByProjetIdAndStatusIn(
            Long projetId,
            Collection<StatusCandidature> statuses
    );

    @Query("select c.projet.id from Candidature c where c.freelancer.id = :freelancerId")
    List<Long> findProjetIdsByFreelancerId(@Param("freelancerId") Long freelancerId);
    @Query("""
    SELECT COUNT(c)
    FROM Candidature c
    WHERE c.freelancer.id = :id
      AND c.note IS NOT NULL
      AND c.note > 0
""")
    long countAvis(@Param("id") Long id);
    List<Candidature> findByProjetIdAndStatus(Long projetId , StatusCandidature status);

    List<Candidature> findByProjetEntrepriseId(Long entrepriseId);

    List<Candidature> findByProjetEntrepriseIdAndStatusIn(Long entrepriseId, List<StatusCandidature> status);

    @Query("""
SELECT COUNT(c)
FROM Candidature c
WHERE c.freelancer.id=:freelancerId
""")
    Long countByFreelancerId(@Param("freelancerId") Long freelancerId);

    @Query("""
    SELECT new com.example.demo.Dto.DashboardDto.monthlyDto(
        MAX(CAST(FUNCTION('DATE_FORMAT', c.date, '%b') AS string)),
        COUNT(c),
        SUM(CASE WHEN c.status = 'ACCEPTEE' THEN 1 ELSE 0 END)
    )
    FROM Candidature c
    WHERE c.freelancer.id = :freelancerId
    GROUP BY FUNCTION('MONTH', c.date)
    ORDER BY FUNCTION('MONTH', c.date)
    """)
    List<monthlyDto> applicationStatistics(@Param("freelancerId") Long freelancerId);
    @Query("""
SELECT new com.example.demo.Dto.DashboardDto.RecentApplicationDto(
    c.projet.titre,
    c.projet.entreprise.nomEntreprise,
    c.status,
    c.date,
    c.projet.budget
)
FROM Candidature c
WHERE c.freelancer.id=:freelancerId
ORDER BY c.date DESC
""")
    List<RecentApplicationDto> findRecentApplications(Long freelancerId);

    @Query("""
        SELECT c
        FROM Candidature c
        JOIN FETCH c.projet p
        JOIN FETCH p.entreprise e
        JOIN FETCH c.freelancer f
        WHERE e.id = :entrepriseId
        ORDER BY c.date DESC
    """)
    List<Candidature> findByEntrepriseId(
            @Param("entrepriseId") Long entrepriseId
    );


    // =========================================================
    // CANDIDATURES PAR STATUS
    // =========================================================

    @Query("""
        SELECT c
        FROM Candidature c
        JOIN FETCH c.projet p
        JOIN FETCH p.entreprise e
        JOIN FETCH c.freelancer f
        WHERE e.id = :entrepriseId
        AND c.status = :status
        ORDER BY c.date DESC
    """)
    List<Candidature> findByEntrepriseIdAndStatus(
            @Param("entrepriseId") Long entrepriseId,
            @Param("status") StatusCandidature status
    );


    // =========================================================
    // UNE CANDIDATURE APPARTENANT À L'ENTREPRISE
    // =========================================================

    @Query("""
        SELECT c
        FROM Candidature c
        JOIN FETCH c.projet p
        JOIN FETCH p.entreprise e
        JOIN FETCH c.freelancer f
        WHERE c.id = :candidatureId
        AND e.id = :entrepriseId
    """)
    Optional<Candidature> findByIdAndEntrepriseId(
            @Param("candidatureId") Long candidatureId,
            @Param("entrepriseId") Long entrepriseId
    );



    boolean existsByProjetIdAndFreelancerIdAndStatus(Long projetId, Long freelancerId, StatusCandidature status);
    Optional<Candidature> findByProjetIdAndFreelancerId(Long projetId, Long freelancerId);
}