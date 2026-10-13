package com.example.demo.Dto;



import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record NoteRequest(
        @NotNull @Min(1) @Max(5) Integer note,
        @Size(max = 1000) String commentaire
) {}