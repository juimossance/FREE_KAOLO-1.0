package com.example.demo.entity;


import jakarta.persistence.*;

@Entity
@Table(name = "reponse")
public class Reponse {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 300)
    private String texte;

    @Column(nullable = false)
    private boolean estCorrecte;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false)
    private Question question;

    public Reponse() {
    }

    public Reponse(String texte, boolean estCorrecte, Question question) {
        this.texte = texte;
        this.estCorrecte = estCorrecte;
        this.question = question;
    }

    // --- Getters / Setters ---

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTexte() { return texte; }
    public void setTexte(String texte) { this.texte = texte; }

    public boolean isEstCorrecte() { return estCorrecte; }
    public void setEstCorrecte(boolean estCorrecte) { this.estCorrecte = estCorrecte; }

    public Question getQuestion() { return question; }
    public void setQuestion(Question question) { this.question = question; }
}