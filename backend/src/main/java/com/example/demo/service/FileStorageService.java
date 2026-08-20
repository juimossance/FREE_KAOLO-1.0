package com.example.demo.service;



import com.example.demo.exception.InvalidFileException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Set;
import java.util.UUID;

@Service
public class FileStorageService {

    public static final Set<String> IMAGE_TYPES = Set.of(
            "image/jpeg", "image/png", "image/webp", "image/gif"
    );

    public static final Set<String> DOCUMENT_TYPES = Set.of(
            "image/jpeg", "image/png", "application/pdf"
    );

    // Dossier physique racine où tous les fichiers uploadés sont écrits
    @Value("${app.upload.root:uploads}")
    private String uploadRoot;

    // Préfixe d'URL public racine sous lequel les fichiers sont servis (voir StaticResourceConfig)
    @Value("${app.upload.public-root:/uploads}")
    private String publicRoot;

    /**
     * Enregistre un fichier dans {uploadRoot}/{subDirectory}/ et retourne son URL publique.
     *
     * @param file          fichier reçu
     * @param subDirectory  sous-dossier logique, ex: "portfolio", "certifications"
     * @param allowedTypes  types MIME autorisés (voir IMAGE_TYPES / DOCUMENT_TYPES)
     * @param maxSizeBytes  taille maximale autorisée en octets
     */
    public String store(MultipartFile file, String subDirectory, Set<String> allowedTypes, long maxSizeBytes) {
        if (file == null || file.isEmpty()) {
            throw new InvalidFileException("Aucun fichier reçu");
        }
        if (file.getSize() > maxSizeBytes) {
            throw new InvalidFileException(
                    "Le fichier dépasse la taille maximale autorisée (" + (maxSizeBytes / (1024 * 1024)) + " Mo)"
            );
        }
        String contentType = file.getContentType();
        if (contentType == null || !allowedTypes.contains(contentType)) {
            throw new InvalidFileException("Format de fichier non supporté");
        }

        try {
            Path targetDir = Paths.get(uploadRoot, subDirectory);
            Files.createDirectories(targetDir);

            String extension = extractExtension(file.getOriginalFilename());
            String filename = UUID.randomUUID() + extension;
            Path targetPath = targetDir.resolve(filename).normalize();

            try (InputStream in = file.getInputStream()) {
                Files.copy(in, targetPath, StandardCopyOption.REPLACE_EXISTING);
            }

            return publicRoot + "/" + subDirectory + "/" + filename;
        } catch (IOException e) {
            throw new RuntimeException("Impossible d'enregistrer le fichier", e);
        }
    }

    private String extractExtension(String originalFilename) {
        if (!StringUtils.hasText(originalFilename) || !originalFilename.contains(".")) {
            return "";
        }
        return originalFilename.substring(originalFilename.lastIndexOf('.'));
    }
}