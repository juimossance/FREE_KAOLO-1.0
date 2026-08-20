package com.example.demo.repository;

import com.example.demo.Enum.Role;
import com.example.demo.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
@Repository
public interface  UserRepository extends JpaRepository<User,Long> {

    Optional<User> findByEmail(String email);
    Optional<User> findByActivationCode(String activationCode);
    List<User> findByRole(Role role);
    Optional<User> findByIdAndRole(Long id, Role role);
    @Query("SELECT u FROM User u LEFT JOIN FETCH u.prestataire LEFT JOIN FETCH u.entreprise WHERE u.email = :email")
    Optional<User> findByEmailWithDetails(@Param("email") String email);
    // ✅ Charge eagerly entreprise et prestataire en même temps
    @Query("SELECT u FROM User u " +
            "LEFT JOIN FETCH u.entreprise " +
            "LEFT JOIN FETCH u.prestataire " +
            "WHERE u.email = :email")
    Optional<User> findByEmailWithRelations(@Param("email") String email);
}
