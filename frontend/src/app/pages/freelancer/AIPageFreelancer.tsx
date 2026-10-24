// src/app/pages/freelancer/AIPageFreelancer.tsx
import { useState, useRef } from "react";
import { Bot, Send, Loader2, FileText, BarChart2, Sparkles,
         RefreshCw, Copy, ThumbsUp, ThumbsDown, TrendingUp,
         Users, Download, CheckCircle, User, Mail, Phone, MapPin,
         Globe, Award, Briefcase, GraduationCap, Languages, Code } from "lucide-react";
import { aiService, type AIMessage } from "../../../services/AIservice";

type AITab = "assistant" | "cv" | "analysis";

const suggestedQuestions = [
  "Analyse mon profil et suggère des améliorations",
  "Rédige une lettre de motivation pour un projet React",
  "Comment augmenter ma note sur la plateforme ?",
  "Quels types de projets correspondent à mon profil ?",
  "Comment fixer mon tarif journalier ?",
];

const inputClass = "w-full px-4 py-3 rounded-xl text-sm border outline-none transition-all";
const inputStyle = { borderColor: "var(--border)", background: "var(--card)", color: "var(--foreground)" };

export function AIPageFreelancer() {
  const [tab, setTab] = useState<AITab>("assistant");

  // ── Assistant ──────────────────────────────────────────────────────────────
  const [messages, setMessages] = useState<AIMessage[]>([{
    role: "assistant",
    content: "Bonjour. Je suis votre assistant IA dédié aux freelancers. Je vous aide à optimiser votre profil, rédiger des lettres de motivation, générer votre CV et analyser le marché. Comment puis-je vous assister ?",
  }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSend = async (text?: string) => {
    const msg = text || input;
    if (!msg.trim() || loading) return;
    setInput("");
    const newMessages: AIMessage[] = [...messages, { role: "user", content: msg }];
    setMessages(newMessages);
    setLoading(true);
    try {
      const res = await aiService.chat(
        newMessages,
        "Tu es un assistant IA pour freelancers sur la plateforme free-kaolo en Afrique de l'Ouest. Tu aides à optimiser les profils, rédiger des lettres de motivation, analyser les candidatures. Réponds en français, de façon professionnelle, concise et actionnable."
      );
      setMessages(prev => [...prev, { role: "assistant", content: res.content }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Désolé, une erreur est survenue. Veuillez réessayer." }]);
    } finally {
      setLoading(false);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    }
  };

  // ── Générateur CV ──────────────────────────────────────────────────────────
  const [cvForm, setCvForm] = useState({
    nom: "", prenom: "", titre: "", email: "", telephone: "", ville: "",
    description: "", competences: "", experience: "", formation: "",
    langues: "", projets: "", niveau: "junior",
    photoUrl: "",
    linkedin: "",
    github: "",
    twitter: "",
  });
  const [cvLoading, setCvLoading] = useState(false);
  const [cvGenerated, setCvGenerated] = useState("");

  const generateCV = async () => {
    if (!cvForm.prenom || !cvForm.titre || !cvForm.description) return;
    setCvLoading(true);
    setCvGenerated("");
    try {
      const res = await aiService.generateCV(cvForm);
      // Transformer la réponse en HTML structuré selon le template
      const htmlCV = generateCVHTML(cvForm, res.content);
      setCvGenerated(htmlCV);
    } catch {
      setCvGenerated("Erreur lors de la génération du CV.");
    } finally {
      setCvLoading(false);
    }
  };

  const generateCVHTML = (form: typeof cvForm, content: string) => {
    // Parser le contenu généré par l'IA
    const lines = content.split('\n').filter(line => line.trim());
    
    // Extraire les informations structurées
    const aboutMe = lines.find(l => l.toLowerCase().includes('à propos') || l.toLowerCase().includes('profil')) || '';
    const experiences = lines.filter(l => l.includes('Expérience') || l.includes('Poste'));
    const projects = lines.filter(l => l.includes('Projet') || l.includes('Réalisation'));
    const skills = form.competences.split(',').map(s => s.trim());
    const education = form.formation.split('\n').filter(e => e.trim());

    return `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CV - Christian Juimo</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap" rel="stylesheet">
    <style>
        .bg-top-color { background: #1a1a2e; }
        .text-top-color { color: #1a1a2e; }
        .border-top-color { border-color: #1a1a2e; }
        .text-heading { color: #ffffff; }
        * { font-family: 'Poppins', sans-serif; }
        .shadow-custom { box-shadow: 0 10px 30px -10px rgba(0,0,0,0.3); }
    </style>
</head>
<body class="bg-gray-100 p-4">

    <div class="max-w-5xl mx-auto border shadow-custom rounded-lg bg-white overflow-hidden">

        <!-- Top content -->
        <div class="flex flex-wrap items-center rounded-t-lg bg-top-color px-4 sm:px-8 py-6">
            <div class="w-32 h-32 sm:w-40 sm:h-40 overflow-hidden rounded-full border-4 border-white/30 shadow-lg flex-shrink-0">
                <img 
                    src="https://ui-avatars.com/api/?name=Christian+Juimo&background=random&size=128" 
                    alt="Christian Juimo"
                    class="w-full h-full object-cover"
                />
            </div>

            <div class="flex-1 mt-4 sm:mt-0 sm:ml-6 text-center sm:text-left">
                <p class="font-poppins font-bold text-white text-2xl sm:text-4xl">
                    Christian Juimo
                </p>
                <p class="text-white/90 text-base sm:text-lg font-medium">Développeur Full Stack</p>
                <p class="text-white/60 text-sm mt-1">Yaoundé, Cameroun</p>
            </div>
        </div>

        <!-- Main content -->
        <div class="p-4 sm:p-6">

            <div class="flex flex-col lg:flex-row gap-6">

                <!-- Colonne gauche -->
                <div class="lg:w-1/3 space-y-6">

                    <!-- Contact -->
                    <div>
                        <h2 class="text-lg font-bold text-top-color">Contact</h2>
                        <div class="border-2 w-16 border-top-color my-2"></div>

                        <div class="space-y-2 text-sm">
                            <div class="flex items-center gap-2">
                                <svg class="w-4 h-4 text-gray-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                                    <path fill="currentColor" d="M100.28 448H7.4V148.9h92.88zM53.79 108.1C24.09 108.1 0 83.5 0 53.8a53.79 53.79 0 0 1 107.58 0c0 29.7-24.1 54.3-53.79 54.3zM447.9 448h-92.68V302.4c0-34.7-.7-79.2-48.29-79.2-48.29 0-55.69 37.7-55.69 76.7V448h-92.78V148.9h89.08v40.8h1.3c12.4-23.5 42.69-48.3 87.88-48.3 94 0 111.28 61.9 111.28 142.3V448z"/>
                                </svg>
                                <span class="truncate">juimoc34@gmail.com</span>
                            </div>
                            
                            <div class="flex items-center gap-2">
                                <svg class="w-4 h-4 text-gray-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
                                    <path fill="currentColor" d="M172.268 501.67C26.97 291.031 0 269.413 0 192 0 85.961 85.961 0 192 0s192 85.961 192 192c0 77.413-26.97 99.031-172.268 309.67-9.535 13.774-29.93 13.773-39.464 0zM192 272c44.183 0 80-35.817 80-80s-35.817-80-80-80-80 35.817-80 80 35.817 80 80 80z"/>
                                </svg>
                                <span>Yaoundé, Cameroun</span>
                            </div>

                            <div class="flex items-center gap-2">
                                <svg class="w-4 h-4 text-gray-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                                    <path fill="currentColor" d="M100.28 448H7.4V148.9h92.88zM53.79 108.1C24.09 108.1 0 83.5 0 53.8a53.79 53.79 0 0 1 107.58 0c0 29.7-24.1 54.3-53.79 54.3zM447.9 448h-92.68V302.4c0-34.7-.7-79.2-48.29-79.2-48.29 0-55.69 37.7-55.69 76.7V448h-92.78V148.9h89.08v40.8h1.3c12.4-23.5 42.69-48.3 87.88-48.3 94 0 111.28 61.9 111.28 142.3V448z"/>
                                </svg>
                                <a href="https://linkedin.com/in/christian-juimo" target="_blank" class="text-blue-600 hover:underline truncate">LinkedIn</a>
                            </div>

                            <div class="flex items-center gap-2">
                                <svg class="w-4 h-4 text-gray-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 496 512">
                                    <path fill="currentColor" d="M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3.3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.6.3-6.2 2.3zm44.2-1.7c-2.9.7-4.9 2.6-4.6 4.9.3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-22.5-.3-44.1-68.7 14.9-83.1-33.5-83.1-33.5-11.2-28.5-27.5-36.1-27.5-36.1-22.5-15.4 1.7-15.1 1.7-15.1 24.9 1.7 38 25.6 38 25.6 22.1 37.9 58 26.9 72.2 20.5 2.3-16 8.6-26.9 15.7-33.1-55-6.2-112.8-27.5-112.8-122.3 0-27 9.6-49.1 25.4-66.4-2.6-6.3-11-31.5 2.4-65.6 0 0 20.7-6.6 67.8 25.3 19.7-5.5 40.8-8.2 61.8-8.3 21 0 42.1 2.8 61.8 8.3 47.1-31.9 67.8-25.3 67.8-25.3 13.4 34.1 5 59.3 2.4 65.6 15.8 17.3 25.4 39.4 25.4 66.4 0 94.9-57.8 116.1-112.8 122.3 8.9 7.7 16.8 22.8 16.8 45.9 0 33.1-.3 59.8-.3 67.9 0 6.5 4.5 14.4 17.3 12.1C426.2 457.8 496 362.9 496 252 496 113.3 383.5 8 244.8 8zM97.2 352.9c-1.3 1-1 3.3.7 5.2 1.6 1.6 3.9 2.3 5.2 1 1.3-1 1-3.3-.7-5.2-1.6-1.6-3.9-2.3-5.2-1zm-10.8-8.1c-.7 1.3.3 2.9 2.3 3.9 1.6 1 3.6.7 4.3-.7.7-1.3-.3-2.9-2.3-3.9-2-.6-3.6-.3-4.3.7zm32.4 35.6c-1.6 1.3-1 4.3 1.3 6.2 2.3 2.3 5.2 2.6 6.5 1 1.3-1.3.7-4.3-1.3-6.2-2.2-2.3-5.2-2.6-6.5-1zm-11.4-14.7c-1.6 1-1.6 3.6 0 5.9 1.6 2.3 4.3 3.3 5.6 2.3 1.6-1.3 1.6-3.9 0-6.2-1.4-2.3-4-3.3-5.6-2z"/>
                                </svg>
                                <a href="https://github.com/christian-juimo" target="_blank" class="text-blue-600 hover:underline truncate">GitHub</a>
                            </div>
                        </div>
                    </div>

                    <!-- Compétences -->
                    <div>
                        <h2 class="text-lg font-bold text-top-color">Compétences</h2>
                        <div class="border-2 w-16 border-top-color my-2"></div>

                        <div class="space-y-2">
                            <div class="flex items-center gap-2 text-sm">
                                <svg class="w-4 h-4 text-gray-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512">
                                    <path fill="currentColor" d="M528.29 117.71L477.73 61.21C463.96 46.82 447.07 36.5 428.87 31.44L318.06 0.66C299.94 -3.77 280.06 -3.77 261.94 0.66L151.13 31.44C132.93 36.5 116.04 46.82 102.27 61.21L51.71 117.71C35.52 134.71 24.71 156.75 20.3 180.6L0.66 286.08C-3.77 304.2 -3.77 324.08 0.66 342.2L20.3 447.67C24.71 471.52 35.52 493.56 51.71 510.56L102.27 567.06C116.04 581.45 132.93 591.77 151.13 596.83L261.94 627.61C280.06 632.04 299.94 632.04 318.06 627.61L428.87 596.83C447.07 591.77 463.96 581.45 477.73 567.06L528.29 510.56C544.48 493.56 555.29 471.52 559.7 447.67L579.34 342.2C583.77 324.08 583.77 304.2 579.34 286.08L559.7 180.6C555.29 156.75 544.48 134.71 528.29 117.71ZM288.01 445.1C200.17 445.1 128.91 373.84 128.91 286C128.91 198.16 200.17 126.9 288.01 126.9C375.85 126.9 447.11 198.16 447.11 286C447.11 373.84 375.85 445.1 288.01 445.1Z"/>
                                </svg>
                                <span>React</span>
                            </div>
                            <div class="flex items-center gap-2 text-sm">
                                <svg class="w-4 h-4 text-gray-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512">
                                    <path fill="currentColor" d="M528.29 117.71L477.73 61.21C463.96 46.82 447.07 36.5 428.87 31.44L318.06 0.66C299.94 -3.77 280.06 -3.77 261.94 0.66L151.13 31.44C132.93 36.5 116.04 46.82 102.27 61.21L51.71 117.71C35.52 134.71 24.71 156.75 20.3 180.6L0.66 286.08C-3.77 304.2 -3.77 324.08 0.66 342.2L20.3 447.67C24.71 471.52 35.52 493.56 51.71 510.56L102.27 567.06C116.04 581.45 132.93 591.77 151.13 596.83L261.94 627.61C280.06 632.04 299.94 632.04 318.06 627.61L428.87 596.83C447.07 591.77 463.96 581.45 477.73 567.06L528.29 510.56C544.48 493.56 555.29 471.52 559.7 447.67L579.34 342.2C583.77 324.08 583.77 304.2 579.34 286.08L559.7 180.6C555.29 156.75 544.48 134.71 528.29 117.71ZM288.01 445.1C200.17 445.1 128.91 373.84 128.91 286C128.91 198.16 200.17 126.9 288.01 126.9C375.85 126.9 447.11 198.16 447.11 286C447.11 373.84 375.85 445.1 288.01 445.1Z"/>
                                </svg>
                                <span>Node.js</span>
                            </div>
                            <div class="flex items-center gap-2 text-sm">
                                <svg class="w-4 h-4 text-gray-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512">
                                    <path fill="currentColor" d="M528.29 117.71L477.73 61.21C463.96 46.82 447.07 36.5 428.87 31.44L318.06 0.66C299.94 -3.77 280.06 -3.77 261.94 0.66L151.13 31.44C132.93 36.5 116.04 46.82 102.27 61.21L51.71 117.71C35.52 134.71 24.71 156.75 20.3 180.6L0.66 286.08C-3.77 304.2 -3.77 324.08 0.66 342.2L20.3 447.67C24.71 471.52 35.52 493.56 51.71 510.56L102.27 567.06C116.04 581.45 132.93 591.77 151.13 596.83L261.94 627.61C280.06 632.04 299.94 632.04 318.06 627.61L428.87 596.83C447.07 591.77 463.96 581.45 477.73 567.06L528.29 510.56C544.48 493.56 555.29 471.52 559.7 447.67L579.34 342.2C583.77 324.08 583.77 304.2 579.34 286.08L559.7 180.6C555.29 156.75 544.48 134.71 528.29 117.71ZM288.01 445.1C200.17 445.1 128.91 373.84 128.91 286C128.91 198.16 200.17 126.9 288.01 126.9C375.85 126.9 447.11 198.16 447.11 286C447.11 373.84 375.85 445.1 288.01 445.1Z"/>
                                </svg>
                                <span>TypeScript</span>
                            </div>
                            <div class="flex items-center gap-2 text-sm">
                                <svg class="w-4 h-4 text-gray-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512">
                                    <path fill="currentColor" d="M528.29 117.71L477.73 61.21C463.96 46.82 447.07 36.5 428.87 31.44L318.06 0.66C299.94 -3.77 280.06 -3.77 261.94 0.66L151.13 31.44C132.93 36.5 116.04 46.82 102.27 61.21L51.71 117.71C35.52 134.71 24.71 156.75 20.3 180.6L0.66 286.08C-3.77 304.2 -3.77 324.08 0.66 342.2L20.3 447.67C24.71 471.52 35.52 493.56 51.71 510.56L102.27 567.06C116.04 581.45 132.93 591.77 151.13 596.83L261.94 627.61C280.06 632.04 299.94 632.04 318.06 627.61L428.87 596.83C447.07 591.77 463.96 581.45 477.73 567.06L528.29 510.56C544.48 493.56 555.29 471.52 559.7 447.67L579.34 342.2C583.77 324.08 583.77 304.2 579.34 286.08L559.7 180.6C555.29 156.75 544.48 134.71 528.29 117.71ZM288.01 445.1C200.17 445.1 128.91 373.84 128.91 286C128.91 198.16 200.17 126.9 288.01 126.9C375.85 126.9 447.11 198.16 447.11 286C447.11 373.84 375.85 445.1 288.01 445.1Z"/>
                                </svg>
                                <span>Tailwind CSS</span>
                            </div>
                            <div class="flex items-center gap-2 text-sm">
                                <svg class="w-4 h-4 text-gray-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512">
                                    <path fill="currentColor" d="M528.29 117.71L477.73 61.21C463.96 46.82 447.07 36.5 428.87 31.44L318.06 0.66C299.94 -3.77 280.06 -3.77 261.94 0.66L151.13 31.44C132.93 36.5 116.04 46.82 102.27 61.21L51.71 117.71C35.52 134.71 24.71 156.75 20.3 180.6L0.66 286.08C-3.77 304.2 -3.77 324.08 0.66 342.2L20.3 447.67C24.71 471.52 35.52 493.56 51.71 510.56L102.27 567.06C116.04 581.45 132.93 591.77 151.13 596.83L261.94 627.61C280.06 632.04 299.94 632.04 318.06 627.61L428.87 596.83C447.07 591.77 463.96 581.45 477.73 567.06L528.29 510.56C544.48 493.56 555.29 471.52 559.7 447.67L579.34 342.2C583.77 324.08 583.77 304.2 579.34 286.08L559.7 180.6C555.29 156.75 544.48 134.71 528.29 117.71ZM288.01 445.1C200.17 445.1 128.91 373.84 128.91 286C128.91 198.16 200.17 126.9 288.01 126.9C375.85 126.9 447.11 198.16 447.11 286C447.11 373.84 375.85 445.1 288.01 445.1Z"/>
                                </svg>
                                <span>PostgreSQL</span>
                            </div>
                        </div>
                    </div>

                    <!-- Formation -->
                    <div>
                        <h2 class="text-lg font-bold text-top-color">Formation</h2>
                        <div class="border-2 w-16 border-top-color my-2"></div>
                        <div class="space-y-3">
                            <div>
                                <p class="text-sm font-medium">2022-2024 : Master en Informatique</p>
                                <p class="text-xs text-gray-600">Université de Yaoundé I</p>
                            </div>
                            <div>
                                <p class="text-sm font-medium">2018-2022 : Licence en Informatique</p>
                                <p class="text-xs text-gray-600">Université de Yaoundé I</p>
                            </div>
                        </div>
                    </div>

                    <!-- Langues -->
                    <div>
                        <h2 class="text-lg font-bold text-top-color">Langues</h2>
                        <div class="border-2 w-16 border-top-color my-2"></div>
                        <div class="space-y-1 text-sm">
                            <div>• Français (Natif)</div>
                            <div>• Anglais (Intermédiaire - B1)</div>
                        </div>
                    </div>

                </div>

                <!-- Colonne droite -->
                <div class="lg:w-2/3 space-y-6">

                    <!-- À propos -->
                    <div>
                        <h2 class="text-lg font-bold text-top-color">À propos</h2>
                        <div class="border-2 w-16 border-top-color my-2"></div>
                        <p class="text-sm leading-relaxed">
                            Développeur Full Stack passionné par la création d'applications web modernes et performantes. 
                            Fort de 3 ans d'expérience dans le développement avec React et Node.js, je maîtrise l'ensemble 
                            du cycle de vie d'un projet, de la conception à la mise en production. Je suis constamment à 
                            la recherche de nouvelles technologies pour améliorer mes compétences et proposer des solutions 
                            innovantes à mes clients.
                        </p>
                    </div>

                    <!-- Expériences -->
                    <div>
                        <h2 class="text-lg font-bold text-top-color">Expériences professionnelles</h2>
                        <div class="border-2 w-16 border-top-color my-2"></div>
                        <div class="space-y-4">
                            <div>
                                <p class="font-semibold text-gray-800">Développeur Full Stack - Freelance</p>
                                <p class="text-sm text-gray-600">2024 - Présent</p>
                                <ul class="text-sm list-disc pl-4 space-y-1 mt-2">
                                    <li>Développement d'applications web avec React et Node.js</li>
                                    <li>Conception et optimisation d'APIs REST</li>
                                    <li>Intégration de solutions de paiement mobile</li>
                                    <li>Formation et accompagnement des clients</li>
                                </ul>
                            </div>
                            <div>
                                <p class="font-semibold text-gray-800">Développeur Web - Digital Solutions Cameroun</p>
                                <p class="text-sm text-gray-600">2022 - 2024</p>
                                <ul class="text-sm list-disc pl-4 space-y-1 mt-2">
                                    <li>Développement de sites e-commerce avec React et Next.js</li>
                                    <li>Gestion de projets et coordination d'équipe</li>
                                    <li>Mise en place de stratégies SEO</li>
                                    <li>Maintenance et optimisation des applications existantes</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <!-- Projets -->
                    <div>
                        <h2 class="text-lg font-bold text-top-color">Projets</h2>
                        <div class="border-2 w-16 border-top-color my-2"></div>
                        <div class="space-y-3">
                            <div>
                                <p class="font-semibold text-gray-800">Plateforme E-commerce</p>
                                <p class="text-sm text-gray-600">Développement d'une plateforme de vente en ligne avec React, Node.js et MongoDB. Intégration de paiement mobile et système de livraison.</p>
                            </div>
                            <div>
                                <p class="font-semibold text-gray-800">SaaS de Gestion RH</p>
                                <p class="text-sm text-gray-600">Application SaaS pour la gestion des ressources humaines avec tableau de bord personnalisé, gestion des congés et suivi des performances.</p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

        </div>

    </div>

</body>
</html>`;
  };

  const downloadCV = () => {
    const blob = new Blob([cvGenerated], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `CV_${cvForm.prenom}_${cvForm.nom}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Analyse marché ─────────────────────────────────────────────────────────
  const [analyses, setAnalyses] = useState<Record<string, string>>({});
  const [analysisLoading, setAnalysisLoading] = useState<string | null>(null);

  const generateAnalysis = async (type: string) => {
    setAnalysisLoading(type);
    try {
      const res = await aiService.analysis(type, "FREELANCER");
      setAnalyses(prev => ({ ...prev, [type]: res.content }));
    } catch {
      setAnalyses(prev => ({ ...prev, [type]: "Erreur de génération." }));
    } finally {
      setAnalysisLoading(null);
    }
  };

  const tabs = [
    { key: "assistant" as AITab, label: "Assistant IA", icon: <Bot size={16} /> },
    { key: "cv" as AITab, label: "Générateur CV", icon: <FileText size={16} /> },
    { key: "analysis" as AITab, label: "Analyse", icon: <BarChart2 size={16} /> },
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Tab bar */}
      <div className="flex gap-1 px-6 pt-4 border-b bg-white" style={{ borderColor: "var(--border)" }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-sm font-medium border-b-2 transition-all"
            style={{
              borderColor: tab === t.key ? "var(--navy)" : "transparent",
              color: tab === t.key ? "var(--navy)" : "var(--muted-foreground)",
              background: tab === t.key ? "var(--secondary)" : "transparent",
            }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">

        {/* ── Assistant ── */}
        {tab === "assistant" && (
          <div className="h-full flex flex-col max-w-3xl mx-auto">
            <div className="flex-1 p-6 space-y-5 overflow-y-auto">
              <div className="flex items-center gap-3 justify-center py-2">
                <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
                  style={{ background: "var(--secondary)", color: "var(--muted-foreground)" }}>
                  <Sparkles size={12} style={{ color: "var(--gold)" }} /> Alimenté par OpenRouter
                </div>
                <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
              </div>

              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} gap-3`}>
                  {msg.role === "assistant" && (
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: "var(--navy)" }}>
                      <Bot size={16} className="text-white" />
                    </div>
                  )}
                  <div className={`max-w-lg flex flex-col gap-1 ${msg.role === "user" ? "items-end" : "items-start"}`}>
                    <div className="px-4 py-3.5 rounded-2xl text-sm leading-relaxed whitespace-pre-line"
                      style={{
                        background: msg.role === "user" ? "var(--navy)" : "var(--card)",
                        color: msg.role === "user" ? "#FFF" : "var(--foreground)",
                        border: msg.role === "assistant" ? "1px solid var(--border)" : "none",
                        borderBottomRightRadius: msg.role === "user" ? 4 : undefined,
                        borderBottomLeftRadius: msg.role === "assistant" ? 4 : undefined,
                      }}>
                      {msg.content}
                    </div>
                    {msg.role === "assistant" && i > 0 && (
                      <div className="flex gap-1.5">
                        <button onClick={() => navigator.clipboard.writeText(msg.content)}
                          className="p-1 rounded hover:bg-slate-100"><Copy size={12} className="text-slate-400" /></button>
                        <button className="p-1 rounded hover:bg-slate-100"><ThumbsUp size={12} className="text-slate-400" /></button>
                        <button className="p-1 rounded hover:bg-slate-100"><ThumbsDown size={12} className="text-slate-400" /></button>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: "var(--navy)" }}>
                    <Bot size={16} className="text-white" />
                  </div>
                  <div className="px-4 py-3.5 rounded-2xl border"
                    style={{ background: "var(--card)", borderColor: "var(--border)" }}>
                    <div className="flex gap-1.5 items-center">
                      {[0, 150, 300].map(d => (
                        <div key={d} className="w-2 h-2 rounded-full animate-bounce"
                          style={{ background: "var(--navy)", animationDelay: `${d}ms` }} />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {messages.length === 1 && (
              <div className="px-6 pb-4">
                <p className="text-xs font-semibold mb-2" style={{ color: "var(--muted-foreground)" }}>Suggestions :</p>
                <div className="flex flex-wrap gap-2">
                  {suggestedQuestions.map(q => (
                    <button key={q} onClick={() => handleSend(q)}
                      className="px-3 py-2 rounded-xl text-xs font-medium border hover:bg-slate-50 transition-colors text-left"
                      style={{ borderColor: "var(--border)", color: "var(--navy)" }}>
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="px-6 pb-6">
              <div className="flex gap-3 items-end">
                <textarea value={input} onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                  placeholder="Posez votre question à l'IA..." rows={1}
                  className="flex-1 px-4 py-3.5 rounded-xl text-sm border outline-none resize-none"
                  style={inputStyle} />
                <button onClick={() => handleSend()} disabled={!input.trim() || loading}
                  className="p-3.5 rounded-xl flex-shrink-0 transition-all"
                  style={{
                    background: input.trim() && !loading ? "var(--navy)" : "var(--secondary)",
                    color: input.trim() && !loading ? "#FFF" : "var(--muted-foreground)",
                  }}>
                  {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                </button>
              </div>
              <p className="text-xs mt-2 text-center" style={{ color: "var(--muted-foreground)" }}>
                Alimenté par Mistral via OpenRouter. L'IA peut faire des erreurs.
              </p>
            </div>
          </div>
        )}

        {/* ── Générateur CV Modernisé ── */}
        {tab === "cv" && (
          <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* En-tête avec gradient */}
            <div className="p-6 rounded-2xl relative overflow-hidden"
              style={{
                background: "linear-gradient(135deg, #1E293B 0%, #0F172A 100%)",
              }}>
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl" />

              <div className="relative flex items-center gap-4">
                <div className="p-3 rounded-xl bg-white/10 backdrop-blur-sm">
                  <FileText size={24} className="text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Générateur de CV professionnel</h2>
                  <p className="text-sm text-white/60">
                    Remplissez le formulaire pour obtenir un CV moderne au format HTML
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Formulaire amélioré */}
              <div className="p-6 rounded-2xl border bg-white" style={{ borderColor: "var(--border)" }}>
                <h3 className="font-semibold text-lg mb-4" style={{ color: "var(--navy)" }}>
                  Informations personnelles
                </h3>

                <div className="space-y-4">
                  {/* Identité */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--navy)" }}>
                        <User size={12} className="inline mr-1" /> Prénom *
                      </label>
                      <input
                        className={`${inputClass} focus:ring-2 focus:ring-blue-500/20`}
                        style={inputStyle}
                        placeholder="Kofi"
                        value={cvForm.prenom}
                        onChange={e => setCvForm(f => ({ ...f, prenom: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--navy)" }}>
                        <User size={12} className="inline mr-1" /> Nom *
                      </label>
                      <input
                        className={`${inputClass} focus:ring-2 focus:ring-blue-500/20`}
                        style={inputStyle}
                        placeholder="Mensah"
                        value={cvForm.nom}
                        onChange={e => setCvForm(f => ({ ...f, nom: e.target.value }))}
                      />
                    </div>
                  </div>

                  {/* Titre */}
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--navy)" }}>
                      <Briefcase size={12} className="inline mr-1" /> Titre professionnel *
                    </label>
                    <input
                      className={`${inputClass} focus:ring-2 focus:ring-blue-500/20`}
                      style={inputStyle}
                      placeholder="Développeur Full Stack React / Node.js"
                      value={cvForm.titre}
                      onChange={e => setCvForm(f => ({ ...f, titre: e.target.value }))}
                    />
                  </div>

                  {/* Photo URL */}
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--navy)" }}>
                      URL de la photo de profil
                    </label>
                    <input
                      className={`${inputClass} focus:ring-2 focus:ring-blue-500/20`}
                      style={inputStyle}
                      placeholder="https://example.com/photo.jpg"
                      value={cvForm.photoUrl}
                      onChange={e => setCvForm(f => ({ ...f, photoUrl: e.target.value }))}
                    />
                    <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>
                      Laissez vide pour utiliser un avatar généré automatiquement
                    </p>
                  </div>

                  {/* Contact */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--navy)" }}>
                        <Mail size={12} className="inline mr-1" /> Email
                      </label>
                      <input
                        className={`${inputClass} focus:ring-2 focus:ring-blue-500/20`}
                        style={inputStyle}
                        placeholder="kofi@email.com"
                        value={cvForm.email}
                        onChange={e => setCvForm(f => ({ ...f, email: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--navy)" }}>
                        <Phone size={12} className="inline mr-1" /> Téléphone
                      </label>
                      <input
                        className={`${inputClass} focus:ring-2 focus:ring-blue-500/20`}
                        style={inputStyle}
                        placeholder="+225 07 00 00 00"
                        value={cvForm.telephone}
                        onChange={e => setCvForm(f => ({ ...f, telephone: e.target.value }))}
                      />
                    </div>
                  </div>

                  {/* Localisation et réseaux */}
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--navy)" }}>
                      <MapPin size={12} className="inline mr-1" /> Ville / Pays
                    </label>
                    <input
                      className={`${inputClass} focus:ring-2 focus:ring-blue-500/20`}
                      style={inputStyle}
                      placeholder="Abidjan, Côte d'Ivoire"
                      value={cvForm.ville}
                      onChange={e => setCvForm(f => ({ ...f, ville: e.target.value }))}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--navy)" }}>
                        LinkedIn URL
                      </label>
                      <input
                        className={`${inputClass} focus:ring-2 focus:ring-blue-500/20`}
                        style={inputStyle}
                        placeholder="https://linkedin.com/in/..."
                        value={cvForm.linkedin}
                        onChange={e => setCvForm(f => ({ ...f, linkedin: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--navy)" }}>
                        GitHub URL
                      </label>
                      <input
                        className={`${inputClass} focus:ring-2 focus:ring-blue-500/20`}
                        style={inputStyle}
                        placeholder="https://github.com/..."
                        value={cvForm.github}
                        onChange={e => setCvForm(f => ({ ...f, github: e.target.value }))}
                      />
                    </div>
                  </div>

                  {/* Niveau */}
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--navy)" }}>
                      <Award size={12} className="inline mr-1" /> Niveau d'expérience *
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { v: "junior", l: "Junior", c: "#FEF3C7" },
                        { v: "intermediate", l: "Intermédiaire", c: "#DBEAFE" },
                        { v: "senior", l: "Senior", c: "#D1FAE5" },
                        { v: "expert", l: "Expert", c: "#F3E8FF" },
                      ].map(n => (
                        <button key={n.v} onClick={() => setCvForm(f => ({ ...f, niveau: n.v }))}
                          className="py-2 rounded-xl text-xs font-medium border transition-all"
                          style={{
                            background: cvForm.niveau === n.v ? "var(--navy)" : "transparent",
                            color: cvForm.niveau === n.v ? "#FFF" : "var(--muted-foreground)",
                            borderColor: cvForm.niveau === n.v ? "var(--navy)" : "var(--border)",
                          }}>
                          {n.l}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Résumé */}
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--navy)" }}>
                      Résumé professionnel *
                    </label>
                    <textarea
                      className={`${inputClass} focus:ring-2 focus:ring-blue-500/20`}
                      style={inputStyle}
                      rows={3}
                      placeholder="Développeur passionné avec 5 ans d'expérience en développement web..."
                      value={cvForm.description}
                      onChange={e => setCvForm(f => ({ ...f, description: e.target.value }))}
                    />
                  </div>

                  {/* Compétences */}
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--navy)" }}>
                      <Code size={12} className="inline mr-1" /> Compétences techniques *
                    </label>
                    <textarea
                      className={`${inputClass} focus:ring-2 focus:ring-blue-500/20`}
                      style={inputStyle}
                      rows={2}
                      placeholder="React, Node.js, PostgreSQL, Docker, AWS"
                      value={cvForm.competences}
                      onChange={e => setCvForm(f => ({ ...f, competences: e.target.value }))}
                    />
                  </div>

                  {/* Expérience */}
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--navy)" }}>
                      <Briefcase size={12} className="inline mr-1" /> Expériences professionnelles
                    </label>
                    <textarea
                      className={`${inputClass} focus:ring-2 focus:ring-blue-500/20`}
                      style={inputStyle}
                      rows={3}
                      placeholder="2024-2026 : Développeur senior - XYZ\n2022-2024 : Développeur full stack - ABC"
                      value={cvForm.experience}
                      onChange={e => setCvForm(f => ({ ...f, experience: e.target.value }))}
                    />
                  </div>

                  {/* Formation */}
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--navy)" }}>
                      <GraduationCap size={12} className="inline mr-1" /> Formation
                    </label>
                    <textarea
                      className={`${inputClass} focus:ring-2 focus:ring-blue-500/20`}
                      style={inputStyle}
                      rows={2}
                      placeholder="2020 : Master Informatique\n2018 : Licence Informatique"
                      value={cvForm.formation}
                      onChange={e => setCvForm(f => ({ ...f, formation: e.target.value }))}
                    />
                  </div>

                  {/* Langues */}
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--navy)" }}>
                      <Languages size={12} className="inline mr-1" /> Langues
                    </label>
                    <input
                      className={`${inputClass} focus:ring-2 focus:ring-blue-500/20`}
                      style={inputStyle}
                      placeholder="Français (natif), Anglais (B2)"
                      value={cvForm.langues}
                      onChange={e => setCvForm(f => ({ ...f, langues: e.target.value }))}
                    />
                  </div>

                  {/* Bouton génération */}
                  <button onClick={generateCV}
                    disabled={cvLoading || !cvForm.prenom || !cvForm.titre || !cvForm.description}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
                    style={{
                      background: cvLoading || !cvForm.prenom ? "var(--secondary)" : "var(--navy)",
                      color: cvLoading || !cvForm.prenom ? "var(--muted-foreground)" : "#FFF",
                    }}>
                    {cvLoading
                      ? <><Loader2 size={16} className="animate-spin" /> Génération en cours...</>
                      : <><Sparkles size={16} /> Générer mon CV</>}
                  </button>
                </div>
              </div>

              {/* Aperçu CV */}
              <div className="p-6 rounded-2xl border bg-white flex flex-col" style={{ borderColor: "var(--border)" }}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg" style={{ color: "var(--navy)" }}>
                    <FileText size={18} className="inline mr-2" />
                    Aperçu du CV
                  </h3>
                  {cvGenerated && (
                    <div className="flex gap-2">
                      <button onClick={() => navigator.clipboard.writeText(cvGenerated)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all hover:bg-slate-50"
                        style={{ borderColor: "var(--border)", color: "var(--navy)" }}>
                        <Copy size={14} /> Copier HTML
                      </button>
                      <button onClick={downloadCV}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:opacity-90"
                        style={{ background: "var(--navy)", color: "#FFF" }}>
                        <Download size={14} /> Télécharger
                      </button>
                    </div>
                  )}
                </div>

                {cvLoading ? (
                  <div className="flex-1 flex flex-col items-center justify-center gap-4">
                    <div className="relative">
                      <div className="w-16 h-16 border-4 border-blue-100 rounded-full animate-spin"
                        style={{ borderTopColor: "var(--navy)" }} />
                    </div>
                    <p className="text-sm font-medium" style={{ color: "var(--navy)" }}>
                      Génération du CV en cours...
                    </p>
                    <p className="text-xs text-center" style={{ color: "var(--muted-foreground)" }}>
                      L'IA analyse vos informations<br />et structure un CV professionnel
                    </p>
                  </div>
                ) : cvGenerated ? (
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle size={16} style={{ color: "#22C55E" }} />
                      <span className="text-xs font-medium" style={{ color: "#22C55E" }}>
                        CV généré avec succès
                      </span>
                      <span className="text-xs ml-auto px-2 py-0.5 rounded-full"
                        style={{ background: "var(--secondary)", color: "var(--muted-foreground)" }}>
                        HTML responsive
                      </span>
                    </div>
                    <div className="p-4 rounded-xl text-sm font-mono leading-relaxed overflow-y-auto max-h-[550px] whitespace-pre-wrap"
                      style={{
                        background: "#FAFAFA",
                        border: "1px solid var(--border)",
                        color: "var(--foreground)",
                        fontFamily: "'Inter', system-ui, sans-serif",
                        lineHeight: 1.8,
                      }}>
                      {cvGenerated}
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center gap-4">
                    <div className="p-4 rounded-full" style={{ background: "var(--secondary)" }}>
                      <FileText size={48} style={{ color: "var(--muted-foreground)", opacity: 0.5 }} />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium" style={{ color: "var(--navy)" }}>
                        Prêt à générer votre CV
                      </p>
                      <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>
                        Remplissez le formulaire à gauche<br />
                        et cliquez sur "Générer mon CV"
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Analyse ── */}
        {tab === "analysis" && (
          <div className="p-6 max-w-4xl mx-auto space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {[
                { key: "market", title: "Analyse du marché", icon: <TrendingUp size={20} />, color: "#DBEAFE" },
                { key: "profile", title: "Optimisation profil", icon: <Users size={20} />, color: "#F0FDF4" },
                { key: "competition", title: "Se démarquer", icon: <Sparkles size={20} />, color: "#FEF9C3" },
                { key: "forecast", title: "Prévisions marché", icon: <BarChart2 size={20} />, color: "#F3E8FF" },
              ].map(card => (
                <div key={card.key} className="p-5 rounded-2xl border bg-white" style={{ borderColor: "var(--border)" }}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ background: card.color }}>
                        <span style={{ color: "var(--navy)" }}>{card.icon}</span>
                      </div>
                      <h4 className="font-semibold" style={{ color: "var(--navy)" }}>{card.title}</h4>
                    </div>
                    <button onClick={() => generateAnalysis(card.key)}
                      disabled={analysisLoading === card.key}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:opacity-80"
                      style={{ background: "var(--secondary)", color: "var(--navy)" }}>
                      {analysisLoading === card.key
                        ? <Loader2 size={12} className="animate-spin" />
                        : <RefreshCw size={12} />}
                      Générer
                    </button>
                  </div>
                  {analyses[card.key] ? (
                    <p className="text-sm leading-relaxed" style={{ color: "var(--foreground)" }}>
                      {analyses[card.key]}
                    </p>
                  ) : (
                    <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                      Cliquez sur "Générer" pour une analyse IA personnalisée.
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
