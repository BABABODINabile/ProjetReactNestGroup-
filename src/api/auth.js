// src/api/auth.js

const API_BASE_URL = 'http://localhost:3000'; 
const AUTH_URL = `${API_BASE_URL}/auth/login`;

/**
 * Envoie les identifiants de connexion au backend NestJS via fetch.
 * @param {object} credentials - { email, password }
 * @returns {Promise<{user: object, token: string}>} - Les données utilisateur et le JWT.
 */
export const loginAPI = async (credentials) => {
  try {
    const response = await fetch(AUTH_URL, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    // 1. Gérer les erreurs HTTP (4xx et 5xx)
    if (!response.ok) {
      // Tenter de lire le message d'erreur du body si disponible
      const errorData = await response.json().catch(() => ({ message: 'Erreur inconnue de connexion' }));
      
      // Lancer une erreur pour être capturée dans le bloc catch du handleSubmit
      throw new Error(errorData.message || 'Identifiants incorrects');
    }

    // 2. Traiter la réponse réussie (statut 200)
    const data = await response.json(); 
    
    // 3. Adapter le format de la réponse à votre store Zustand { user, token }
    // NOTE: Votre API NestJS devrait idéalement retourner { access_token: string, user: object }
    return {
      token: data.access_token, // Assurez-vous que c'est le champ que votre API renvoie
      user: data.user,
    };
    
  } catch (error) {
    // Propage l'erreur de connexion (problème réseau ou erreur 4xx/5xx)
    console.error("Échec de la connexion à l'API:", error);
    // On relance l'erreur pour la capturer dans le handleSubmit du composant
    throw error; 
  }
};