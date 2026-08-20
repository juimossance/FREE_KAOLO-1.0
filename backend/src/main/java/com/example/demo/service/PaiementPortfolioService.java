package com.example.demo.service;



import com.example.demo.Dto.*;
import com.example.demo.entity.*;
import com.example.demo.repository.*;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class PaiementPortfolioService {

    private final TransactionRepository transactionRepository;
    private final RetraitRepository retraitRepository;
    private final PortfolioRepository portfolioRepository;
    private final freelancerRepository freelancerRepository;

    public PaiementPortfolioService(TransactionRepository transactionRepository,
                                    RetraitRepository retraitRepository,
                                    PortfolioRepository portfolioRepository,
                                    freelancerRepository freelancerRepository) {
        this.transactionRepository = transactionRepository;
        this.retraitRepository = retraitRepository;
        this.portfolioRepository = portfolioRepository;
        this.freelancerRepository = freelancerRepository;
    }

    // ── PAIEMENTS ────────────────────────────────────────

    public Map<String, Object> getSolde(Long freelancerId) {
        List<Transaction> transactions = transactionRepository
                .findByFreelancerIdOrderByDateDesc(freelancerId);

        double totalGagne = transactions.stream()
                .filter(t -> "in".equals(t.getType()))
                .mapToDouble(Transaction::getMontant).sum();

        double totalRetraits = transactions.stream()
                .filter(t -> "out".equals(t.getType()))
                .mapToDouble(Transaction::getMontant).sum();

        double solde = totalGagne - totalRetraits;

        Map<String, Object> result = new HashMap<>();
        result.put("solde", solde);
        result.put("totalGagne", totalGagne);
        result.put("totalRetraits", totalRetraits);
        return result;
    }

    public List<TransactionDto> getTransactions(Long freelancerId, String search) {
        List<Transaction> transactions;
        if (search != null && !search.isEmpty()) {
            transactions = transactionRepository
                    .findByFreelancerIdAndLabelContainingIgnoreCase(freelancerId, search);
        } else {
            transactions = transactionRepository
                    .findByFreelancerIdOrderByDateDesc(freelancerId);
        }
        return transactions.stream().map(this::toTransactionDto).collect(Collectors.toList());
    }

    public List<TransactionDto> getFactures(Long freelancerId) {
        return transactionRepository
                .findByFreelancerIdAndFactureIsNotNull(freelancerId)
                .stream().map(this::toTransactionDto).collect(Collectors.toList());
    }

    public Map<String, Object> demanderRetrait(Long freelancerId, RetraitDto dto) {
        Freelancer freelancer = freelancerRepository.findById(freelancerId)
                .orElseThrow(() -> new RuntimeException("Freelancer non trouvé"));

        if (dto.getMontant() < 10000) {
            throw new RuntimeException("Montant minimum : 10 000 FCFA");
        }

        Retrait retrait = new Retrait();
        retrait.setMontant(dto.getMontant());
        retrait.setMethode(dto.getMethode());
        retrait.setTelephone(dto.getTelephone());
        retrait.setStatut("En attente");
        retrait.setDate(LocalDateTime.now());
        retrait.setFreelancer(freelancer);
        retraitRepository.save(retrait);

        // Ajouter comme transaction OUT
        Transaction tx = new Transaction();
        tx.setType("out");
        tx.setLabel("Retrait vers " + dto.getMethode());
        tx.setMontant(dto.getMontant());
        tx.setDate(LocalDateTime.now());
        tx.setMethode(dto.getMethode());
        tx.setStatut("En attente");
        tx.setFreelancer(freelancer);
        transactionRepository.save(tx);

        Map<String, Object> result = new HashMap<>();
        result.put("message", "Retrait demandé avec succès");
        result.put("montant", dto.getMontant());
        result.put("statut", "En attente");
        return result;
    }

    public List<Map<String, Object>> getGainsMensuels(Long freelancerId) {
        List<Transaction> transactions = transactionRepository
                .findByFreelancerIdOrderByDateDesc(freelancerId);

        String[] mois = {"Jan", "Fév", "Mar", "Avr", "Mai", "Jun",
                "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"};

        List<Map<String, Object>> result = new ArrayList<>();
        for (int i = 0; i < 12; i++) {
            final int moisIndex = i;
            double gains = transactions.stream()
                    .filter(t -> "in".equals(t.getType()) &&
                            t.getDate().getMonthValue() == moisIndex + 1)
                    .mapToDouble(Transaction::getMontant).sum();

            double retraits = transactions.stream()
                    .filter(t -> "out".equals(t.getType()) &&
                            t.getDate().getMonthValue() == moisIndex + 1)
                    .mapToDouble(Transaction::getMontant).sum();

            Map<String, Object> m = new HashMap<>();
            m.put("month", mois[i]);
            m.put("gains", gains);
            m.put("retraits", retraits);
            result.add(m);
        }
        return result;
    }

    private TransactionDto toTransactionDto(Transaction t) {
        TransactionDto dto = new TransactionDto();
        dto.setId(t.getId());
        dto.setType(t.getType());
        dto.setLabel(t.getLabel());
        dto.setMontant(t.getMontant());
        dto.setDate(t.getDate());
        dto.setMethode(t.getMethode());
        dto.setStatut(t.getStatut());
        dto.setFacture(t.getFacture());
        return dto;
    }

    // ── PORTFOLIO ─────────────────────────────────────────

    public List<PortfolioDto> getPortfolio(Long freelancerId) {
        return portfolioRepository
                .findByFreelancerIdOrderByAnneeDesc(freelancerId)
                .stream().map(this::toPortfolioDto).collect(Collectors.toList());
    }

    public PortfolioDto ajouterProjet(Long freelancerId, PortfolioDto dto) {
        Freelancer freelancer = freelancerRepository.findById(freelancerId)
                .orElseThrow(() -> new RuntimeException("Freelancer non trouvé"));

        ProjetPortfolio p = new ProjetPortfolio();
        p.setTitre(dto.getTitre());
        p.setDescription(dto.getDescription());
        p.setCategorie(dto.getCategorie());
        p.setAnnee(dto.getAnnee());
        p.setFeatured(false);
        p.setEmoji(dto.getEmoji() != null ? dto.getEmoji() : "💻");
        p.setCouleur(dto.getCouleur() != null ? dto.getCouleur() : "#F0F9FF");
        p.setTechnologies(dto.getTechnologies());
        p.setFreelancer(freelancer);

        return toPortfolioDto(portfolioRepository.save(p));
    }

    public PortfolioDto modifierProjet(Long projetId, PortfolioDto dto) {
        ProjetPortfolio p = portfolioRepository.findById(projetId)
                .orElseThrow(() -> new RuntimeException("Projet non trouvé"));

        p.setTitre(dto.getTitre());
        p.setDescription(dto.getDescription());
        p.setCategorie(dto.getCategorie());
        p.setAnnee(dto.getAnnee());
        p.setEmoji(dto.getEmoji());
        p.setCouleur(dto.getCouleur());
        p.setTechnologies(dto.getTechnologies());

        return toPortfolioDto(portfolioRepository.save(p));
    }

    public void supprimerProjet(Long projetId) {
        portfolioRepository.deleteById(projetId);
    }

    public PortfolioDto toggleFeatured(Long projetId) {
        ProjetPortfolio p = portfolioRepository.findById(projetId)
                .orElseThrow(() -> new RuntimeException("Projet non trouvé"));
        p.setFeatured(!p.isFeatured());
        return toPortfolioDto(portfolioRepository.save(p));
    }

    private PortfolioDto toPortfolioDto(ProjetPortfolio p) {
        PortfolioDto dto = new PortfolioDto();
        dto.setId(p.getId());
        dto.setTitre(p.getTitre());
        dto.setDescription(p.getDescription());
        dto.setCategorie(p.getCategorie());
        dto.setAnnee(p.getAnnee());
        dto.setFeatured(p.isFeatured());
        dto.setImageUrl(p.getImageUrl());
        dto.setEmoji(p.getEmoji());
        dto.setCouleur(p.getCouleur());
        dto.setTechnologies(p.getTechnologies());
        return dto;
    }
}