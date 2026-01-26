import { useEffect, useState } from "react";
import { getUsers, addUser, updateUser } from "../../features/users/users.service";
import UsersTable from "../../features/users/UsersTable";
import UserForm from "../../features/users/UserForm";
import Modal from "../../components/Modal";
import { FaPlus, FaUsers } from "react-icons/fa";
import { toast } from "react-toastify";



export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [editing, setEditing] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const loadData = async () => {
    try {
      const data = await getUsers();
      setUsers(data || []);
    } catch (error) {
      toast.error(`Impossible de charger les utilisateurs: ${error.message}`, { position: "top-center" });
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAdd = () => {
    setEditing(null);
    setShowModal(true);
  };

  const openEdit = (u) => {
  const mapped = {
    ...u,
    firstname: u.firstname || "",
    name: u.name || "",
    email: u.email || "",
    // FORCE l'ID en nombre pour le DTO
    role_id: u.role ? Number(u.role.id) : "", 
    password: "", // On laisse vide pour ne pas modifier le mdp par erreur
  };
  setEditing(mapped);
  setShowModal(true);
};

    const handleSubmit = async (values) => {
    try {
      // 1. On extrait 'role' et les champs techniques
      const { id, created_at, updated_at, role, ...rest } = values;

      // 2. On prépare le payload final
      const payload = {
        ...rest,
        // On s'assure d'envoyer role_id (le nombre) attendu par le DTO
        // On vérifie si role est un objet (cas de l'édition) ou si role_id est déjà présent
        role_id: role?.id || values.role_id 
      };

      if (editing && editing.id) {
        await updateUser(editing.id, payload);
      } else {
        await addUser(payload);
      }

      setShowModal(false);
      loadData();
      toast.success(editing ? "Utilisateur modifié !" : "Utilisateur ajouté !", { position: "top-center" });
    } catch (error) {
      // Le message d'erreur de NestJS sera maintenant beaucoup plus clair
      toast.error(`Erreur: ${error.message}`, { position: "top-center" });
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8 pb-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg hover:scale-105 transition-transform ">
            <FaUsers className="text-white text-2xl" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">Utilisateurs</h1>
            <p className="text-sm text-gray-500 mt-1">Gestion des utilisateurs et rôles</p>
          </div>
        </div>
        <button
          onClick={openAdd}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold flex items-center gap-2 rounded-lg shadow-md hover:shadow-lg hover:from-blue-700 hover:to-blue-800 transition-all active:scale-95"
        >
          <FaPlus className="inline-flex" /> Nouvel utilisateur
        </button>
      </div>

      <UsersTable data={users} onEdit={openEdit} refresh={loadData} />

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? "Modifier utilisateur" : "Ajouter utilisateur"}>
        <UserForm initialValues={editing || { firstname: "", name: "", email: "", password: "", role: "" }} onSubmit={handleSubmit} onClose={() => setShowModal(false)} />
      </Modal>
    </div>
  );
}
