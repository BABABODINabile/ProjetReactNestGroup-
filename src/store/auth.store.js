import { create } from "zustand";

const API_URL = "http://localhost:3000"; // Ton URL NestJS

export const useAuthStore = create((set, get) => ({
  user: localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null,
  token: localStorage.getItem("token") || null,

  login: ({ user, token }) => {
    set({ user, token });
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
  },

  logout: () => {
    set({ user: null, token: null });
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },

  // ---- UPDATE USER (Appel Backend) ----
  updateUser: async (updates) => {
    const token = get().token;
    try {
      const response = await fetch(`${API_URL}/users/profile`, {
        method: 'PATCH', // Ou PUT selon ta route NestJS
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) throw new Error("Erreur lors de la mise à jour");

      const updatedUserFromApi = await response.json();

      // Mise à jour de Zustand et du LocalStorage avec la réponse propre du serveur
      set({ user: updatedUserFromApi });
      localStorage.setItem("user", JSON.stringify(updatedUserFromApi));
      
      return updatedUserFromApi;
    } catch (error) {
      console.error("Erreur UpdateUser:", error);
      throw error;
    }
  },

  // ---- UPDATE PASSWORD (Appel Backend) ----
  updatePassword: async (passwordData) => {
    const token = get().token;
    const response = await fetch(`${API_URL}/users/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(passwordData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Erreur mot de passe");
    }
    
    return true;
  }
}));