import React, { useRef, useState, useMemo, useEffect, useCallback } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Toolbar } from "primereact/toolbar";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import { Calendar } from "primereact/calendar";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import { FaEye, FaPencilAlt, FaTrashAlt, FaFilePdf, FaFileDownload, FaUndo } from "react-icons/fa";
import { getCategories } from "../categories/categories.service";
import { generateReceiptPDF, generateTransactionListPDF } from "./receiptGenerator";

export default function TransactionsTable({ data = [], loading = false, onEdit, onDelete, onView, refresh }) {
  const dt = useRef(null);
  const [globalFilter, setGlobalFilter] = useState("");
  const [filterType, setFilterType] = useState(null);
  const [filterCategory, setFilterCategory] = useState(null);
  const [dateRange, setDateRange] = useState(null);
  const [minAmount, setMinAmount] = useState(null);
  const [maxAmount, setMaxAmount] = useState(null);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    let mounted = true;
    getCategories().then((c) => mounted && setCategories(c || []));
    return () => (mounted = false);
  }, []);

  const TYPE_OPTIONS = [
    { label: "Tous types", value: null },
    { label: "Dépense", value: "Dépense" },
    { label: "Recette", value: "Recette" },
  ];

  const CATEGORY_OPTIONS = useMemo(() => [{ label: "Toutes catégories", value: null }, ...categories.map((c) => ({ label: c.nom, value: c.id }))], [categories]);

  // Compute filtered data locally so the DataTable shows only matching rows
  const filteredData = useMemo(() => {
    if (!data || !data.length) return [];

    const gf = (globalFilter || "").toString().trim().toLowerCase();
    const hasGlobal = gf.length > 0;

    const startDate = Array.isArray(dateRange) && dateRange[0] ? new Date(dateRange[0]).setHours(0,0,0,0) : null;
    const endDate = Array.isArray(dateRange) && dateRange[1] ? new Date(dateRange[1]).setHours(23,59,59,999) : null;

    return data.filter((row) => {
      // Type filter
      if (filterType && row.type !== filterType) return false;

      // Category filter (category id or categoryId)
      if (filterCategory) {
        const cid = row.category?.id ?? row.categoryId ?? null;
        if (cid !== filterCategory) return false;
      }

      // Amount range
      const amt = Number(row.amount || 0);
      if (minAmount != null && !Number.isNaN(minAmount) && amt < Number(minAmount)) return false;
      if (maxAmount != null && !Number.isNaN(maxAmount) && amt > Number(maxAmount)) return false;

      // Date range
      if (startDate || endDate) {
        const d = row.date ? new Date(row.date).getTime() : null;
        if (d == null) return false;
        if (startDate && d < startDate) return false;
        if (endDate && d > endDate) return false;
      }

      // Global text search across several fields
      if (hasGlobal) {
        const fieldsToSearch = [
          row.description || "",
          row.type || "",
          row.createdBy?.fullname || "",
          (row.category && row.category.nom) || row.categoryId || "",
          String(row.id || "")
        ];
        const hay = fieldsToSearch.join(" ").toLowerCase();
        if (!hay.includes(gf)) return false;
      }

      return true;
    });
  }, [data, globalFilter, filterType, filterCategory, dateRange, minAmount, maxAmount]);

  const exportCsv = useCallback(() => dt.current?.exportCSV(), []);

  const exportPdf = useCallback(() => {
    try {
      generateTransactionListPDF(data, "transactions.pdf");
    } catch (err) {
      console.error(err);
      Swal.fire("Erreur", "L'export PDF a échoué.", "error");
    }
  }, [data]);

  const exportReceipt = useCallback((transaction) => {
    try {
      generateReceiptPDF(transaction, true);
    } catch (err) {
      console.error(err);
      Swal.fire("Erreur", "La génération du reçu a échoué.", "error");
    }
  }, []);

  const clearFilters = useCallback(() => {
    setGlobalFilter("");
    setFilterType(null);
    setFilterCategory(null);
    setDateRange(null);
    setMinAmount(null);
    setMaxAmount(null);
    toast.info("Filtres réinitialisés", { autoClose: 1500,position: "top-center"});
  }, []);

  const deleteRow = useCallback(async (row) => {
    const r = await Swal.fire({
      title: `Supprimer la transaction ${row.id} ?`,
      text: "Cette action est irréversible.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Oui, supprimer",
      cancelButtonText: "Annuler",
      confirmButtonColor: "#d33",
    });
    if (r.isConfirmed) {
      try {
        await onDelete(row.id);
        refresh();
        Swal.fire("Supprimé !", `Transaction ${row.id} supprimée.`, "success");
      } catch (err) {
        console.error(err);
        Swal.fire("Erreur", "Impossible de supprimer.", "error");
      }
    }
  }, [onDelete, refresh]);

  const actionBody = useCallback((row) => (
    <div className="flex items-center gap-2 ">
        <Button 
          icon={<FaEye />} 
          className="w-10 h-10 flex items-center justify-center rounded bg-white text-yellow-500 border border-yellow-500 hover:bg-yellow-500 hover:text-white transition-colors shadow-none"
          onClick={() => onView(row)}   
          tooltip="Voir" 
          />
        <Button 
          icon={<FaPencilAlt/>}
          className="w-10 h-10 flex items-center justify-center rounded bg-white text-blue-600 border border-blue-600 hover:bg-blue-700 hover:text-white transition-colors shadow-none"
          onClick={() => onEdit(row)}
          aria-label={`Modifier ${row.nom}`}
          tooltip="Modifier"
        />
        <Button
          icon={<FaTrashAlt />}
          className="w-10 h-10 flex items-center justify-center rounded bg-white text-red-500 border border-red-500 hover:bg-red-500 hover:text-white transition-colors shadow-none"
          onClick={() => deleteRow(row.id, row.nom)} // Passage du nom pour l'UX
          aria-label={`Supprimer ${row.nom}`}
          tooltip="Supprimer"
        />
        <Button  
          icon={<FaFilePdf />} tooltip="Reçu PDF"
          className="w-10 h-10 flex items-center justify-center rounded bg-white text-red-700 border border-red-700 hover:bg-red-700 hover:text-white transition-colors shadow-none"
          onClick={() => exportReceipt(row)} 
        />
    </div>
  ), [onEdit, onView, deleteRow, exportReceipt]);

  const typeBody = useCallback((row) => {
    const cfg = row.type === "Recette" ? { bg: "bg-green-100", text: "text-green-700", sign: "+" } : { bg: "bg-red-100", text: "text-red-700", sign: "-" };
    return <span className={`px-3 py-1 rounded-full text-sm font-semibold ${cfg.bg} ${cfg.text}`}>{cfg.sign} {row.type}</span>;
  }, []);

  const amountBody = useCallback((row) => (
    <div className="font-mono">{(row.amount || 0).toFixed(2)} €</div>
  ), []);

  const attachmentBody = useCallback((row) => (
    row.attachment ? (
      <a href={row.attachment.dataUrl} target="_blank" rel="noreferrer" className="text-blue-600 underline text-sm">Voir</a>
    ) : (
      <span className="text-xs text-gray-500">—</span>
    )
  ), []);

  const header = (
    <Toolbar className="bg-gradient-to-r from-blue-50 to-blue-100 border-b-2 border-blue-200 rounded-t-lg p-4"
      left={() => (
        <div className="flex items-center gap-3">
          <Button 
            label="CSV" 
            icon={<FaFileDownload 
            className="mr-2" />} 
            className="bg-teal-400 text-white px-4 py-2 rounded hover:bg-cyan-600 transition-colors active:scale-90" // Changer p-button-plain pour p-button-primary/secondary
            onClick={exportCsv} 
          />
          <Button label="PDF" icon={<FaFilePdf className="mr-2" />} className="bg-red-700 text-white px-4 py-2 rounded" onClick={exportPdf} />

          <Button 
            label="Réinitialiser" 
            icon={<FaUndo className="mr-2" />} 
            className="w-auto p-3 h-10 flex items-center justify-center rounded bg-white text-indigo-600 border border-indigo-600 hover:bg-indigo-600 hover:text-white transition-colors shadow-none"

            onClick={clearFilters} 
          />
          <Dropdown 
            value={filterType} 
            options={TYPE_OPTIONS} 
            onChange={(e) => setFilterType(e.value)} 
            placeholder="Type" 
            className="w-48 h-12 shadow-none border rounded px-3  hover:border-blue-500 focus:ring-2 focus:ring-blue-500"
          />
          <Dropdown 
            value={filterCategory} 
            options={CATEGORY_OPTIONS} 
            onChange={(e) => setFilterCategory(e.value)} 
            placeholder="Catégorie" 
            className="w-48 h-12 shadow-none border rounded px-3  hover:border-blue-500 focus:ring-2 focus:ring-blue-500"
          />
          <InputNumber 
            value={minAmount}
            onValueChange={(e) => setMinAmount(e.value)}
            placeholder="Min"
            mode="decimal"
            min={0}
            inputClassName="w-36 h-12 shadow-none mb-1 border rounded px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
          />
          <InputNumber
            value={maxAmount}
            onValueChange={(e) => setMaxAmount(e.value)}
            placeholder="Max"
            mode="decimal"
            min={0}
            inputClassName="w-36 h-12 shadow-none mb-1 border rounded px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
          />

          <Calendar
            value={dateRange}
            onChange={(e) => setDateRange(e.value)}
            selectionMode="range"
            placeholder="Intervalle dates"
            inputClassName="w-80 h-12 shadow-none mb-1 border rounded px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}
      right={() => (
        <div>
          <InputText
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="Rechercher nom/type..."
              className="w-80 h-12 shadow-none mb-1 border rounded px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}
    />
  );

  return (
    <div className="rounded-lg overflow-hidden shadow-lg border border-gray-200">
      <DataTable
        ref={dt}
        value={filteredData}
        paginator
        rows={10}
        rowsPerPageOptions={[5,10,20,50]}
        loading={loading}
        stripedRows
        header={header}
        emptyMessage={loading ? "⏳ Chargement..." : "Aucune transaction."}
        className="w-full"
        tableClassName="text-sm"
      >
        <Column field="id" header="ID" style={{ minWidth: '5rem' }} headerClassName="bg-blue-600 text-white text-lg font-bold text-center" />
        <Column field="date" header="Date" body={(r) => new Date(r.date).toLocaleDateString()} headerClassName="bg-blue-600 text-white text-lg font-bold text-center" sortable />
        <Column field="type" header="Type" body={typeBody} sortable style={{ minWidth: '8rem' }} headerClassName="bg-blue-600 text-white text-lg font-bold text-center" />
        <Column field="category" header="Catégorie" body={(r) => r.category?.nom ?? r.categoryId} headerClassName="bg-blue-600 text-white text-lg font-bold text-center" sortable  />
        <Column field="amount" header="Montant" body={amountBody} sortable style={{ minWidth: '8rem' }} headerClassName="bg-blue-600 text-white text-lg font-bold text-center" />
        <Column field="description" header="Description" body={(r) => <div className="truncate max-w-[30ch]">{r.description}</div>} headerClassName="bg-blue-600 text-white text-lg font-bold text-center" />
        <Column field="attachment" header="Pièce" body={attachmentBody} style={{ minWidth: '6rem' }} headerClassName="bg-blue-600 text-white text-lg font-bold text-center" />
        <Column field="createdBy" header="Enregistré par" body={(r) => r.createdBy?.fullname} headerClassName="bg-blue-600 text-white text-lg font-bold text-center" />
        <Column header="Actions" body={actionBody} style={{ minWidth: '10rem' }} headerClassName="bg-blue-600 text-white text-lg font-bold text-center" />
      </DataTable>
    </div>
  );
}
