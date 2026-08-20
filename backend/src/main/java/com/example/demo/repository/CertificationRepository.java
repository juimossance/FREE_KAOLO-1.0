package com.example.demo.repository;

import com.example.demo.entity.Certification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CertificationRepository extends JpaRepository<Certification, Long> {
    List<Certification> findByFreelancerIdOrderByDateCreationDesc(Long freelancerId);
}
