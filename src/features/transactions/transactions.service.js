import { useAuthStore } from "../../store/auth.store";
import { getCategories } from "../categories/categories.service";

const API_URL = "http://localhost:3000/transactions";

const apiRequest = async (endpoint, options = {}) => {
  const token = useAuthStore.getState().token;
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, { ...options, headers });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Erreur serveur");
  }

  if (response.status === 204 || response.headers.get("content-length") === "0") return null;
  return response.json();
};

// --- ROUTES RÉELLES ---

export async function getTransactions(opts = {}) {
  const { page = 1, rows = 10, filters = {} } = opts;
  
  // On transforme les filtres en Query Parameters pour NestJS
  const params = new URLSearchParams({
    page: page.toString(),
    limit: rows.toString(),
    ...filters // search, type, categoryId, etc.
  });

  // Appel au backend : GET /transactions?page=1&limit=10...
  const result = await apiRequest(`?${params.toString()}`);
  
  // NestJS retourne généralement { data: [], total: 100 }
  return result;
}

export const getTransactionById = (id) => apiRequest(`/${id}`);

export const addTransaction = (payload) => {
  // Nettoyage préventif pour éviter les erreurs de validation NestJS
  const { id, created_at, updated_at, ...cleanData } = payload;
  return apiRequest("", {
    method: "POST",
    body: JSON.stringify(cleanData),
  });
};

export const updateTransaction = (id, payload) => {
  // On enlève l'ID et les dates du corps (body) pour ne pas fâcher le ValidationPipe
  const { id: _, created_at, updated_at, ...cleanData } = payload;
  return apiRequest(`/${id}`, {
    method: "PATCH",
    body: JSON.stringify(cleanData),
  });
};

export const deleteTransaction = (id) => apiRequest(`/${id}`, {
  method: "DELETE",
});