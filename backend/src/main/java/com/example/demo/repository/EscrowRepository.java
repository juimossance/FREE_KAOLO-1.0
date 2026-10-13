package com.example.demo.repository;

import com.example.demo.Enum.StatutEscrow;
import com.example.demo.Enum.TypeOperation;
import com.example.demo.entity.EscrowTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface EscrowRepository extends JpaRepository<EscrowTransaction, Long> {

    Optional<EscrowTransaction> findByCampayReference(String campayReference);

    List<EscrowTransaction> findByEntreprise_IdOrderByCreatedAtDesc(Long entrepriseId);

    List<EscrowTransaction> findByFreelancer_IdOrderByCreatedAtDesc(Long freelancerId);

    boolean existsByProjet_IdAndTypeOperationAndStatutIn(
            Long projetId, TypeOperation typeOperation, List<StatutEscrow> statuts);

    @Query("""
        SELECT COALESCE(SUM(
            CASE WHEN e.typeOperation = com.example.demo.Enum.TypeOperation.LIBERATION AND e.statut = com.example.demo.Enum.StatutEscrow.LIBERE THEN e.montant
                 WHEN e.typeOperation = com.example.demo.Enum.TypeOperation.RETRAIT AND e.statut = com.example.demo.Enum.StatutEscrow.RETIRE THEN -e.montant
                 ELSE 0 END), 0)
        FROM EscrowTransaction e
        WHERE e.freelancer.id = :freelancerId
    """)
    BigDecimal calculerSoldeDisponible(@Param("freelancerId") Long freelancerId);

    @Query("""
        SELECT COALESCE(SUM(e.montant), 0) FROM EscrowTransaction e
        WHERE e.freelancer.id = :freelancerId AND e.typeOperation = com.example.demo.Enum.TypeOperation.DEPOT AND e.statut = com.example.demo.Enum.StatutEscrow.BLOQUE
    """)
    BigDecimal calculerSoldeEnAttente(@Param("freelancerId") Long freelancerId);
}