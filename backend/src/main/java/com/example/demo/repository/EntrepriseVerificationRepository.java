package com.example.demo.repository;

import com.example.demo.Enum.VerificationStatus;
import com.example.demo.entity.EntrepriseVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.*;

public interface EntrepriseVerificationRepository extends JpaRepository<EntrepriseVerification, Long> {
    List<EntrepriseVerification> findByEntrepriseIdOrderByDateSoumissionDesc(Long entrepriseId);
    List<EntrepriseVerification> findAllByOrderByDateSoumissionDesc();
    List<EntrepriseVerification> findByStatusOrderByDateSoumissionDesc(VerificationStatus status);
    boolean existsByEntrepriseIdAndStatusIn(Long entrepriseId, Collection<VerificationStatus> statuses);
    boolean existsByEntrepriseIdAndStatus(Long entrepriseId, VerificationStatus status);

    @Query("select distinct v.entrepriseId from EntrepriseVerification v " +
            "where v.entrepriseId in :ids and v.status = com.example.demo.Enum.VerificationStatus.VALIDEE")
    Set<Long> findCertifiedEntrepriseIds(@Param("ids") Collection<Long> ids);
}