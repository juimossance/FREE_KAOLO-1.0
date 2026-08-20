package com.example.demo.repository;

import com.example.demo.entity.Retrait;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
@Repository
public interface RetraitRepository extends JpaRepository<Retrait, Long> {
    List<Retrait> findByFreelancerIdOrderByDateDesc(Long freelancerId);
}