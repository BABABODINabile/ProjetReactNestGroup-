import { useEffect, useState, useCallback } from "react";
import Modal from "../../components/Modal";
import TransactionForm from "../../features/transactions/TransactionForm";
import TransactionsTable from "../../features/transactions/TransactionsTable";
import { 
  getTransactions, 
  addTransaction, 
  updateTransaction, 
  deleteTransaction, 
  getTransactionById 
} from "../../features/transactions/transactions.service";
import { toast } from "react-toastify";
import { useAuthStore } from "../../store/auth.store";
import { FaPlus, FaExchangeAlt, FaDownload } from "react-icons/fa";
import { generateReceiptPDF } from "../../features/transactions/receiptGenerator";

export default function TransactionsPage() {
  // --- ÉTATS ---
  const [transactions, setTransactions] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [rows] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [receiptPreview, setReceiptPreview] = useState(null);

  const user = useAuthStore((s) => s.user);

  // --- ACTIONS DE CHARGEMENT ---
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Appel au backend avec pagination
      const res = await getTransactions({ page, rows, filters: {} });
      setTransactions(res.data || []);
      setTotal(res.total || 0);
    } catch (err) {
      toast.error("Impossible de charger les transactions");
    } finally {
      setLoading(false);
    }
  }, [page, rows]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- HANDLERS MODAL ---
  const openCreate = () => { 
    setEditing(null); 
    setIsModalOpen(true); 
  };

  const openEdit = (tx) => { 
    setEditing(tx); 
    setIsModalOpen(true); 
  };

  const handleClose = () => { 
    setIsModalOpen(false); 
    setEditing(null); 
  };

  // --- CRUD OPERATIONS ---
  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      // CORRECTION: Mapping des noms de champs pour correspondre au backend NestJS
      const payload = {
        type: values.type,
        category_id: Number(values.categoryId || values.category_id), // Supporte les deux formats
        amount: Number(values.amount),
        description: values.description,
        transaction_date: values.date || values.transaction_date, // Supporte les deux formats
        
      };

      if (editing) {
        await updateTransaction(editing.id, payload);
        toast.success("Transaction mise à jour");
      } else {
        await addTransaction(payload);
        toast.success("Transaction enregistrée");
      }
      
      fetchData();
      handleClose();
    } catch (err) {
      toast.error(err.message || "Erreur lors de l'enregistrement");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteTransaction(id);
      fetchData();
    } catch (err) {
      toast.error("Erreur lors de la suppression");
    }
  };

  // --- GESTION DU REÇU (PDF & VIEW) ---
  const openView = async (row) => {
    try {
      const full = await getTransactionById(row.id);
      setReceiptPreview(full);
    } catch (err) {
      toast.error("Erreur lors de la récupération des détails");
    }
  };

  const closeView = () => setReceiptPreview(null);

  const downloadReceipt = (transaction) => {
    try {
      generateReceiptPDF(transaction, true);
      toast.success("Reçu téléchargé avec succès !", { position: "top-center" });
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors du téléchargement du reçu");
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER SECTION */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg hover:scale-105 transition-transform">
            <FaExchangeAlt className="text-white text-2xl" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
              Transactions
            </h1>
            <p className="text-sm text-gray-500">
              Liste des dépenses et recettes avec recherche, filtres et export.
            </p>
          </div>
        </div>

        <button 
          onClick={openCreate} 
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold flex items-center gap-2 rounded-lg shadow-md hover:shadow-lg hover:from-blue-700 hover:to-blue-800 transition-all active:scale-95"
        >
          <FaPlus />
          Nouvelle transaction
        </button>
      </div>

      {/* DATA TABLE */}
      <TransactionsTable
        data={transactions}
        loading={loading}
        onEdit={openEdit}
        onDelete={handleDelete}
        onView={openView}
        refresh={fetchData}
        total={total}
        onPageChange={(newPage) => setPage(newPage)}
        currentPage={page}
      />

      {/* FORM MODAL (Create/Edit) */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={handleClose} 
        title={editing ? "Modifier la transaction" : "Nouvelle transaction"} 
        maxWidthClass="max-w-3xl"
      >
        <TransactionForm
          initialValues={editing || { 
            type: "Dépense", 
            categoryId: "", 
            amount: "", 
            description: "", 
            date: new Date().toISOString().slice(0, 10), 
            attachment: null 
          }}
          onSubmit={handleSubmit}
          onClose={handleClose}
        />
      </Modal>

      {/* RECEIPT PREVIEW MODAL */}
      <Modal 
        isOpen={!!receiptPreview} 
        onClose={closeView} 
        title={receiptPreview ? `Reçu #${receiptPreview.id}` : "Reçu"}
      >
        {receiptPreview && (
          <div className="space-y-4 w-full">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
              <div className="text-center mb-4 pb-4 border-b-2 border-blue-300">
                <h2 className="text-2xl font-bold text-blue-700 uppercase">Entreprise XYZ</h2>
                <p className="text-sm text-gray-600 italic">Reçu officiel de transaction</p>
              </div>

              <div className="flex justify-between mb-4 text-sm">
                <div>
                  <p className="text-gray-600">Reçu N°</p>
                  <p className="font-bold text-blue-700 text-lg">RC-{String(receiptPreview.id).padStart(6, "0")}</p>
                </div>
                <div className="text-right">
                  <p className="text-gray-600">Date</p>
                  <p className="font-semibold">
                    {new Date(receiptPreview.transaction_date || receiptPreview.date).toLocaleDateString("fr-FR")}
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <span className={`px-4 py-1 rounded-full text-white font-bold text-xs uppercase ${
                  receiptPreview.type === "Dépense" ? "bg-red-500" : "bg-green-600"
                }`}>
                  {receiptPreview.type === "Dépense" ? "💰 Dépense" : "📈 Recette"}
                </span>
              </div>

              <div className="space-y-3 bg-white/50 p-4 rounded-md border border-blue-100">
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Catégorie :</span>
                  <span className="text-gray-900 font-semibold">{receiptPreview.category?.name || "Non classée"}</span>
                </div>
                <div className="flex justify-between border-t border-blue-100 pt-2">
                  <span className="text-gray-600 font-medium">Montant :</span>
                  <span className="text-xl font-black text-blue-800">
                    {(receiptPreview.amount || 0).toLocaleString("fr-FR")} FCFA
                  </span>
                </div>
                {receiptPreview.description && (
                  <div className="pt-2 border-t border-blue-100">
                    <p className="text-gray-600 text-xs font-medium mb-1">Description :</p>
                    <p className="text-gray-800 text-sm leading-relaxed bg-white/30 p-2 rounded italic">
                      {receiptPreview.description}
                    </p>
                  </div>
                )}
                <div className="flex justify-between border-t border-blue-100 pt-2 text-xs">
                  <span className="text-gray-500 italic">Enregistré par :</span>
                  <span className="text-gray-700 font-medium">{receiptPreview.user?.firstname + " " + receiptPreview.user?.name || "Administrateur"}</span>
                </div>
              </div>

              <div className="text-center pt-6 text-[10px] text-gray-400">
                <p>Document généré électroniquement • Système de Gestion Financière</p>
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <button onClick={closeView} className="px-5 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                Fermer
              </button>
              <button 
                onClick={() => downloadReceipt(receiptPreview)} 
                className="px-5 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-md"
              >
                <FaDownload size={14} />
                Télécharger PDF
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}