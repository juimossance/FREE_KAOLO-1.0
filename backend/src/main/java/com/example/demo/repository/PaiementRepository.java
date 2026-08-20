package com.example.demo.repository;

import com.example.demo.Dto.DashboardDto.revenueDto;
import com.example.demo.Dto.NotificationDto;
import com.example.demo.entity.Paiement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
@Repository
@EnableJpaRepositories
public interface PaiementRepository extends JpaRepository<Paiement, Long> {
    List<Paiement> findByFreelancerIdOrderByDatePaiementDesc(Long freelancerId);
    List<Paiement> findByEntrepriseIdOrderByDatePaiementDesc(Long entrepriseId);
    List<Paiement> findByFreelancerIdAndStatut(Long freelancerId, String statut);
    @Query("""
SELECT COALESCE(SUM(p.montant),0)
FROM Paiement p
WHERE p.freelancer.id=:freelancerId
AND MONTH(p.datePaiement)=MONTH(CURRENT_DATE)
AND YEAR(p.datePaiement)=YEAR(CURRENT_DATE)
AND p.statut='VALIDE'
""")
    Double totalThisMonth(Long freelancerId);

    @Query("""
    SELECT new com.example.demo.Dto.DashboardDto.revenueDto(
        MAX(CAST(FUNCTION('DATE_FORMAT', p.datePaiement, '%b') AS string)),
        SUM(p.montant)
    )
    FROM Paiement p
    WHERE p.freelancer.id = :freelancerId
    AND p.statut = 'VALIDE'
    GROUP BY FUNCTION('MONTH', p.datePaiement)
    ORDER BY FUNCTION('MONTH', p.datePaiement)
    """)
    List<revenueDto> monthlyRevenue(@Param("freelancerId") Long freelancerId);




}