// src/components/CVTemplate.tsx
import React from 'react';

interface CVTemplateProps {
  prenom: string;
  nom: string;
  titre: string;
  email: string;
  telephone: string;
  ville: string;
  description: string;
  competences: string[];
  experience: string;
  formation: string[];
  langues: string[];
  photoUrl?: string;
  linkedin?: string;
  github?: string;
  twitter?: string;
}

export const CVTemplate: React.FC<CVTemplateProps> = ({
  prenom,
  nom,
  titre,
  email,
  telephone,
  ville,
  description,
  competences,
  experience,
  formation,
  langues,
  photoUrl,
  linkedin,
  github,
  twitter,
}) => {
  const fullName = `${prenom} ${nom}`;
  const avatarUrl = photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=random&size=128`;

  return (
    <div className="bg-gray-100 p-4 min-h-screen">
      <div className="max-w-5xl mx-auto border shadow-custom rounded-lg bg-white overflow-hidden">
        {/* Top content */}
        <div className="flex flex-wrap items-center rounded-t-lg bg-top-color px-4 sm:px-8 py-6">
          <div className="w-32 h-32 sm:w-40 sm:h-40 overflow-hidden rounded-full border-4 border-white/30 shadow-lg flex-shrink-0">
            <img 
              src={avatarUrl}
              alt={fullName}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-1 mt-4 sm:mt-0 sm:ml-6 text-center sm:text-left">
            <p className="font-poppins font-bold text-white text-2xl sm:text-4xl">
              {fullName}
            </p>
            <p className="text-white/90 text-base sm:text-lg font-medium">{titre}</p>
            <p className="text-white/60 text-sm mt-1">{ville}</p>
          </div>
        </div>

        {/* Main content */}
        <div className="p-4 sm:p-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Colonne gauche */}
            <div className="lg:w-1/3 space-y-6">
              {/* Contact */}
              <div>
                <h2 className="text-lg font-bold text-top-color">Contact</h2>
                <div className="border-2 w-16 border-top-color my-2"></div>

                <div className="space-y-2 text-sm">
                  {email && (
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                        <path fill="currentColor" d="M100.28 448H7.4V148.9h92.88zM53.79 108.1C24.09 108.1 0 83.5 0 53.8a53.79 53.79 0 0 1 107.58 0c0 29.7-24.1 54.3-53.79 54.3zM447.9 448h-92.68V302.4c0-34.7-.7-79.2-48.29-79.2-48.29 0-55.69 37.7-55.69 76.7V448h-92.78V148.9h89.08v40.8h1.3c12.4-23.5 42.69-48.3 87.88-48.3 94 0 111.28 61.9 111.28 142.3V448z"/>
                      </svg>
                      <span className="truncate">{email}</span>
                    </div>
                  )}

                  {telephone && (
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                        <path fill="currentColor" d="M164.9 24.6c-7.7-18.6-28-28.5-47.4-23.2l-88 24C12.1 30.2 0 46 0 64C0 311.4 200.6 512 448 512c18 0 33.8-12.1 38.6-29.5l24-88c5.3-19.4-4.6-39.7-23.2-47.4l-96-40c-16.3-6.8-35.2-2.1-46.3 11.6L304.7 368C234.3 334.7 177.3 277.7 144 207.3L193.3 167c13.7-11.2 18.4-30 11.6-46.3l-40-96z"/>
                      </svg>
                      <span>{telephone}</span>
                    </div>
                  )}

                  {ville && (
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
                        <path fill="currentColor" d="M172.268 501.67C26.97 291.031 0 269.413 0 192 0 85.961 85.961 0 192 0s192 85.961 192 192c0 77.413-26.97 99.031-172.268 309.67-9.535 13.774-29.93 13.773-39.464 0zM192 272c44.183 0 80-35.817 80-80s-35.817-80-80-80-80 35.817-80 80 35.817 80 80 80z"/>
                      </svg>
                      <span>{ville}</span>
                    </div>
                  )}

                  {linkedin && (
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                        <path fill="currentColor" d="M100.28 448H7.4V148.9h92.88zM53.79 108.1C24.09 108.1 0 83.5 0 53.8a53.79 53.79 0 0 1 107.58 0c0 29.7-24.1 54.3-53.79 54.3zM447.9 448h-92.68V302.4c0-34.7-.7-79.2-48.29-79.2-48.29 0-55.69 37.7-55.69 76.7V448h-92.78V148.9h89.08v40.8h1.3c12.4-23.5 42.69-48.3 87.88-48.3 94 0 111.28 61.9 111.28 142.3V448z"/>
                      </svg>
                      <a href={linkedin} target="_blank" className="text-blue-600 hover:underline truncate">LinkedIn</a>
                    </div>
                  )}

                  {github && (
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 496 512">
                        <path fill="currentColor" d="M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3.3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.6.3-6.2 2.3zm44.2-1.7c-2.9.7-4.9 2.6-4.6 4.9.3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-22.5-.3-44.1-68.7 14.9-83.1-33.5-83.1-33.5-11.2-28.5-27.5-36.1-27.5-36.1-22.5-15.4 1.7-15.1 1.7-15.1 24.9 1.7 38 25.6 38 25.6 22.1 37.9 58 26.9 72.2 20.5 2.3-16 8.6-26.9 15.7-33.1-55-6.2-112.8-27.5-112.8-122.3 0-27 9.6-49.1 25.4-66.4-2.6-6.3-11-31.5 2.4-65.6 0 0 20.7-6.6 67.8 25.3 19.7-5.5 40.8-8.2 61.8-8.3 21 0 42.1 2.8 61.8 8.3 47.1-31.9 67.8-25.3 67.8-25.3 13.4 34.1 5 59.3 2.4 65.6 15.8 17.3 25.4 39.4 25.4 66.4 0 94.9-57.8 116.1-112.8 122.3 8.9 7.7 16.8 22.8 16.8 45.9 0 33.1-.3 59.8-.3 67.9 0 6.5 4.5 14.4 17.3 12.1C426.2 457.8 496 362.9 496 252 496 113.3 383.5 8 244.8 8zM97.2 352.9c-1.3 1-1 3.3.7 5.2 1.6 1.6 3.9 2.3 5.2 1 1.3-1 1-3.3-.7-5.2-1.6-1.6-3.9-2.3-5.2-1zm-10.8-8.1c-.7 1.3.3 2.9 2.3 3.9 1.6 1 3.6.7 4.3-.7.7-1.3-.3-2.9-2.3-3.9-2-.6-3.6-.3-4.3.7zm32.4 35.6c-1.6 1.3-1 4.3 1.3 6.2 2.3 2.3 5.2 2.6 6.5 1 1.3-1.3.7-4.3-1.3-6.2-2.2-2.3-5.2-2.6-6.5-1zm-11.4-14.7c-1.6 1-1.6 3.6 0 5.9 1.6 2.3 4.3 3.3 5.6 2.3 1.6-1.3 1.6-3.9 0-6.2-1.4-2.3-4-3.3-5.6-2z"/>
                      </svg>
                      <a href={github} target="_blank" className="text-blue-600 hover:underline truncate">GitHub</a>
                    </div>
                  )}
                </div>
              </div>

              {/* Compétences */}
              {competences.length > 0 && (
                <div>
                  <h2 className="text-lg font-bold text-top-color">Compétences</h2>
                  <div className="border-2 w-16 border-top-color my-2"></div>

                  <div className="space-y-2">
                    {competences.map((skill, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <svg className="w-4 h-4 text-gray-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512">
                          <path fill="currentColor" d="M528.29 117.71L477.73 61.21C463.96 46.82 447.07 36.5 428.87 31.44L318.06 0.66C299.94 -3.77 280.06 -3.77 261.94 0.66L151.13 31.44C132.93 36.5 116.04 46.82 102.27 61.21L51.71 117.71C35.52 134.71 24.71 156.75 20.3 180.6L0.66 286.08C-3.77 304.2 -3.77 324.08 0.66 342.2L20.3 447.67C24.71 471.52 35.52 493.56 51.71 510.56L102.27 567.06C116.04 581.45 132.93 591.77 151.13 596.83L261.94 627.61C280.06 632.04 299.94 632.04 318.06 627.61L428.87 596.83C447.07 591.77 463.96 581.45 477.73 567.06L528.29 510.56C544.48 493.56 555.29 471.52 559.7 447.67L579.34 342.2C583.77 324.08 583.77 304.2 579.34 286.08L559.7 180.6C555.29 156.75 544.48 134.71 528.29 117.71ZM288.01 445.1C200.17 445.1 128.91 373.84 128.91 286C128.91 198.16 200.17 126.9 288.01 126.9C375.85 126.9 447.11 198.16 447.11 286C447.11 373.84 375.85 445.1 288.01 445.1Z"/>
                        </svg>
                        <span>{skill}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Formation */}
              {formation.length > 0 && (
                <div>
                  <h2 className="text-lg font-bold text-top-color">Formation</h2>
                  <div className="border-2 w-16 border-top-color my-2"></div>
                  <div className="space-y-3">
                    {formation.map((edu, index) => (
                      <div key={index}>
                        <p className="text-sm font-medium">{edu}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Langues */}
              {langues.length > 0 && (
                <div>
                  <h2 className="text-lg font-bold text-top-color">Langues</h2>
                  <div className="border-2 w-16 border-top-color my-2"></div>
                  <div className="space-y-1 text-sm">
                    {langues.map((lang, index) => (
                      <div key={index}>• {lang}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Colonne droite */}
            <div className="lg:w-2/3 space-y-6">
              {/* À propos */}
              <div>
                <h2 className="text-lg font-bold text-top-color">À propos</h2>
                <div className="border-2 w-16 border-top-color my-2"></div>
                <p className="text-sm leading-relaxed">{description}</p>
              </div>

              {/* Expérience */}
              {experience && (
                <div>
                  <h2 className="text-lg font-bold text-top-color">Expériences professionnelles</h2>
                  <div className="border-2 w-16 border-top-color my-2"></div>
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">{experience}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .bg-top-color { background: #1a1a2e; }
        .text-top-color { color: #1a1a2e; }
        .border-top-color { border-color: #1a1a2e; }
        .shadow-custom { box-shadow: 0 10px 30px -10px rgba(0,0,0,0.3); }
        .font-poppins { font-family: 'Poppins', sans-serif; }
      `}</style>
    </div>
  );
};