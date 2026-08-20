// src/pages/CVDemo.tsx
import React from 'react';
import { CVTemplate } from '../components/CVTemplate';

export const CVDemo: React.FC = () => {
  const cvData = {
    prenom: "Christian",
    nom: "Juimo",
    titre: "Développeur Full Stack",
    email: "juimoc34@gmail.com",
    telephone: "+237 6 55 55 55 55",
    ville: "Yaoundé, Cameroun",
    description: "Développeur Full Stack passionné par la création d'applications web modernes et performantes. Fort de 3 ans d'expérience dans le développement avec React et Node.js, je maîtrise l'ensemble du cycle de vie d'un projet, de la conception à la mise en production.",
    competences: ["React", "Node.js", "TypeScript", "Tailwind CSS", "PostgreSQL", "Docker"],
    experience: `2024 - Présent : Développeur Full Stack - Freelance
    • Développement d'applications web avec React et Node.js
    • Conception et optimisation d'APIs REST
    • Intégration de solutions de paiement mobile

    2022 - 2024 : Développeur Web - Digital Solutions Cameroun
    • Développement de sites e-commerce avec React et Next.js
    • Gestion de projets et coordination d'équipe
    • Mise en place de stratégies SEO`,
    formation: [
      "2022-2024 : Master en Informatique - Université de Yaoundé I",
      "2018-2022 : Licence en Informatique - Université de Yaoundé I"
    ],
    langues: ["Français (Natif)", "Anglais (Intermédiaire - B1)"],
    linkedin: "https://linkedin.com/in/christian-juimo",
    github: "https://github.com/christian-juimo",
    photoUrl: "https://ui-avatars.com/api/?name=Christian+Juimo&background=random&size=128"
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <CVTemplate {...cvData} />
    </div>
  );
};