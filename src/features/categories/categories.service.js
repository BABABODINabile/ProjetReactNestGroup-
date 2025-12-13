let categories = [
  { id: 1, nom: "Fournitures", type: "Dépense" },
  { id: 2, nom: "Ventes", type: "Recette" },
];

export function getCategories() {
  return Promise.resolve(categories);
}

export function addCategory(data) {
  const newItem = { id: Date.now(), ...data };
  categories.push(newItem);
  return Promise.resolve(newItem);
}

export function updateCategory(id, data) {
  categories = categories.map((c) => (c.id === id ? { ...c, ...data } : c));
  return Promise.resolve(true);
}

export function deleteCategory(id) {
  categories = categories.filter((c) => c.id !== id);
  return Promise.resolve(true);
}
