import { useEffect, useState, useCallback } from "react";
import Modal from "../../components/Modal";
import TransactionForm from "../../features/transactions/TransactionForm";
import TransactionsTable from "../../features/transactions/TransactionsTable";
import { getTransactions, addTransaction, updateTransaction, deleteTransaction, getTransactionById } from "../../features/transactions/transactions.service";
import { toast } from "react-toastify";
import { useAuthStore } from "../../store/auth.store";
import { FaPlus, FaExchangeAlt, FaDownload } from "react-icons/fa";
import { generateReceiptPDF } from "../../features/transactions/receiptGenerator";


export default function TransactionsPageImpl() {
  const [transactions, setTransactions] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const pageState = useState(1);
  const page = pageState[0];
  const [rows] = useState(10);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [receiptPreview, setReceiptPreview] = useState(null);

  const user = useAuthStore((s) => s.user);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getTransactions({ page, rows, filters: {} });
      setTransactions(res.data || []);
      setTotal(res.total || 0);
    } catch (err) {
      console.error(err);
      toast.error("Impossible de charger les transactions");
    }
    setLoading(false);
  }, [page, rows]);

  useEffect(() => {
    // Avoid synchronous setState within effect body by deferring the fetch
    const t = setTimeout(() => {
      fetchData();
    }, 0);
    return () => clearTimeout(t);
  }, [fetchData]);

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

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const payload = {
        type: values.type,
        categoryId: values.categoryId,
        amount: Number(values.amount),
        description: values.description,
        date: values.date,
        attachment: values.attachment || null,
        createdBy: editing?.createdBy || { id: user?.id ?? 0, fullname: user?.fullname ?? user?.email ?? "Inconnu", email: user?.email ?? "" },
      };

      if (editing) {
        await updateTransaction(editing.id, payload);
        toast.success("Transaction mise à jour");
      } else {
        await addTransaction(payload);
        toast.success("Transaction enregistrée");
      }

      fetchData();
      setIsModalOpen(false);
      setEditing(null);
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de l'enregistrement");
    }
    setSubmitting(false);
  };

  const handleDelete = async (id) => {
    await deleteTransaction(id);
  };

  const openView = async (row) => {
    const full = await getTransactionById(row.id);
    setReceiptPreview(full);
  };

  const closeView = () => setReceiptPreview(null);

  const downloadReceipt = (transaction) => {
    try {
      generateReceiptPDF(transaction, true);
      toast.success("Reçu téléchargé avec succès !");
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors du téléchargement du reçu");
    }
  };


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg hover:scale-105 transition-transform ">
                      <FaExchangeAlt className="text-white text-2xl" />
                  </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">Transactions</h1>
                  <p className="text-sm text-gray-500">Liste des dépenses et recettes avec recherche, filtres et export.</p>
            </div>
          </div>

        <div className="flex items-center gap-4">
          <button onClick={openCreate} className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold flex items-center gap-2 rounded-lg shadow-md hover:shadow-lg hover:from-blue-700 hover:to-blue-800 transition-all active:scale-95">
            <FaPlus />
            Nouvelle transaction
          </button>
        </div>
      </div>

      <TransactionsTable
        data={transactions}
        loading={loading}
        onEdit={openEdit}
        onDelete={handleDelete}
        onView={openView}
        refresh={fetchData}
        total={total}
      />

      {/* Create / Edit Modal */}
      <Modal isOpen={isModalOpen} onClose={handleClose} title={editing ? "Modifier la transaction" : "Nouvelle transaction"} maxWidthClass="max-w-3xl" >
        <div>
          <TransactionForm
            initialValues={editing || { type: "Dépense", categoryId: "", amount: "", description: "", date: new Date().toISOString().slice(0,10), attachment: null }}
            onSubmit={handleSubmit}
            onClose={handleClose}
          />
        </div>
      </Modal>

      {/* Receipt Preview Modal */}
      <Modal isOpen={!!receiptPreview} onClose={closeView} title={receiptPreview ? `Reçu #${receiptPreview.id}` : "Reçu"} >
        {receiptPreview && (
          <div className="space-y-4 w-full">
            {/* Aperçu du reçu stylisé */}
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200 max-h-1/2 overflow-y-auto">
              {/* Entête */}
              <div className="text-center mb-4 pb-4 border-b-2 border-blue-300">
                <h2 className="text-2xl font-bold text-blue-700">ENTREPRISE XYZ</h2>
                <p className="text-sm text-gray-600">Reçu officiel de transaction</p>
                <p className="text-xs text-gray-500 mt-1">Gestion des Dépenses & Recettes</p>
              </div>

              {/* Numéro et date */}
              <div className="flex justify-between mb-4">
                <div>
                  <p className="text-xs text-gray-600">Reçu N°</p>
                  <p className="font-bold text-lg text-blue-700">RC-{String(receiptPreview.id).padStart(6, "0")}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-600">Date</p>
                  <p className="font-semibold text-sm">{new Date(receiptPreview.date).toLocaleDateString("fr-FR")}</p>
                </div>
              </div>

              {/* Badge Type */}
              <div className="mb-4">
                <span className={`inline-block px-4 py-1 rounded-full text-white font-bold text-sm ${receiptPreview.type === "Dépense" ? "bg-red-500" : "bg-green-500"}`}>
                  {receiptPreview.type === "Dépense" ? "💰 DÉPENSE" : "📈 RECETTE"}
                </span>
              </div>

              {/* Détails */}
              <div className="space-y-3 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-700 font-semibold">Catégorie :</span>
                  <span className="text-gray-900">{receiptPreview.category?.nom ?? receiptPreview.categoryId}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-gray-700 font-semibold">Montant :</span>
                  <span className="text-lg font-bold text-blue-700">{(receiptPreview.amount || 0).toLocaleString("fr-FR")} FCFA</span>
                </div>
                {receiptPreview.description && (
                  <div className="flex justify-between">
                    <span className="text-gray-700 font-semibold">Description :</span>
                    <span className="text-gray-900 text-sm">{receiptPreview.description}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-700 font-semibold">Enregistré par :</span>
                  <span className="text-gray-900">{receiptPreview.createdBy?.fullname || "Système"}</span>
                </div>
              </div>

              {/* Ligne signature */}
              <div className="border-t-2 border-blue-300 pt-4 mt-4">
                <p className="text-center text-xs text-gray-500">Signature</p>
                <div className="mt-2 h-8"></div>
              </div>

              {/* Pied de page */}
              <div className="text-center pt-2 border-t text-xs text-gray-600">
                <p>Document généré automatiquement</p>
                <p>Système de Gestion Financière</p>
              </div>
            </div>

            {/* Boutons d'action */}
            <div className="flex gap-3 justify-end">
              <button onClick={closeView} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                Fermer
              </button>
              <button onClick={() => downloadReceipt(receiptPreview)} className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:shadow-lg transition-shadow flex items-center gap-2">
                <FaDownload size={16} />
                Télécharger PDF
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
