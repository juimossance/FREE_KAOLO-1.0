package com.example.demo.Controller;

import com.example.demo.service.FileStorageService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/certifications/documents")
public class CertificationDocumentController {

    private static final long MAX_SIZE_BYTES = 5L * 1024 * 1024; // 5 Mo

    private final FileStorageService fileStorageService;

    public CertificationDocumentController(FileStorageService fileStorageService) {
        this.fileStorageService = fileStorageService;
    }

    @PostMapping(consumes = "multipart/form-data")
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, String> upload(@RequestParam("file") MultipartFile file) {
        String url = fileStorageService.store(file, "certifications", FileStorageService.DOCUMENT_TYPES, MAX_SIZE_BYTES);
        return Map.of("url", url);
    }
}