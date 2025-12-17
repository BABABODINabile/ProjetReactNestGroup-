import React, { useRef, useState, useMemo, useCallback } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Toolbar } from "primereact/toolbar";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import Swal from "sweetalert2";
// Assurez-vous que cette fonction est bien disponible et gère les erreurs
import { deleteCategory } from "./categories.service"; 
import { FaPencilAlt, FaTrashAlt, FaFilePdf,FaFileDownload} from "react-icons/fa";
import jsPDF from "jspdf";
import "jspdf-autotable";

// Utilisation des alias pour les classes Pi (PrimeIcons) pour la clarté
const PI_UPLOAD = 'pi pi-upload';


// Utilisation de React.memo pour éviter les rendus inutiles si les props ne changent pas
export default React.memo(function CategoriesTable({ data = [], onEdit, refresh, loading = false }) {
  const dt = useRef(null);
  const [globalFilter, setGlobalFilter] = useState("");
  const [filterType, setFilterType] = useState(null);

  // --- Constantes et Mémorisation ---

  // Les options de type ne changeront jamais, pas besoin de les mémoriser.
  const TYPE_OPTIONS = [
    { label: "Tous les types", value: null }, // Mieux que "Tous" pour l'UX
    { label: "Dépense", value: "Dépense" },
    { label: "Recette", value: "Recette" },
    { label: "Mixte", value: "Mixte" },
  ];

  // Mémoriser la fonction d'exportation pour la performance
  const exportCsv = useCallback(() => {
    dt.current?.exportCSV(); // Utilisation de l'opérateur de chaînage optionnel
  }, []);

  // Export PDF using jsPDF + autoTable
  const exportPdf = useCallback(() => {
    try {
      const doc = new jsPDF();

      // Title
      doc.setFontSize(14);
      doc.text("Liste des catégories", 14, 20);

      // Build rows
      const rows = (data || []).map((d) => [d.name ?? "", d.type ?? ""]);

      // autoTable will render the table starting after the title
      // @ts-ignore - autoTable is attached to jsPDF by the import
      doc.autoTable({
        head: [["Nom", "Type"]],
        body: rows,
        startY: 26,
        styles: { fontSize: 10 },
        headStyles: { fillColor: [22, 78, 99], halign: 'center' },
        theme: 'grid',
      });

      doc.save("categories.pdf");
    } catch (err) {
      console.error("Erreur export PDF:", err);
      Swal.fire("Erreur", "L'exportation PDF a échoué.", "error");
    }
  }, [data]);

  // Mémoriser la fonction de suppression
  const deleteRow = useCallback(async (id, name) => {
    const r = await Swal.fire({
      title: `Supprimer ${name} ?`,
      text: "Cette catégorie sera supprimée définitivement.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Oui, Supprimer",
      cancelButtonText: "Annuler",
      confirmButtonColor: "#d33",
    });

    if (r.isConfirmed) {
      try {
        await deleteCategory(id);
        refresh();
        Swal.fire("Supprimé !", `La catégorie ${name} a été supprimée.`, "success");
      } catch (error) {
        // Gestion d'erreur améliorée
        Swal.fire("Erreur", "La suppression a échoué. Veuillez réessayer.", "error");
        console.error("Erreur de suppression:", error);
      }
    }
  }, [refresh]);

  // Mémoriser le corps d'action pour la performance
  const actionBody = useCallback((row) => (
    <div className="flex items-center gap-4">
      <Button 
      
        icon={<FaPencilAlt/>}
        className="w-10 h-10 flex items-center justify-center rounded bg-white text-blue-600 border border-blue-600 hover:bg-blue-700 hover:text-white transition-colors shadow-none"
        onClick={() => onEdit(row)}
        aria-label={`Modifier ${row.name}`}
        tooltip="Modifier"
      />
      <Button
        icon={<FaTrashAlt />}
        className="w-10 h-10 flex items-center justify-center rounded bg-white text-red-600 border border-red-600 hover:bg-red-700 hover:text-white transition-colors shadow-none"
        onClick={() => deleteRow(row.id, row.name)} // Passage du name pour l'UX
        aria-label={`Supprimer ${row.name}`}
        tooltip="Supprimer"
      />
    </div>
  ), [onEdit, deleteRow]);

  // Badge de type avec couleurs
  const typeBody = useCallback((row) => {
    const typeConfig = {
      "Dépense": { bg: "bg-red-100", text: "text-red-700", icon: "↑" },
      "Recette": { bg: "bg-green-100", text: "text-green-700", icon: "↓" },
      "Mixte": { bg: "bg-amber-100", text: "text-amber-700", icon: "↕" },
    };
    const config = typeConfig[row.type] || typeConfig["Dépense"];
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${config.bg} ${config.text}`}>
        {config.icon} {row.type}
      </span>
    );
  }, []);

  // Préparer les filtres : Mémorisation essentielle pour ne pas re-créer à chaque rendu
  const filters = useMemo(() => {
    const f = {};
    // La clé 'global' est réservée au filtre global
    if (globalFilter) f['global'] = { value: globalFilter, matchMode: 'contains' }; 
    // Le filtre sur le champ 'type'
    if (filterType) f['type'] = { value: filterType, matchMode: 'equals' };
    return f;
  }, [globalFilter, filterType]);

  // --- Templates de la Toolbar ---

  const leftToolbarTemplate = () => (
    <div className="flex items-center gap-3">
      <Button
        label="Exporter CSV"
        icon={<FaFileDownload className="mr-2" />}
        className="bg-teal-400 text-white px-4 py-2 rounded hover:bg-cyan-600 transition-colors active:scale-90" // Changer p-button-plain pour p-button-primary/secondary
        onClick={exportCsv}
      />

      <Button
        label="Exporter PDF"
        icon={<FaFilePdf className="mr-2" />}
        className="bg-red-700 text-white px-4 py-2 rounded hover:bg-red-800 transition-colors active:scale-90"
        onClick={exportPdf}
      />

      <Dropdown
        value={filterType}
        options={TYPE_OPTIONS}
        onChange={(e) => setFilterType(e.value)}
        placeholder="Filtrer par type..."
        className="w-48 h-12 shadow-none border rounded px-3  hover:border-blue-500 focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );

  const rightToolbarTemplate = () => (
    <div className="flex items-center">
        
        <InputText
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder="Rechercher nom/type..."
          className="w-80 h-12 shadow-none mb-1 border rounded px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
        />
    </div>
  );

  const header = (
    <Toolbar 
      className="bg-gradient-to-r from-blue-50 to-blue-100 border-b-2 border-blue-200 rounded-t-lg p-4"
      left={leftToolbarTemplate} 
      right={rightToolbarTemplate} 
    />
  );

  // --- Rendu final ---

  return (
    <div className="rounded-lg overflow-hidden shadow-lg border border-gray-200">
      <DataTable
        ref={dt}
        value={data}
        paginator
        rows={10}
        rowsPerPageOptions={[5, 10, 20, 50]}
        loading={loading} 
        stripedRows
        showGridlines={false}
        responsiveLayout="scroll"
        header={header}
        globalFilterFields={["name", "type"]} 
        filters={filters}
        emptyMessage={loading ? "⏳ Chargement..." : "📭 Aucune catégorie trouvée."}
        className="w-full"
        tableClassName="text-sm"
        paginatorClassName="bg-gray-50 border-t border-gray-200"
      >
        <Column 
          field="name" 
          header="Nom" 
          sortable
          headerClassName="bg-blue-600 text-white text-lg font-bold text-center"
          bodyClassName="text-gray-900 font-medium"
          style={{ minWidth: '15rem' }} 
        />
        <Column 
          field="type" 
          header="Type" 
          body={typeBody}
          sortable
          headerClassName="bg-blue-600 text-white text-lg font-bold text-center"
          style={{ minWidth: '10rem' }} 
        />
        <Column 
          header="Actions" 
          body={actionBody}
          headerClassName="bg-blue-600 text-white text-lg font-bold text-center"
          bodyClassName="text-center"
          style={{ minWidth: '8rem' }} 
        />
      </DataTable>
    </div>
  );
}); // Fin de React.memo