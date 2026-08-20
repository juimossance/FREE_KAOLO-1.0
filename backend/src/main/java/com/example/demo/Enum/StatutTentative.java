package com.example.demo.Enum;



public enum StatutTentative {
    EN_COURS,   // quiz démarré, pas encore soumis
    NORMALE,    // terminé sans violation suspecte
    SUSPECTE,   // trop de violations détectées (changement d'onglet, sortie plein écran...)
    EXPIREE     // temps écoulé sans soumission
}
