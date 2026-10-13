package com.example.demo.service;

import com.example.demo.Dto.EscrowDto;
import com.example.demo.Dto.UserPrincipal;
import com.example.demo.Dto.campay.CamPayWebhookPayload;
import com.example.demo.Enum.Role;
import com.example.demo.Enum.StatusCandidature;
import com.example.demo.Enum.StatutEscrow;
import com.example.demo.Enum.TypeOperation;
import com.example.demo.entity.Candidature;
import com.example.demo.entity.Entreprise;
import com.example.demo.entity.EscrowTransaction;
import com.example.demo.entity.Freelancer;
import com.example.demo.entity.Projet;
import com.example.demo.repository.CandidatureRepository;
import com.example.demo.repository.EscrowRepository;
import com.example.demo.repository.ProjetRepository;
import com.example.demo.repository.entrepriseRepository;
import com.example.demo.repository.freelancerRepository;
import com.example.demo.service.campay.CamPayService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class EscrowService {

    private final EscrowRepository escrowRepository;
    private final ProjetRepository projetRepository;
    private final entrepriseRepository entrepriseRepository;
    private final freelancerRepository freelancerRepository;
    private final CandidatureRepository candidatureRepository;
    private final CamPayService camPayService;

    // 1.5 % sur les dépôts
    private static final BigDecimal TAUX_FRAIS_DEPOT = new BigDecimal("0.015");

    // 1 % sur les retraits
    private static final BigDecimal TAUX_FRAIS_RETRAIT = new BigDecimal("0.01");

    public EscrowService(
            EscrowRepository escrowRepository,
            ProjetRepository projetRepository,
            entrepriseRepository entrepriseRepository,
            freelancerRepository freelancerRepository,
            CandidatureRepository candidatureRepository,
            CamPayService camPayService
    ) {
        this.escrowRepository = escrowRepository;
        this.projetRepository = projetRepository;
        this.entrepriseRepository = entrepriseRepository;
        this.freelancerRepository = freelancerRepository;
        this.candidatureRepository = candidatureRepository;
        this.camPayService = camPayService;
    }

    @Transactional
    public EscrowDto.EscrowTransactionDto initierDepot(
            Long entrepriseId,
            EscrowDto.DepotRequest request
    ) {
        if (entrepriseId == null) {
            throw new SecurityException("Entreprise non authentifiée");
        }
        if (request == null) {
            throw new IllegalArgumentException("Les données du dépôt sont obligatoires");
        }
        if (request.projetId() == null) {
            throw new IllegalArgumentException("Le projet est obligatoire");
        }
        if (request.montant() == null || request.montant().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Le montant doit être supérieur à zéro");
        }
        if (request.telephone() == null || request.telephone().trim().isEmpty()) {
            throw new IllegalArgumentException("Le numéro de téléphone est obligatoire");
        }
        if (request.operateur() == null || request.operateur().trim().isEmpty()) {
            throw new IllegalArgumentException("L'opérateur est obligatoire");
        }

        Entreprise entreprise = entrepriseRepository
                .findById(entrepriseId)
                .orElseThrow(() -> new IllegalArgumentException("Entreprise introuvable"));

        Projet projet = projetRepository
                .findById(request.projetId())
                .orElseThrow(() -> new IllegalArgumentException("Projet introuvable"));

        // le projet doit appartenir à l'entreprise connectée
        if (projet.getEntreprise() == null
                || projet.getEntreprise().getId() == null
                || !projet.getEntreprise().getId().equals(entrepriseId)) {
            throw new SecurityException("Ce projet n'appartient pas à cette entreprise");
        }

        // il faut un freelance accepté
        Candidature candidatureAcceptee = candidatureRepository
                .findByProjetIdAndStatusIn(
                        projet.getId(),
                        List.of(StatusCandidature.ACCEPTEE, StatusCandidature.EN_COURS)
                )
                .stream()
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("Aucun freelance accepté sur ce projet"));

        Freelancer freelancer = candidatureAcceptee.getFreelancer();
        if (freelancer == null) {
            throw new IllegalStateException("Le freelance associé à cette candidature est introuvable");
        }

        boolean depotDejaActif = escrowRepository
                .existsByProjet_IdAndTypeOperationAndStatutIn(
                        projet.getId(),
                        TypeOperation.DEPOT,
                        List.of(StatutEscrow.EN_ATTENTE, StatutEscrow.BLOQUE)
                );

        if (depotDejaActif) {
            throw new IllegalStateException("Un dépôt est déjà en cours ou actif pour ce projet");
        }

        // l'entreprise paie le montant + les frais
        BigDecimal frais = request.montant()
                .multiply(TAUX_FRAIS_DEPOT)
                .setScale(0, RoundingMode.CEILING);

        BigDecimal montantTotal = request.montant().add(frais);

        String externalRef = "DEP-" + UUID.randomUUID();

        EscrowTransaction tx = new EscrowTransaction();
        tx.setProjet(projet);
        tx.setEntreprise(entreprise);
        tx.setFreelancer(freelancer);
        tx.setMontant(request.montant());
        tx.setFrais(frais);
        tx.setTypeOperation(TypeOperation.DEPOT);
        tx.setStatut(StatutEscrow.EN_ATTENTE);
        tx.setOperateur(request.operateur());
        tx.setNumeroTelephone(request.telephone().trim());
        tx.setCampayExternalRef(externalRef);

        CamPayService.CamPayCollectResponse response = camPayService.collect(
                request.telephone().trim(),
                montantTotal,
                externalRef,
                "Dépôt escrow - " + projet.getTitre()
        );

        if (response == null) {
            throw new IllegalStateException("CamPay n'a retourné aucune réponse");
        }
        if (response.reference() == null || response.reference().trim().isEmpty()) {
            throw new IllegalStateException("CamPay n'a pas retourné de référence de transaction");
        }

        tx.setCampayReference(response.reference());

        return toDto(escrowRepository.save(tx));
    }

    @Transactional
    public EscrowDto.EscrowTransactionDto libererFonds(
            Long transactionId,
            Long entrepriseId
    ) {
        if (transactionId == null) {
            throw new IllegalArgumentException("Transaction introuvable");
        }
        if (entrepriseId == null) {
            throw new SecurityException("Entreprise non authentifiée");
        }

        EscrowTransaction depot = escrowRepository
                .findById(transactionId)
                .orElseThrow(() -> new IllegalArgumentException("Transaction introuvable"));

        if (depot.getEntreprise() == null
                || !depot.getEntreprise().getId().equals(entrepriseId)) {
            throw new SecurityException("Cette transaction n'appartient pas à cette entreprise");
        }
        if (depot.getTypeOperation() != TypeOperation.DEPOT) {
            throw new IllegalStateException("Cette transaction n'est pas un dépôt");
        }
        if (depot.getStatut() != StatutEscrow.BLOQUE) {
            throw new IllegalStateException("Les fonds ne sont pas dans un état bloqué");
        }

        depot.setStatut(StatutEscrow.LIBERE);
        depot.setConfirmedAt(LocalDateTime.now());
        escrowRepository.save(depot);

        // on trace la libération dans une nouvelle ligne
        EscrowTransaction liberation = new EscrowTransaction();
        liberation.setProjet(depot.getProjet());
        liberation.setEntreprise(depot.getEntreprise());
        liberation.setFreelancer(depot.getFreelancer());
        liberation.setMontant(depot.getMontant());
        liberation.setFrais(BigDecimal.ZERO);
        liberation.setTypeOperation(TypeOperation.LIBERATION);
        liberation.setStatut(StatutEscrow.LIBERE);
        liberation.setConfirmedAt(LocalDateTime.now());

        return toDto(escrowRepository.save(liberation));
    }

    @Transactional
    public EscrowDto.EscrowTransactionDto initierRetrait(
            Long freelancerId,
            EscrowDto.RetraitRequest request
    ) {
        if (freelancerId == null) {
            throw new SecurityException("Freelance non authentifié");
        }
        if (request == null) {
            throw new IllegalArgumentException("Les données du retrait sont obligatoires");
        }
        if (request.montant() == null || request.montant().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Le montant du retrait doit être supérieur à zéro");
        }
        if (request.telephone() == null || request.telephone().trim().isEmpty()) {
            throw new IllegalArgumentException("Le numéro de téléphone est obligatoire");
        }
        if (request.operateur() == null || request.operateur().trim().isEmpty()) {
            throw new IllegalArgumentException("L'opérateur est obligatoire");
        }

        Freelancer freelancer = freelancerRepository
                .findById(freelancerId)
                .orElseThrow(() -> new IllegalArgumentException("Freelance introuvable"));

        BigDecimal soldeDisponible = escrowRepository.calculerSoldeDisponible(freelancerId);
        if (soldeDisponible == null) {
            soldeDisponible = BigDecimal.ZERO;
        }

        if (request.montant().compareTo(soldeDisponible) > 0) {
            throw new IllegalStateException("Solde insuffisant pour ce retrait");
        }

        // le freelance reçoit le montant moins les frais
        BigDecimal frais = request.montant()
                .multiply(TAUX_FRAIS_RETRAIT)
                .setScale(0, RoundingMode.FLOOR);

        BigDecimal montantNet = request.montant().subtract(frais);

        String externalRef = "RET-" + UUID.randomUUID();

        EscrowTransaction tx = new EscrowTransaction();
        tx.setFreelancer(freelancer);
        tx.setMontant(request.montant());
        tx.setFrais(frais);
        tx.setTypeOperation(TypeOperation.RETRAIT);
        tx.setStatut(StatutEscrow.EN_ATTENTE);
        tx.setOperateur(request.operateur());
        tx.setNumeroTelephone(request.telephone().trim());
        tx.setCampayExternalRef(externalRef);

        CamPayService.CamPayCollectResponse response = camPayService.withdraw(
                request.telephone().trim(),
                montantNet,
                externalRef,
                "Retrait Free Kaolo"
        );

        if (response == null) {
            throw new IllegalStateException("CamPay n'a retourné aucune réponse");
        }
        if (response.reference() == null || response.reference().trim().isEmpty()) {
            throw new IllegalStateException("CamPay n'a pas retourné de référence de transaction");
        }

        tx.setCampayReference(response.reference());

        return toDto(escrowRepository.save(tx));
    }

    public EscrowDto.SoldeDto getSolde(Long freelancerId) {
        if (freelancerId == null) {
            throw new SecurityException("Freelance non authentifié");
        }

        BigDecimal disponible = escrowRepository.calculerSoldeDisponible(freelancerId);
        BigDecimal enAttente = escrowRepository.calculerSoldeEnAttente(freelancerId);

        return new EscrowDto.SoldeDto(
                disponible != null ? disponible : BigDecimal.ZERO,
                enAttente != null ? enAttente : BigDecimal.ZERO
        );
    }

    public List<EscrowDto.EscrowTransactionDto> getTransactionsPour(UserPrincipal principal) {
        if (principal == null) {
            throw new SecurityException("Utilisateur non authentifié");
        }

        List<EscrowTransaction> transactions;

        if (principal.getRole() == Role.ENTREPRISE) {
            if (principal.getEntrepriseId() == null) {
                throw new SecurityException("Entreprise non associée à cet utilisateur");
            }
            transactions = escrowRepository
                    .findByEntreprise_IdOrderByCreatedAtDesc(principal.getEntrepriseId());

        } else if (principal.getRole() == Role.FREELANCER) {
            if (principal.getFreelancerId() == null) {
                throw new SecurityException("Freelance non associé à cet utilisateur");
            }
            transactions = escrowRepository
                    .findByFreelancer_IdOrderByCreatedAtDesc(principal.getFreelancerId());

        } else {
            throw new SecurityException("Rôle non autorisé");
        }

        return transactions.stream().map(this::toDto).toList();
    }

    public EscrowDto.EscrowTransactionDto rafraichirStatut(Long transactionId) {
        EscrowTransaction tx = escrowRepository
                .findById(transactionId)
                .orElseThrow(() -> new IllegalArgumentException("Transaction introuvable"));

        return toDto(tx);
    }

    @Transactional
    public void traiterWebhook(CamPayWebhookPayload payload) {
        if (payload == null
                || payload.getReference() == null
                || payload.getReference().trim().isEmpty()) {
            throw new IllegalArgumentException("Référence CamPay invalide");
        }

        EscrowTransaction tx = escrowRepository
                .findByCampayReference(payload.getReference())
                .orElseThrow(() -> new IllegalArgumentException("Transaction inconnue pour cette référence"));

        // si le webhook a déjà été traité, on ne refait rien
        boolean estRetrait = tx.getTypeOperation() == TypeOperation.RETRAIT;

        boolean dejaTraite =
                (estRetrait && tx.getStatut() == StatutEscrow.RETIRE)
                        || (!estRetrait && tx.getStatut() == StatutEscrow.BLOQUE)
                        || tx.getStatut() == StatutEscrow.ECHEC;

        if (dejaTraite) {
            return;
        }

        if ("SUCCESSFUL".equalsIgnoreCase(payload.getStatus())) {
            tx.setStatut(estRetrait ? StatutEscrow.RETIRE : StatutEscrow.BLOQUE);
            tx.setConfirmedAt(LocalDateTime.now());

        } else if ("FAILED".equalsIgnoreCase(payload.getStatus())) {
            tx.setStatut(StatutEscrow.ECHEC);
            tx.setConfirmedAt(LocalDateTime.now());
        }

        escrowRepository.save(tx);
    }

    private EscrowDto.EscrowTransactionDto toDto(EscrowTransaction tx) {
        String projetTitre = tx.getProjet() != null
                ? tx.getProjet().getTitre()
                : "Retrait";

        return new EscrowDto.EscrowTransactionDto(
                tx.getId(),
                projetTitre,
                tx.getMontant(),
                tx.getFrais(),
                tx.getTypeOperation(),
                tx.getStatut(),
                tx.getOperateur(),
                tx.getCreatedAt()
        );
    }
}