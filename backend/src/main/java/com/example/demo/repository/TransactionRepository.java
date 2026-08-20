package com.example.demo.repository;

import com.example.demo.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    List<Transaction> findByFreelancerIdOrderByDateDesc(Long freelancerId);

    List<Transaction> findByFreelancerIdAndLabelContainingIgnoreCase(Long freelancerId, String search);

    List<Transaction> findByFreelancerIdAndFactureIsNotNull(Long freelancerId);


}