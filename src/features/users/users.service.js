// users.service.js
import { useAuthStore } from "../../store/auth.store";


const API_URL = "http://localhost:3000/users";

const apiRequest = async (endpoint, options = {}) => {
  const token = useAuthStore.getState().token;

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, { ...options, headers });

  if (!response.ok) {
    // Si 500, on récupère le message exact du serveur NestJS
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Erreur serveur");
  }

  // Très important pour la suppression (204 No Content)
  if (response.status === 204 || response.headers.get("content-length") === "0") {
    return null;
  }

  return response.json();
};

export const getUsers = () => apiRequest("");
export const addUser = (data) => apiRequest("", { method: "POST", body: JSON.stringify(data) });
export const updateUser = (id, data) => apiRequest(`/${id}`, { method: "PATCH", body: JSON.stringify(data) });
export const deleteUser = (id) => apiRequest(`/${id}`, { method: "DELETE" });
