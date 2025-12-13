// transactions.service.js
// Mock service for transactions. Designed to be replaced by a real API later.
import { getCategories } from "../categories/categories.service";

let transactions = [
  {
    id: 1,
    type: "Dépense",
    categoryId: 1,
    amount: 49.9,
    description: "Achat de fournitures",
    date: new Date().toISOString(),
    attachment: null,
    createdBy: { id: 1, fullname: "Super Admin", email: "admin@test.com" },
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    type: "Recette",
    categoryId: 2,
    amount: 150.0,
    description: "Vente produit A",
    date: new Date().toISOString(),
    attachment: null,
    createdBy: { id: 2, fullname: "Utilisateur", email: "user@test.com" },
    createdAt: new Date().toISOString(),
  },
];

// Utility: apply simple filters and pagination
function applyFilters(list, options = {}) {
  const {
    search,
    type,
    categoryId,
    dateFrom,
    dateTo,
    minAmount,
    maxAmount,
    createdById,
  } = options;

  return list.filter((t) => {
    if (type && t.type !== type) return false;
    if (categoryId && Number(t.categoryId) !== Number(categoryId)) return false;
    if (createdById && Number(t.createdBy?.id) !== Number(createdById)) return false;
    if (dateFrom && new Date(t.date) < new Date(dateFrom)) return false;
    if (dateTo && new Date(t.date) > new Date(dateTo)) return false;
    if (minAmount && Number(t.amount) < Number(minAmount)) return false;
    if (maxAmount && Number(t.amount) > Number(maxAmount)) return false;
    if (search) {
      const s = String(search).toLowerCase();
      const inDesc = String(t.description || "").toLowerCase().includes(s);
      const inUser = String(t.createdBy?.fullname || "").toLowerCase().includes(s);
      return inDesc || inUser;
    }
    return true;
  });
}

export async function getTransactions(opts = {}) {
  // opts: { page = 1, rows = 10, filters: {...}, sortField, sortOrder }
  const { page = 1, rows = 10, filters = {}, sortField, sortOrder } = opts;

  // Clone to avoid accidental mutation
  let list = [...transactions];

  // Apply filters
  list = applyFilters(list, filters);

  // Sorting (basic)
  if (sortField) {
    list.sort((a, b) => {
      const av = a[sortField];
      const bv = b[sortField];
      if (av == null) return 1;
      if (bv == null) return -1;
      if (typeof av === "number") return sortOrder === -1 ? bv - av : av - bv;
      return sortOrder === -1
        ? String(bv).localeCompare(String(av))
        : String(av).localeCompare(String(bv));
    });
  }

  const total = list.length;
  const start = (page - 1) * rows;
  const data = list.slice(start, start + rows);

  // Resolve category names for convenience (non authoritative, for UI only)
  const cats = await getCategories();
  const withCategory = data.map((t) => ({
    ...t,
    category: cats.find((c) => Number(c.id) === Number(t.categoryId)) || null,
  }));

  return Promise.resolve({ data: withCategory, total });
}

export function getTransactionById(id) {
  const t = transactions.find((x) => Number(x.id) === Number(id));
  return Promise.resolve(t ? { ...t } : null);
}

export function addTransaction(payload) {
  const newItem = { id: Date.now(), createdAt: new Date().toISOString(), ...payload };
  transactions.unshift(newItem);
  return Promise.resolve(newItem);
}

export function updateTransaction(id, payload) {
  transactions = transactions.map((t) => (Number(t.id) === Number(id) ? { ...t, ...payload } : t));
  return Promise.resolve(true);
}

export function deleteTransaction(id) {
  transactions = transactions.filter((t) => Number(t.id) !== Number(id));
  return Promise.resolve(true);
}
