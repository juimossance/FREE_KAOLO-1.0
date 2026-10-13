package com.example.demo.repository;

import com.example.demo.entity.Cv;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CvRepository extends JpaRepository<Cv, Long> {
    Optional<Cv> findByFreelancerId(Long freelancerId);
}
