package com.example.demo.entity;

import com.example.demo.Enum.StatutEscrow;
import com.example.demo.Enum.TypeOperation;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "escrow_transactions")
public class EscrowTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "projet_id")
    private Projet projet;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "entreprise_id")
    private Entreprise entreprise;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "freelancer_id")
    private Freelancer freelancer;

    private BigDecimal montant;
    private BigDecimal frais;

    private TypeOperation typeOperation;
    private StatutEscrow statut;

    private String campayReference;
    private String campayExternalRef;
    private String operateur;
    private String numeroTelephone;

    private LocalDateTime createdAt;
    private LocalDateTime confirmedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Projet getProjet() { return projet; }
    public void setProjet(Projet projet) { this.projet = projet; }
    public Entreprise getEntreprise() { return entreprise; }
    public void setEntreprise(Entreprise entreprise) { this.entreprise = entreprise; }
    public Freelancer getFreelancer() { return freelancer; }
    public void setFreelancer(Freelancer freelancer) { this.freelancer = freelancer; }
    public BigDecimal getMontant() { return montant; }
    public void setMontant(BigDecimal montant) { this.montant = montant; }
    public BigDecimal getFrais() { return frais; }
    public void setFrais(BigDecimal frais) { this.frais = frais; }
    public TypeOperation getTypeOperation() { return typeOperation; }
    public void setTypeOperation(TypeOperation typeOperation) { this.typeOperation = typeOperation; }
    public StatutEscrow getStatut() { return statut; }
    public void setStatut(StatutEscrow statut) { this.statut = statut; }
    public String getCampayReference() { return campayReference; }
    public void setCampayReference(String campayReference) { this.campayReference = campayReference; }
    public String getCampayExternalRef() { return campayExternalRef; }
    public void setCampayExternalRef(String campayExternalRef) { this.campayExternalRef = campayExternalRef; }
    public String getOperateur() { return operateur; }
    public void setOperateur(String operateur) { this.operateur = operateur; }
    public String getNumeroTelephone() { return numeroTelephone; }
    public void setNumeroTelephone(String numeroTelephone) { this.numeroTelephone = numeroTelephone; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getConfirmedAt() { return confirmedAt; }
    public void setConfirmedAt(LocalDateTime confirmedAt) { this.confirmedAt = confirmedAt; }
}