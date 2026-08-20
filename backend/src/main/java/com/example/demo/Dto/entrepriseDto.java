package com.example.demo.Dto;

import com.example.demo.Enum.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class entrepriseDto {
    @NotBlank
    @Email
    private String email;
    @NotBlank
    private String password;
    private String phone;

    private Role role = Role.ENTREPRISE;

    // Champs Entreprise
    @NotBlank
    private String nomEntreprise;
    private String secteur;
    private String siteweb;
    private int telephone;
    private String responsable;
    private String ville;
    private String adresse;
    // Getters / Setters


    public String getAdresse() {
        return adresse;
    }

    public void setAdresse(String adresse) {
        this.adresse = adresse;
    }

    public String getResponsable() {
        return responsable;
    }

    public void setResponsable(String responsable) {
        this.responsable = responsable;
    }

    public String getVille() {
        return ville;
    }

    public void setVille(String ville) {
        this.ville = ville;
    }

    public Role getRole() {
        return role;}
    public void setRole(Role role) {
        this.role = role;}
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getNomEntreprise() { return nomEntreprise; }
    public void setNomEntreprise(String nomEntreprise) { this.nomEntreprise = nomEntreprise; }

    public String getSecteur() { return secteur; }
    public void setSecteur(String secteur) { this.secteur = secteur; }

    public String getSiteweb() { return siteweb; }
    public void setSiteweb(String siteweb) { this.siteweb = siteweb; }

    public int getTelephone() { return telephone; }
    public void setTelephone(int telephone) { this.telephone = telephone; }
}
