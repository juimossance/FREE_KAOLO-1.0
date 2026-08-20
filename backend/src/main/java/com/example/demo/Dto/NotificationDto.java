package com.example.demo.Dto;

import com.example.demo.Enum.StatusCandidature;
import com.example.demo.entity.Notification;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public class NotificationDto {
    private Long id;
    private String type;
    private String titre;
    private String description;
    private LocalDateTime date;
    private boolean lu;
    public NotificationDto(Notification notification) {
        this.id = notification.getId();
        this.titre = notification.getTitre();
        this.description = notification.getDescription();
        this.type = notification.getType();
        this.date = notification.getDate();
        this.lu = notification.isLu();
    }
    public NotificationDto(){}

    public NotificationDto( String titre, String type,boolean lu) {
        this.date = date;
        this.description = description;
        this.id = id;
        this.lu = lu;
        this.titre = titre;
        this.type = type;
    }

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





}
