package com.example.demo.repository;

import com.example.demo.entity.ProjetPortfolio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
@Repository
public interface PortfolioRepository extends JpaRepository<ProjetPortfolio, Long> {

    List<ProjetPortfolio> findByFreelancerIdOrderByAnneeDesc(Long freelancerId);
    List<ProjetPortfolio> findByFreelancerIdAndFeaturedTrue(Long freelancerId);
}