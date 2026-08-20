package com.example.demo.service;


import com.example.demo.Dto.CertificationDTO;
import com.example.demo.Dto.CertificationFormDTO;
import com.example.demo.Enum.CertStatus;
import com.example.demo.entity.Certification;
import com.example.demo.exception.CertificationNotFoundException;
import com.example.demo.exception.InvalidCertificationStateException;
import com.example.demo.repository.CertificationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CertificationServiceImpl implements Certificationservice {

    private final CertificationRepository repository;

    public CertificationServiceImpl(CertificationRepository repository) {
        this.repository = repository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<CertificationDTO> getAllByFreelancer(Long freelancerId) {
        return repository.findByFreelancerIdOrderByDateCreationDesc(freelancerId)
                .stream()
                .map(CertificationDTO::from)
                .toList();
    }

    @Override
    @Transactional
    public CertificationDTO create(Long freelancerId, CertificationFormDTO form) {
        Certification entity = new Certification(
                freelancerId,
                form.getNom(),
                form.getOrganisme(),
                form.getCredentialId(),
                form.getCategorie(),
                form.getDateObtention(),
                form.getDateExpiration(),
                form.getDocumentUrl()
        );
        return CertificationDTO.from(repository.save(entity));
    }

    @Override
    @Transactional
    public CertificationDTO resubmit(Long id, CertificationFormDTO form) {
        Certification entity = repository.findById(id)
                .orElseThrow(() -> new CertificationNotFoundException(id));

        if (entity.getStatus() != CertStatus.REJETEE) {
            throw new InvalidCertificationStateException(
                    "Seule une certification rejetée peut être resoumise"
            );
        }

        entity.setNom(form.getNom());
        entity.setOrganisme(form.getOrganisme());
        entity.setCredentialId(form.getCredentialId());
        entity.setCategorie(form.getCategorie());
        entity.setDateObtention(form.getDateObtention());
        entity.setDateExpiration(form.getDateExpiration());
        entity.setDocumentUrl(form.getDocumentUrl());
        entity.setStatus(CertStatus.EN_ATTENTE);
        entity.setMotifRejet(null);

        return CertificationDTO.from(repository.save(entity));
    }

    @Override
    @Transactional
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new CertificationNotFoundException(id);
        }
        repository.deleteById(id);
    }
}