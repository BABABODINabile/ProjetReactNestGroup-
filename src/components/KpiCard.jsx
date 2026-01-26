// src/components/KpiCard.jsx
import React from 'react';

/**
 * Composant réutilisable pour afficher un Indicateur Clé de Performance (KPI).
 * * @param {string} title - Le titre de la carte (ex: "Élèves inscrits").
 * @param {string|number} value - La valeur principale à afficher (ex: 450).
 * @param {string} color - Classe Tailwind pour la couleur de fond ou de l'icône (ex: 'bg-indigo-500').
 * @param {React.ReactNode} icon - Une icône à afficher à côté de la valeur (ex: <FaUsers />).
 */
const KpiCard = ({ title, value, color = 'bg-gray-400', icon: IconComponent}) => {
  
  // Utilise une couleur de fond légèrement plus claire pour le conteneur principal
  const cardBgColor = `bg-white`; 
  
  return (
    <div className={`p-5 rounded-xl shadow-lg border border-gray-100 ${cardBgColor} transition-transform transform hover:scale-[1.02]`}>
      
      {/* 1. Zone d'en-tête (Titre et éventuellement l'icône colorée) */}
      <div className="flex items-center justify-between mb-4">
        
        {/* Titre */}
        <h3 className="text-sm font-semibold uppercase text-gray-500 tracking-wider">
          {title}
        </h3>
        
        {/* Icône si fournie */}
        {IconComponent && (
          <div className={`p-2 rounded-full text-white ${color}`}>
            <IconComponent className="h-5 w-5" />
          </div>
        )}
      </div>

      {/* 2. Zone de la Valeur (Le KPI principal) */}
      <div className="flex items-end">
        <p className="text-4xl font-bold text-gray-900">
          {value}
        </p>
        
        {/* Vous pourriez ajouter ici un indicateur de changement (+10% ce mois-ci) */}
      </div>
    </div>
  );
};

export default KpiCard;