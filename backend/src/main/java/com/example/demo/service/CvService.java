package com.example.demo.service;



// ⚠️ ADAPTEZ ces imports si vos packages diffèrent légèrement.
import com.example.demo.Dto.UserPrincipal;
import com.example.demo.Dto.freelancerDto;
import com.example.demo.entity.Cv;
import com.example.demo.entity.Freelancer;

import com.example.demo.repository.CvRepository;
import com.example.demo.repository.freelancerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class CvService {

    private static final long MAX_SIZE_BYTES = 5L * 1024 * 1024; // 5 Mo, aligné sur le frontend

    private static final Set<String> ALLOWED_TYPES = Set.of(
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );

    private final freelancerRepository freelancerRepository;
    private final CvRepository cvRepository;

    /* =====================================================
       AUTORISATION COMMUNE
       Seul le freelancer propriétaire peut importer/supprimer
       son CV. La lecture (GET) est ouverte à tout utilisateur
       authentifié (l'entreprise doit pouvoir consulter le CV
       d'un candidat), à ajuster si vous voulez la restreindre.
    ===================================================== */
    private Freelancer resolveOwned(Long freelancerId, UserPrincipal currentUser, boolean requireOwner) {
        Freelancer freelancer = freelancerRepository.findById(freelancerId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Freelancer introuvable"));

        if (requireOwner) {
            boolean estProprietaire = currentUser.getFreelancerId() != null
                    && currentUser.getFreelancerId().equals(freelancerId);

            if (!estProprietaire) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Vous ne pouvez pas modifier ce CV");
            }
        }

        return freelancer;
    }

    /* =====================================================
       IMPORT
    ===================================================== */
    @Transactional
    public freelancerDto.CvResponse importCv(
            Long freelancerId,
            MultipartFile file,
            UserPrincipal currentUser
    ) throws IOException {

        Freelancer freelancer = resolveOwned(
                freelancerId,
                currentUser,
                true
        );

        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Aucun fichier fourni"
            );
        }

        if (file.getSize() > MAX_SIZE_BYTES) {
            throw new ResponseStatusException(
                    HttpStatus.PAYLOAD_TOO_LARGE,
                    "La taille maximale du CV est de 5 Mo"
            );
        }

        String contentType = file.getContentType();

        if (contentType == null || !ALLOWED_TYPES.contains(contentType)) {
            throw new ResponseStatusException(
                    HttpStatus.UNSUPPORTED_MEDIA_TYPE,
                    "Formats acceptés : PDF, DOC, DOCX"
            );
        }

        Cv cv = cvRepository.findByFreelancerId(freelancerId)
                .orElseGet(() -> new Cv(freelancer));
        cv.setCvData(file.getBytes());
        cv.setCvFileName(file.getOriginalFilename());
        cv.setCvcontentType(contentType);
        cv.setCvuploadedAt(LocalDateTime.now());
        cvRepository.save(cv);

        freelancerRepository.save(freelancer);

        return new freelancerDto.CvResponse(
                freelancer.getId(),
                cv.getCvFileName(),
                "CV importé avec succès.",
                cv.getCvuploadedAt()
        );
    }

    /* =====================================================
       LECTURE — renvoie les octets + métadonnées pour que
       le contrôleur construise la réponse HTTP (Content-Type,
       Content-Disposition).
    ===================================================== */
    public record CvFile(byte[] data, String fileName, String contentType) {
    }

    @Transactional(readOnly = true)
    public CvFile getCv(Long freelancerId, UserPrincipal currentUser) {
        Freelancer freelancer = resolveOwned(freelancerId, currentUser, false);
        Cv cv = cvRepository.findByFreelancerId(freelancerId)
                .filter(c -> c.getCvData() != null)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Aucun CV disponible"));

        return new CvFile(
                cv.getCvData(),
                cv.getCvFileName() != null ? cv.getCvFileName() : "cv.pdf",
                normalizeForFrontend(cv.getCvcontentType())
        );
    }

    private String normalizeForFrontend(String contentType) {
        if (contentType == null) return "application/octet-stream";
        if (contentType.equals("application/pdf")) return contentType;
        return "application/octet-stream";
    }

    /* =====================================================
       SUPPRESSION
    ===================================================== */
    @Transactional
    public void deleteCv(Long freelancerId, UserPrincipal currentUser) {
        Freelancer freelancer = resolveOwned(freelancerId, currentUser, true);

        Cv cv = cvRepository.findByFreelancerId(freelancerId)
                .orElseGet(() -> new Cv(freelancer));
        cv.setCvData(null);
        cv.setCvFileName(null);
        cv.setCvcontentType(null);
        cv.setCvuploadedAt(null);

        freelancerRepository.save(freelancer);
    }
}