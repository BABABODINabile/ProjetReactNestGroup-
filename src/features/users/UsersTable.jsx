import React, { useRef, useState, useMemo, useCallback } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Toolbar } from "primereact/toolbar";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import Swal from "sweetalert2";
import { deleteUser } from "./users.service";
import { FaPencilAlt, FaTrashAlt, FaFilePdf, FaFileDownload } from "react-icons/fa";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default React.memo(function UsersTable({ data = [], onEdit, refresh, loading = false }) {
    const dt = useRef(null);
    const [globalFilter, setGlobalFilter] = useState("");
    const [filterRole, setFilterRole] = useState(null);

    // Options corrigées pour le filtrage
    const ROLE_OPTIONS = [
        { label: "Tous les rôles", value: "Directeur" | "Comptable" },
        { label: "Directeur", value: "Directeur" },
        { label: "Comptable", value: "Comptable" },
    ];

    const exportCsv = useCallback(() => {
        dt.current?.exportCSV();
    }, []);

    const exportPdf = useCallback(() => {
        try {
            const doc = new jsPDF();
            doc.setFontSize(14);
            doc.text("Liste des utilisateurs", 14, 20);
            
            const rows = (data || []).map((d) => [
                `${d.name || ""} ${d.firstname || ""}`.trim(),
                d.email ?? "",
                d.role?.name ?? ""
            ]);

            autoTable(doc, {
                head: [["Nom", "Email", "Rôle"]],
                body: rows,
                startY: 26,
                styles: { fontSize: 10 },
                headStyles: { fillColor: [22, 78, 99], halign: "center" },
                theme: "grid",
            });

            doc.save("users.pdf");
        } catch (err) {
            console.error("Erreur export PDF:", err);
            Swal.fire("Erreur", "L'exportation PDF a échoué.", "error");
        }
    }, [data]);

    const deleteRow = useCallback(
        async (id, fullName) => {
            const r = await Swal.fire({
                title: `Supprimer ${fullName} ?`,
                text: "Cet utilisateur sera supprimé définitivement.",
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Oui, Supprimer",
                cancelButtonText: "Annuler",
                confirmButtonColor: "#d33",
            });

            if (r.isConfirmed) {
                try {
                    await deleteUser(id);
                    refresh();
                    Swal.fire("Supprimé !", `L'utilisateur a été supprimé.`, "success");
                } catch (error) {
                    Swal.fire("Erreur", "La suppression a échoué.", "error");
                }
            }
        },
        [refresh]
    );

    const actionBody = useCallback(
        (row) => (
            <div className="flex items-center gap-4">
                {/*<button
                    onClick={() => onEdit(row)}
                    className="w-10 h-10 flex items-center justify-center rounded bg-white text-blue-600 border border-blue-600 hover:bg-blue-700 hover:text-white transition-colors"
                    title="Modifier"
                >
                    <FaPencilAlt />
                </button>*/}
                <button
                    onClick={() => deleteRow(row.id, `${row.name || ""} ${row.firstname || ""}`.trim())}
                    className="w-10 h-10 flex items-center justify-center rounded bg-white text-red-600 border border-red-600 hover:bg-red-700 hover:text-white transition-colors"
                    title="Supprimer"
                >
                    <FaTrashAlt />
                </button>
            </div>
        ),
        [onEdit, deleteRow]
    );

    // Formate le nom complet pour l'affichage
    const nameBody = useCallback((row) => {
        const ln = row.name ?? "";
        const fn = row.firstname ?? "";
        return <span className="capitalize">{`${ln} ${fn}`.trim()}</span>;
    }, []);

    // Formate le rôle pour l'affichage
    const roleBody = useCallback((row) => {
        return row.role?.name ?? "";
    }, []);

    // Filtres mémorisés
    const filters = useMemo(() => {
        return {
            global: { value: globalFilter, matchMode: "contains" },
            "role.name": { value: filterRole, matchMode: "equals" }
        };
    }, [globalFilter, filterRole]);

    const leftToolbarTemplate = () => (
        <div className="flex items-center gap-3">
            <Button label="Exporter CSV" icon={<FaFileDownload className="mr-2" />} className="bg-teal-400 text-white px-4 py-2 rounded border-none hover:bg-teal-500 transition-colors" onClick={exportCsv} />
            <Button label="Exporter PDF" icon={<FaFilePdf className="mr-2" />} className="bg-red-700 text-white px-4 py-2 rounded border-none hover:bg-red-800 transition-colors" onClick={exportPdf} />

            <Dropdown 
                value={filterRole} 
                options={ROLE_OPTIONS} 
                onChange={(e) => setFilterRole(e.value)} 
                placeholder="Filtrer par rôle..." 
                className="w-52 h-12 shadow-none border rounded px-3 flex items-center hover:border-blue-500 focus:ring-2 focus:ring-blue-500" 
            />
        </div>
    );

    const rightToolbarTemplate = () => (
        <div className="flex items-center">
            <InputText 
                value={globalFilter} 
                onChange={(e) => setGlobalFilter(e.target.value)} 
                placeholder="Rechercher nom/email/rôle..." 
                className="w-80 h-12 shadow-none mb-1 border rounded px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" 
            />
        </div>
    );

    const header = <Toolbar className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 border-none" left={leftToolbarTemplate} right={rightToolbarTemplate} />;

    return (
        <div className="rounded-lg overflow-hidden shadow-lg border border-gray-200 bg-white">
            <DataTable
                ref={dt}
                value={data}
                paginator
                rows={5}
                rowsPerPageOptions={[5, 10, 20, 50]}
                loading={loading}
                stripedRows
                showGridlines={false}
                responsiveLayout="scroll"
                header={header}
                // Ajout de role.name pour la recherche globale
                globalFilterFields={["name", "firstname", "email", "role.name"]}
                filters={filters}
                emptyMessage={loading ? " Chargement..." : " Aucun utilisateur trouvé."}
                className="w-full"
                rowClassName={() => 'border-b border-gray-100'}
            >
                <Column 
                    field="name" 
                    header="Nom et Prénom" 
                    body={nameBody} 
                    sortable 
                    headerClassName="bg-blue-600 text-white p-4" 
                    bodyClassName="text-gray-900 font-medium" 
                    style={{ minWidth: "15rem" }} 
                />
                <Column 
                    field="email" 
                    header="Email" 
                    sortable 
                    headerClassName="bg-blue-600 text-white p-4" 
                    style={{ minWidth: "18rem" }} 
                />
                <Column 
                    field="role.name" 
                    filterField="role.name"
                    header="Rôle" 
                    body={roleBody} 
                    sortable 
                    headerClassName="bg-blue-600 text-white p-4" 
                    style={{ minWidth: "12rem" }} 
                />
                <Column 
                    header="Actions" 
                    body={actionBody} 
                    headerClassName="bg-blue-600 text-white p-4" 
                    bodyClassName="text-center" 
                    style={{ minWidth: "8rem" }} 
                />
            </DataTable>
        </div>
    );
});