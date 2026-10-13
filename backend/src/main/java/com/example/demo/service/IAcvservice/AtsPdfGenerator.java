package com.example.demo.service.IAcvservice;

import com.example.demo.Dto.iACV.AtsCvDto;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDFont;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.apache.pdfbox.pdmodel.graphics.color.PDColor;
import org.apache.pdfbox.pdmodel.graphics.color.PDDeviceRGB;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;


@Service
public class AtsPdfGenerator {

    private static final float MARGIN = 56f;
    private static final float PAGE_WIDTH = PDRectangle.A4.getWidth();
    private static final float PAGE_HEIGHT = PDRectangle.A4.getHeight();
    private static final float CONTENT_WIDTH = PAGE_WIDTH - 2 * MARGIN;

    // Colonne gauche étroite (contact / formation / compétences / langues),
    // colonne droite large (profil / expérience).
    private static final float LEFT_WIDTH = 155f;
    private static final float COL_GAP = 26f;
    private static final float LEFT_X = MARGIN;
    private static final float RIGHT_X = LEFT_X + LEFT_WIDTH + COL_GAP;
    private static final float RIGHT_WIDTH = CONTENT_WIDTH - LEFT_WIDTH - COL_GAP;

    private static final PDColor ACCENT = new PDColor(new float[]{0.62f, 0.49f, 0.29f}, PDDeviceRGB.INSTANCE);
    private static final PDColor INK = new PDColor(new float[]{0.09f, 0.11f, 0.15f}, PDDeviceRGB.INSTANCE);
    private static final PDColor MUTED = new PDColor(new float[]{0.42f, 0.45f, 0.5f}, PDDeviceRGB.INSTANCE);
    private static final PDColor DIVIDER = new PDColor(new float[]{0.85f, 0.85f, 0.85f}, PDDeviceRGB.INSTANCE);

    public byte[] generate(AtsCvDto cv) {
        try (PDDocument document = new PDDocument()) {
            PDFont fontBody = new PDType1Font(Standard14Fonts.FontName.HELVETICA);
            PDFont fontBold = new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD);

            Writer writer = new Writer(document, fontBody, fontBold);

            // ── En-tête plein largeur : nom, sous-titre, filet doré ──
            var infos = cv.infosPersonnelles();
            String prenom = infos.prenom() != null ? infos.prenom().toUpperCase() : "";
            String nom = infos.nom() != null ? infos.nom().toUpperCase() : "";

            if (prenom.isEmpty() && nom.isEmpty()) {
                writer.trackedTitle("CURRICULUM VITAE", "");
            } else {
                writer.trackedTitle(prenom, nom);
            }

            if (cv.titrePoste() != null && !cv.titrePoste().isBlank()) {
                writer.trackedSubtitle(cv.titrePoste().toUpperCase());
            }

            writer.spacer(10);
            writer.accentRule();
            writer.spacer(20);
            writer.startColumns();

            // ── Colonne gauche : contact, formation, compétences, langues ──
            List<String> contactLines = new ArrayList<>();
            addIfPresent(contactLines, infos.email());
            addIfPresent(contactLines, infos.telephone());
            addIfPresent(contactLines, infos.ville());
            if (cv.liens() != null) {
                addIfPresent(contactLines, cv.liens().linkedin());
                addIfPresent(contactLines, cv.liens().github());
                addIfPresent(contactLines, cv.liens().siteweb());
            }
            if (!contactLines.isEmpty()) {
                writer.sectionHeadingLeft("Contact");
                for (String line : contactLines) {
                    writer.bulletLineLeft(line);
                }
                writer.spacerLeft(10);
            }

            if (cv.formations() != null && !cv.formations().isEmpty()) {
                writer.sectionHeadingLeft("Formation");
                for (var f : cv.formations()) {
                    if (f.diplome() != null && !f.diplome().isBlank()) {
                        writer.smallBoldLineLeft(f.diplome());
                    }
                    if (f.etablissement() != null && !f.etablissement().isBlank()) {
                        writer.smallLineLeft(f.etablissement());
                    }
                    if (f.periode() != null && !f.periode().isBlank()) {
                        writer.smallMutedLineLeft(f.periode());
                    }
                    writer.spacerLeft(8);
                }
            }

            if (cv.competences() != null && !cv.competences().isEmpty()) {
                writer.sectionHeadingLeft("Compétences");
                for (String skill : cv.competences()) {
                    writer.bulletLineLeft(skill);
                }
                writer.spacerLeft(10);
            }

            if (cv.langues() != null && !cv.langues().isEmpty()) {
                writer.sectionHeadingLeft("Langues");
                for (String langue : cv.langues()) {
                    writer.bulletLineLeft(langue);
                }
            }

            // ── Colonne droite : profil, expérience ──
            if (cv.resume() != null && !cv.resume().isBlank()) {
                writer.sectionHeadingRight("Profil");
                writer.paragraphRight(cv.resume());
                writer.spacerRight(10);
            }

            if (cv.experiences() != null && !cv.experiences().isEmpty()) {
                writer.sectionHeadingRight("Expérience professionnelle");
                for (var exp : cv.experiences()) {
                    String line1 = String.join(" — ", nonBlankList(exp.poste(), exp.entreprise()));
                    writer.jobHeadingRight(line1, exp.periode());
                    if (exp.bullets() != null) {
                        for (String bullet : exp.bullets()) {
                            writer.bulletRight(bullet);
                        }
                    }
                    writer.spacerRight(10);
                }
            }

            writer.close();

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            document.save(out);
            return out.toByteArray();
        } catch (IOException e) {
            throw new RuntimeException("Impossible de générer le PDF du CV", e);
        }
    }

    private void addIfPresent(List<String> list, String value) {
        if (value != null && !value.isBlank()) list.add(value);
    }

    private List<String> nonBlankList(String... values) {
        return List.of(values).stream().filter(v -> v != null && !v.isBlank()).toList();
    }

    private static class Writer {
        private final PDDocument document;
        private final PDFont fontBody;
        private final PDFont fontBold;
        private PDPageContentStream stream;

        private float leftY;
        private float rightY;
        private float columnsTopY;

        Writer(PDDocument document, PDFont fontBody, PDFont fontBold) throws IOException {
            this.document = document;
            this.fontBody = fontBody;
            this.fontBold = fontBold;
            newPage();
        }

        private void newPage() throws IOException {
            PDPage page = new PDPage(PDRectangle.A4);
            document.addPage(page);
            stream = new PDPageContentStream(document, page);
            leftY = PAGE_HEIGHT - MARGIN;
            rightY = PAGE_HEIGHT - MARGIN;
        }

        /** Appelé une fois l'en-tête écrit : fixe le point de départ commun des deux colonnes. */
        void startColumns() {
            columnsTopY = leftY;
            rightY = columnsTopY;
        }

        private void ensureSpaceLeft(float needed) throws IOException {
            if (leftY - needed < MARGIN) {
                breakColumnsToNewPage();
            }
        }

        private void ensureSpaceRight(float needed) throws IOException {
            if (rightY - needed < MARGIN) {
                breakColumnsToNewPage();
            }
        }

        /** Page de continuation : pas de ré-écriture de l'en-tête, on repart du haut sur les deux colonnes. */
        private void breakColumnsToNewPage() throws IOException {
            stream.close();
            newPage();
            columnsTopY = leftY;
            drawDivider();
        }

        private void drawDivider() throws IOException {
            float dividerX = RIGHT_X - COL_GAP / 2f;
            stream.setStrokingColor(DIVIDER);
            stream.setLineWidth(0.6f);
            stream.moveTo(dividerX, columnsTopY + 4);
            stream.lineTo(dividerX, MARGIN);
            stream.stroke();
        }

        // ── En-tête plein largeur ──

        void trackedTitle(String prenom, String nom) throws IOException {
            float size = 21f;
            float spacing = size * 0.14f;

            float w1 = trackedWidth(prenom, fontBody, size, spacing);
            float sep = prenom.isEmpty() || nom.isEmpty() ? 0 : trackedWidth(" ", fontBody, size, spacing);
            float w2 = trackedWidth(nom, fontBold, size, spacing);
            float totalWidth = w1 + sep + w2;
            float startX = MARGIN + Math.max(0, (CONTENT_WIDTH - totalWidth) / 2);

            float x = startX;
            if (!prenom.isEmpty()) {
                x = writeTracked(prenom, fontBody, size, x, leftY, INK, spacing);
                x += sep;
            }
            if (!nom.isEmpty()) {
                writeTracked(nom, fontBold, size, x, leftY, INK, spacing);
            }
            leftY -= 26;
            rightY = leftY;
        }

        void trackedSubtitle(String text) throws IOException {
            float size = 10f;
            float spacing = size * 0.28f;
            float width = trackedWidth(text, fontBody, size, spacing);
            float startX = MARGIN + Math.max(0, (CONTENT_WIDTH - width) / 2);
            writeTracked(text, fontBody, size, startX, leftY, MUTED, spacing);
            leftY -= 16;
            rightY = leftY;
        }

        void accentRule() throws IOException {
            stream.setStrokingColor(ACCENT);
            stream.setLineWidth(1.2f);
            stream.moveTo(MARGIN, leftY);
            stream.lineTo(MARGIN + CONTENT_WIDTH, leftY);
            stream.stroke();
        }

        void spacer(float amount) {
            leftY -= amount;
            rightY = leftY;
        }

        // ── Colonne gauche ──

        void sectionHeadingLeft(String text) throws IOException {
            ensureSpaceLeft(18);
            float size = 9.5f;
            float spacing = size * 0.16f;
            writeTracked(text.toUpperCase(), fontBold, size, LEFT_X, leftY, INK, spacing);
            leftY -= 13;
        }

        void bulletLineLeft(String text) throws IOException {
            for (String line : wrap(text, fontBody, 9f, LEFT_WIDTH - 9)) {
                ensureSpaceLeft(12);
                stream.setNonStrokingColor(ACCENT);
                stream.addRect(LEFT_X, leftY + 2.5f, 3f, 3f);
                stream.fill();
                writeLine(line, fontBody, 9f, LEFT_X + 9, leftY, INK);
                leftY -= 12;
            }
        }

        void smallBoldLineLeft(String text) throws IOException {
            for (String line : wrap(text, fontBold, 9.5f, LEFT_WIDTH)) {
                ensureSpaceLeft(12);
                writeLine(line, fontBold, 9.5f, LEFT_X, leftY, INK);
                leftY -= 12;
            }
        }

        void smallLineLeft(String text) throws IOException {
            for (String line : wrap(text, fontBody, 9f, LEFT_WIDTH)) {
                ensureSpaceLeft(11);
                writeLine(line, fontBody, 9f, LEFT_X, leftY, INK);
                leftY -= 11;
            }
        }

        void smallMutedLineLeft(String text) throws IOException {
            ensureSpaceLeft(11);
            writeLine(text, fontBody, 8.5f, LEFT_X, leftY, MUTED);
            leftY -= 11;
        }

        void spacerLeft(float amount) {
            leftY -= amount;
        }

        // ── Colonne droite ──

        void sectionHeadingRight(String text) throws IOException {
            ensureSpaceRight(18);
            float size = 10.5f;
            float spacing = size * 0.2f;
            writeTracked(text.toUpperCase(), fontBold, size, RIGHT_X, rightY, INK, spacing);
            rightY -= 14;
        }

        void jobHeadingRight(String text, String periode) throws IOException {
            ensureSpaceRight(14);
            writeLine(text, fontBold, 10.5f, RIGHT_X, rightY, INK);
            if (periode != null && !periode.isBlank()) {
                float width = fontBody.getStringWidth(sanitize(periode)) / 1000 * 9.5f;
                stream.beginText();
                stream.setFont(fontBody, 9.5f);
                stream.setNonStrokingColor(MUTED);
                stream.newLineAtOffset(RIGHT_X + RIGHT_WIDTH - width, rightY + 1);
                stream.showText(sanitize(periode));
                stream.endText();
            }
            rightY -= 14;
        }

        void bulletRight(String text) throws IOException {
            List<String> lines = wrap(text, fontBody, 9.5f, RIGHT_WIDTH - 14);
            for (int i = 0; i < lines.size(); i++) {
                ensureSpaceRight(12);
                if (i == 0) {
                    stream.beginText();
                    stream.setFont(fontBody, 9.5f);
                    stream.setNonStrokingColor(ACCENT);
                    stream.newLineAtOffset(RIGHT_X, rightY);
                    stream.showText("-");
                    stream.endText();
                }
                writeLine(lines.get(i), fontBody, 9.5f, RIGHT_X + 12, rightY, INK);
                rightY -= 12;
            }
        }

        void paragraphRight(String text) throws IOException {
            for (String line : wrap(text, fontBody, 10, RIGHT_WIDTH)) {
                ensureSpaceRight(13);
                writeLine(line, fontBody, 10, RIGHT_X, rightY, INK);
                rightY -= 13;
            }
        }

        void spacerRight(float amount) {
            rightY -= amount;
        }

        // ── Primitives bas niveau ──

        private void writeLine(String text, PDFont font, float size, float x, float y, PDColor color) throws IOException {
            stream.beginText();
            stream.setFont(font, size);
            stream.setNonStrokingColor(color);
            stream.newLineAtOffset(x, y);
            stream.showText(sanitize(text));
            stream.endText();
        }

        private float writeTracked(String text, PDFont font, float size, float x, float y, PDColor color, float spacing) throws IOException {
            stream.beginText();
            stream.setFont(font, size);
            stream.setNonStrokingColor(color);
            stream.setCharacterSpacing(spacing);
            stream.newLineAtOffset(x, y);
            stream.showText(sanitize(text));
            stream.endText();
            stream.setCharacterSpacing(0);
            return x + trackedWidth(text, font, size, spacing);
        }

        private float trackedWidth(String text, PDFont font, float size, float spacing) throws IOException {
            if (text.isEmpty()) return 0;
            return font.getStringWidth(sanitize(text)) / 1000 * size + spacing * text.length();
        }

        private String sanitize(String text) {
            return text.replaceAll("[\\u2018\\u2019]", "'")
                    .replaceAll("[\\u201C\\u201D]", "\"")
                    .replaceAll("\\u2013|\\u2014", "-")
                    .replaceAll("[^\\x00-\\xFF]", "");
        }

        private List<String> wrap(String text, PDFont font, float size, float maxWidth) throws IOException {
            List<String> result = new ArrayList<>();
            for (String paragraph : text.split("\n")) {
                StringBuilder line = new StringBuilder();
                for (String word : paragraph.split(" ")) {
                    String candidate = line.isEmpty() ? word : line + " " + word;
                    float width = font.getStringWidth(sanitize(candidate)) / 1000 * size;
                    if (width > maxWidth && !line.isEmpty()) {
                        result.add(line.toString());
                        line = new StringBuilder(word);
                    } else {
                        line = new StringBuilder(candidate);
                    }
                }
                if (!line.isEmpty()) result.add(line.toString());
            }
            return result;
        }

        void close() throws IOException {
            stream.close();
        }
    }
}