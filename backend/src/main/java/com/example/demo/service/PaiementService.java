package com.example.demo.service;

import com.example.demo.Dto.InitierPaiementDto;
import com.example.demo.Dto.PaiementDto;
import com.example.demo.entity.*;
import com.example.demo.repository.*;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class PaiementService {

    private final PaiementRepository paiementRepository;
    private final CandidatureRepository candidatureRepository;
    private final TransactionRepository transactionRepository;

    public PaiementService(PaiementRepository paiementRepository,
                           CandidatureRepository candidatureRepository,
                           TransactionRepository transactionRepository) {
        this.paiementRepository = paiementRepository;
        this.candidatureRepository = candidatureRepository;
        this.transactionRepository = transactionRepository;
    }

    // ── ÉTAPE 1 : Entreprise initie le paiement ──────────

    public PaiementDto initierPaiement(InitierPaiementDto dto) {
        Candidature candidature = candidatureRepository.findById(dto.getCandidatureId())
                .orElseThrow(() -> new RuntimeException("Candidature non trouvée"));

        Paiement p = new Paiement();
        p.setMontant(dto.getMontant());
        p.setStatut("BLOQUE"); // ← simulé directement bloqué
        p.setMethodePaiement(dto.getMethodePaiement());
        p.setReferenceExterne("SIM-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        p.setDatePaiement(LocalDateTime.now());
        p.setCandidature(candidature);
        p.setEntreprise(candidature.getProjet().getEntreprise());
        p.setFreelancer(candidature.getFreelancer());

        paiementRepository.save(p);

        // Notification simulée
        System.out.println("✅ Paiement simulé de " + dto.getMontant() +
                " FCFA bloqué — Référence : " + p.getReferenceExterne());

        return toDto(p);
    }

    // ── ÉTAPE 2 : Entreprise valide la livraison ─────────

    public PaiementDto validerLivraison(Long paiementId) {
        Paiement p = paiementRepository.findById(paiementId)
                .orElseThrow(() -> new RuntimeException("Paiement non trouvé"));

        if (!"BLOQUE".equals(p.getStatut())) {
            throw new RuntimeException("Ce paiement ne peut pas être libéré");
        }

        // Libérer l'argent
        p.setStatut("LIBERE");
        p.setDateLiberation(LocalDateTime.now());
        paiementRepository.save(p);

        // Créer une transaction IN pour le freelancer
        Transaction tx = new Transaction();
        tx.setType("in");
        tx.setLabel("Paiement — " + p.getCandidature().getProjet().getTitre());
        tx.setMontant(p.getMontant());
        tx.setDate(LocalDateTime.now());
        tx.setMethode(p.getMethodePaiement());
        tx.setStatut("Reçu");
        tx.setFacture("INV-" + LocalDateTime.now().getYear() +
                "-" + String.format("%04d", paiementRepository.count()));
        tx.setFreelancer(p.getFreelancer());
        transactionRepository.save(tx);

        System.out.println("✅ Paiement libéré — " + p.getMontant() +
                " FCFA crédité au freelancer " + p.getFreelancer().getNom());

        return toDto(p);
    }

    // ── ÉTAPE 3 : Freelancer demande un retrait ──────────

    public Map<String, Object> simulerRetrait(Long freelancerId, Double montant, String methode) {

        // Vérifier solde suffisant
        double solde = getSoldeFreelancer(freelancerId);
        if (montant > solde) {
            throw new RuntimeException("Solde insuffisant. Solde actuel : " + solde + " FCFA");
        }
        if (montant < 10000) {
            throw new RuntimeException("Montant minimum : 10 000 FCFA");
        }

        // Créer transaction OUT
        Transaction tx = new Transaction();
        tx.setType("out");
        tx.setLabel("Retrait vers " + methode);
        tx.setMontant(montant);
        tx.setDate(LocalDateTime.now());
        tx.setMethode(methode);
        tx.setStatut("Traité");

        // Récupérer le freelancer
        List<Paiement> paiements = paiementRepository
                .findByFreelancerIdOrderByDatePaiementDesc(freelancerId);
        if (!paiements.isEmpty()) {
            tx.setFreelancer(paiements.get(0).getFreelancer());
        }
        transactionRepository.save(tx);

        System.out.println("✅ Retrait simulé de " + montant +
                " FCFA vers " + methode);

        Map<String, Object> result = new HashMap<>();
        result.put("message", "Retrait simulé avec succès !");
        result.put("montant", montant);
        result.put("methode", methode);
        result.put("statut", "Traité");
        result.put("nouveauSolde", solde - montant);
        return result;
    }

    // ── Solde freelancer ─────────────────────────────────

    public double getSoldeFreelancer(Long freelancerId) {
        List<Transaction> transactions = transactionRepository
                .findByFreelancerIdOrderByDateDesc(freelancerId);

        double entrees = transactions.stream()
                .filter(t -> "in".equals(t.getType()))
                .mapToDouble(Transaction::getMontant).sum();

        double sorties = transactions.stream()
                .filter(t -> "out".equals(t.getType()))
                .mapToDouble(Transaction::getMontant).sum();

        return entrees - sorties;
    }

    // ── Historique paiements freelancer ──────────────────

    public List<PaiementDto> getPaiementsFreelancer(Long freelancerId) {
        return paiementRepository
                .findByFreelancerIdOrderByDatePaiementDesc(freelancerId)
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    // ── Historique paiements entreprise ──────────────────

    public List<PaiementDto> getPaiementsEntreprise(Long entrepriseId) {
        return paiementRepository
                .findByEntrepriseIdOrderByDatePaiementDesc(entrepriseId)
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    private PaiementDto toDto(Paiement p) {
        PaiementDto dto = new PaiementDto();
        dto.setId(p.getId());
        dto.setMontant(p.getMontant());
        dto.setStatut(p.getStatut());
        dto.setMethodePaiement(p.getMethodePaiement());
        dto.setReferenceExterne(p.getReferenceExterne());
        dto.setDatePaiement(p.getDatePaiement());
        dto.setDateLiberation(p.getDateLiberation());
        dto.setCandidatureId(p.getCandidature().getId());
        dto.setFreelancerNom(p.getFreelancer().getNom());
        dto.setEntrepriseNom(p.getEntreprise().getNomEntreprise());
        return dto;
    }


}