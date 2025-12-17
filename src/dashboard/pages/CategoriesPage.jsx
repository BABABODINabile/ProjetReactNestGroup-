import { useEffect, useState } from "react";
import { getCategories, addCategory, updateCategory } from "../../features/categories/categories.service";
import CategoriesTable from "../../features/categories/CategoriesTable";
import CategoryForm from "../../features/categories/CategoryForm";
import Modal from "../../components/Modal";
import { FaPlus, FaFolderOpen } from "react-icons/fa";

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [editing, setEditing] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const loadData = async () => {
    const data = await getCategories();
    setCategories(data);
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAdd = () => {
    setEditing(null);
    setShowModal(true);
  };

  const openEdit = (cat) => {
    setEditing(cat);
    setShowModal(true);
  };

  const handleSubmit = async (values) => {
  try {
    if (editing) {
      await updateCategory(editing.id, values);
    } else {
      await addCategory(values);
    }
    setShowModal(false);
    loadData(); // Rafraîchit la table
  } catch (error) {
    // Ici tu gères l'erreur 403 (Si le rôle n'est pas DIRECTEUR)
    alert(`Erreur: ${error.message}`);
  }
};

  return (
    <div>
      <div className="flex justify-between items-center mb-8 pb-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg hover:scale-105 transition-transform ">
            <FaFolderOpen className="text-white text-2xl" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
              Catégories
            </h1>
            <p className="text-sm text-gray-500 mt-1">Gestion des catégories de dépenses et recettes</p>
          </div>
        </div>
        <button
          onClick={openAdd}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold flex items-center gap-2 rounded-lg shadow-md hover:shadow-lg hover:from-blue-700 hover:to-blue-800 transition-all active:scale-95"
        >
          <FaPlus className="inline-flex" /> Nouvelle catégorie
        </button>
      </div>

      <CategoriesTable data={categories} onEdit={openEdit} refresh={loadData} />

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editing ? "Modifier catégorie" : "Ajouter catégorie"}
      >
      <CategoryForm
          initialValues={editing || { name: "", type: "Dépense" }}
          onSubmit={handleSubmit}
          onClose={() => setShowModal(false)}
      />
      </Modal>
    </div>
  );
}