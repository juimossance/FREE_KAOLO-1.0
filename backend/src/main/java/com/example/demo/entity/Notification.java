package com.example.demo.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String type; // payment, message, project, system
    private String titre;
    private String description;
    private LocalDateTime date;
    private boolean lu;

    @ManyToOne
    @JoinColumn(name="user_id")
    private User user;

    // Getters & Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getTitre() { return titre; }
    public void setTitre(String titre) { this.titre = titre; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public LocalDateTime getDate() { return date; }
    public void setDate(LocalDateTime date) { this.date = date; }
    public boolean isLu() { return lu; }
    public void setLu(boolean lu) { this.lu = lu; }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }
}