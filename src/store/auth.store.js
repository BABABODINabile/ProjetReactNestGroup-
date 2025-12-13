import { create } from "zustand";

// Récupérer dès le début le token dans localStorage
const storedToken = localStorage.getItem("token");
const storedUser = localStorage.getItem("user");

export const useAuthStore = create((set) => ({
  user: storedUser ? JSON.parse(storedUser) : null,
  token: storedToken || null,

  // ---- LOGIN ----
  login: ({ user, token }) => {
    // 1. Mise à jour dans Zustand
    set({ user, token });

    // 2. Persistance (important pour recharger la page)
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
  },

  // ---- LOGOUT ----
  logout: () => {
    // 1. Zustand reset
    set({ user: null, token: null });

    // 2. Suppression du localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },

  // ---- UPDATE USER (profile update) ----
  updateUser: (updates) => {
    set((state) => {
      const updatedUser = { ...state.user, ...updates };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      return { user: updatedUser };
    });
  },
}));
