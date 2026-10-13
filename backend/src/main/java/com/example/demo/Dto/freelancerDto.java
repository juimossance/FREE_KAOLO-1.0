package com.example.demo.Dto;

import com.example.demo.Enum.Role;
import com.example.demo.entity.Competence;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

import java.time.LocalDateTime;
import java.util.List;

public class freelancerDto {
    @NotBlank
    @Email
    private String email;
    @NotBlank
    private String password;
    private String phone;

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    // Champs Freelancer
    private  long id;
    @NotBlank
    private String nom;
    @NotBlank
    private String prenom;
    private String specialite;
    private String experience;
    private String description;
    private List<String> competence;
    private Role role = Role.FREELANCER;

    private String pays;
    public freelancerDto() {}

    public freelancerDto(Long id, String nom, String prenom, String specialite,
                              String pays, List<String> competence) {
        this.id = id;
        this.nom = nom;
        this.prenom = prenom;
        this.specialite = specialite;
        this.pays = pays;
        this.competence= competence;
    }
    // Getters / Setters
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public Role getRole() {
        return role;}
    public void setRole(Role role) {
        this.role = role;}
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }

    public String getPrenom() { return prenom; }
    public void setPrenom(String prenom) { this.prenom = prenom; }

    public String getSpecialite() { return specialite; }
    public void setSpecialite(String specialite) { this.specialite = specialite; }

    public String getExperience() { return experience; }
    public void setExperience(String experience) { this.experience = experience; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public List<String> getCompetence() { return competence; }
    public void setCompetence(List<String> competence) { this.competence = competence; }
    public String getPays() {
        return pays;
    }
    public void setPays(String pays) {
        this.pays = pays;
    }
    public record CvResponse(
            Long id,
            String fileName,
            String message,
            LocalDateTime uploadedAt
    ) {}}
