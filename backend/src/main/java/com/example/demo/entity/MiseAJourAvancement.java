package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "mise_a_jour_avancement")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MiseAJourAvancement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "projet_id", nullable = false)
    private Projet projet;

    // Pourcentage courant au moment de la publication (0-100)
    @Column(nullable = false)
    private Integer pourcentage;

    @Column(length = 1000)
    private String message;

    @Column(nullable = false)
    private LocalDateTime date;

    @PrePersist
    public void prePersist() {
        if (this.date == null) {
            this.date = LocalDateTime.now();
        }
    }
}

