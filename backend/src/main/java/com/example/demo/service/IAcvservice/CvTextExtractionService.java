package com.example.demo.service.IAcvservice;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.apache.poi.xwpf.usermodel.XWPFParagraph;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.io.ByteArrayInputStream;
import java.io.IOException;

@Service
public class CvTextExtractionService {

    /**
     * Extrait le texte brut d'un CV stocké en base (PDF ou Word).
     * Le contentType doit être celui persisté à l'import
     * (Freelancer.cvContentType), pas la version normalisée pour le
     * téléchargement frontend.
     */
    public String extract(byte[] data, String contentType) {
        if (data == null || data.length == 0) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Aucun CV disponible à analyser");
        }

        try {
            if ("application/pdf".equals(contentType)) {
                return extractFromPdf(data);
            }
            if ("application/msword".equals(contentType)
                    || "application/vnd.openxmlformats-officedocument.wordprocessingml.document".equals(contentType)) {
                return extractFromDocx(data);
            }
            throw new ResponseStatusException(HttpStatus.UNSUPPORTED_MEDIA_TYPE, "Format de CV non pris en charge pour l'analyse");
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Impossible de lire le contenu du CV");
        }
    }

    private String extractFromPdf(byte[] data) throws IOException {
        try (PDDocument document = Loader.loadPDF(data)) {
            PDFTextStripper stripper = new PDFTextStripper();
            stripper.setSortByPosition(true);
            String text = stripper.getText(document);
            return text == null ? "" : text.trim();
        }
    }

    private String extractFromDocx(byte[] data) throws IOException {
        // ⚠️ .doc (ancien format binaire) n'est pas géré ici, seulement .docx.
        // Si vous devez accepter .doc, ajoutez org.apache.poi:poi-scratchpad
        // et HWPFDocument séparément — dites-le-moi si besoin.
        try (XWPFDocument document = new XWPFDocument(new ByteArrayInputStream(data))) {
            StringBuilder sb = new StringBuilder();
            for (XWPFParagraph paragraph : document.getParagraphs()) {
                sb.append(paragraph.getText()).append("\n");
            }
            return sb.toString().trim();
        }
    }
}