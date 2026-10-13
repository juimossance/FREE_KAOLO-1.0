package com.example.demo.repository;

import com.example.demo.Enum.CertStatus;
import com.example.demo.entity.Certification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Set;

public interface CertificationRepository extends JpaRepository<Certification, Long> {

    List<Certification> findByFreelancerIdOrderByDateCreationDesc(Long freelancerId);

    List<Certification> findAllByOrderByDateCreationDesc();

    List<Certification> findByStatusOrderByDateCreationDesc(CertStatus status);

    // Certifié = au moins un justificatif VALIDÉ et non expiré
    @Query("""
        select count(c) > 0 from Certification c
        where c.freelancerId = :freelancerId
          and c.status = com.example.demo.Enum.CertStatus.VALIDEE
          and (c.dateExpiration is null or c.dateExpiration >= CURRENT_DATE)
    """)
    boolean hasValidCredential(@Param("freelancerId") Long freelancerId);

    // Pour les listes (recherche, candidatures) : évite le N+1
    @Query("""
        select distinct c.freelancerId from Certification c
        where c.freelancerId in :ids
          and c.status = com.example.demo.Enum.CertStatus.VALIDEE
          and (c.dateExpiration is null or c.dateExpiration >= CURRENT_DATE)
    """)
    Set<Long> findCertifiedIds(@Param("ids") Collection<Long> ids);
}