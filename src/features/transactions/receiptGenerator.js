import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/**
 * Génère un reçu PDF professionnel et stylisé pour une transaction
 * @param {Object} transaction - La transaction avec id, type, amount, date, category, description, createdBy
 * @param {boolean} download - Si true, télécharge le PDF. Si false, retourne le blob.
 */
export function generateReceiptPDF(transaction, download = true) {
  try {
    const doc = new jsPDF();

    // ========== ENTÊTE PROFESSIONNELLE ==========
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(25, 118, 210); // Bleu premium
    doc.text("ENTREPRISE XYZ", 14, 15);

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80, 80, 80);
    doc.text("Reçu officiel de transaction", 14, 22);
    doc.text("Gestion des Dépenses & Recettes", 14, 28);
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.text("Tel : +229 00 00 00 00 | RCCM : BN-12345 | IFU : 123456789", 14, 33);

    // Ligne de séparation decorative
    doc.setLineWidth(0.7);
    doc.setDrawColor(25, 118, 210);
    doc.line(14, 36, 195, 36);

    // ========== INFO ENTÊTE REÇU ==========
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(40, 40, 40);
    doc.text(`Reçu N° : RC-${String(transaction.id).padStart(6, "0")}`, 14, 45);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80, 80, 80);
    doc.text(`Date d'émission : ${new Date(transaction.date).toLocaleString("fr-FR")}`, 14, 52);
    doc.text(`Enregistré par : ${transaction.createdBy?.fullname || "Système"}`, 14, 59);

    // Badge de type (Dépense ou Recette)
    const isExpense = transaction.type === "Dépense";
    const badgeColor = isExpense ? [220, 38, 38] : [34, 197, 94]; // rouge ou vert
    const badgeText = isExpense ? "DÉPENSE" : "RECETTE";
    doc.setFillColor(...badgeColor);
    doc.rect(160, 45, 35, 8, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.text(badgeText, 177.5, 50, { align: "center" });

    // Ligne de séparation
    doc.setLineWidth(0.5);
    doc.setDrawColor(200, 200, 200);
    doc.line(14, 65, 195, 65);

    // ========== TABLEAU DÉTAILS ==========
    doc.setFont("helvetica", "normal");
    doc.setTextColor(40, 40, 40);
    const detailsData = [
      ["Type", transaction.type === "Dépense" ? "Dépense" : "Recette"],
      ["Catégorie", transaction.category?.nom ?? transaction.categoryId],
      ["Montant", `${(transaction.amount || 0).toLocaleString("fr-FR")} FCFA`],
      ["Description", transaction.description || "—"],
    ];

    autoTable(doc, {
      head: [["Champ", "Valeur"]],
      body: detailsData,
      startY: 70,
      headStyles: {
        fillColor: [25, 118, 210],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 11,
        halign: "left",
        cellPadding: 4,
      },
      bodyStyles: {
        fontSize: 10,
        cellPadding: 4,
        textColor: [40, 40, 40],
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      margin: { left: 14, right: 14 },
      didDrawPage: (data) => {
        // Ajouter bordure à chaque page si nécessaire
      },
    });

    const tableEndY = doc.lastAutoTable.finalY;

    // ========== SECTION MONTANT FINAL ==========
    doc.setLineWidth(0.5);
    doc.setDrawColor(200, 200, 200);
    doc.line(14, tableEndY + 5, 195, tableEndY + 5);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(25, 118, 210);
    const finalAmount = (transaction.amount || 0).toLocaleString("fr-FR");
    doc.text(`Montant : ${finalAmount} FCFA`, 14, tableEndY + 15);

    

    // ========== SECTION SIGNATURE ==========
    doc.setLineWidth(0.5);
    doc.setDrawColor(200, 200, 200);
    doc.line(14, tableEndY + 25, 195, tableEndY + 25);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    doc.text("Signature :", 14, tableEndY + 35);
    doc.line(60, tableEndY + 37, 120, tableEndY + 37); // ligne signature

    // ========== PIED DE PAGE ==========
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text("Document généré automatiquement", 105, 280, { align: "center" });
    doc.text("Système de Gestion Financière — Tous droits réservés", 105, 285, { align: "center" });

    // Ajouter numéro de page
    doc.setFontSize(8);
    doc.text(`Page 1 | Généré le ${new Date().toLocaleString("fr-FR")}`, 14, 290);

    // ========== TÉLÉCHARGER OU RETOURNER ==========
    if (download) {
      doc.save(`recu-${transaction.id}.pdf`);
      return true;
    } else {
      return doc;
    }
  } catch (err) {
    console.error("Erreur lors de la génération du reçu PDF :", err);
    throw err;
  }
}

/**
 * Génère un PDF de liste de transactions
 * @param {Array} transactions - Array de transactions
 * @param {string} filename - Nom du fichier à télécharger
 */
export function generateTransactionListPDF(transactions = [], filename = "transactions.pdf") {
  try {
    const doc = new jsPDF();

    // Entête
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(25, 118, 210);
    doc.text("Liste des Transactions", 14, 15);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    doc.text(`Généré le ${new Date().toLocaleString("fr-FR")}`, 14, 22);

    // Ligne de séparation
    doc.setLineWidth(0.5);
    doc.setDrawColor(200, 200, 200);
    doc.line(14, 25, 195, 25);

    // Données du tableau
    const rows = (transactions || []).map((t) => [
      String(t.id),
      new Date(t.date).toLocaleDateString("fr-FR"),
      t.type,
      t.category?.nom ?? String(t.categoryId),
      `${(t.amount || 0).toLocaleString("fr-FR")} FCFA`,
      t.createdBy?.fullname ?? "—",
    ]);

    autoTable(doc, {
      head: [["ID", "Date", "Type", "Catégorie", "Montant", "Enregistré par"]],
      body: rows,
      startY: 30,
      headStyles: {
        fillColor: [25, 118, 210],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        halign: "center",
      },
      bodyStyles: {
        fontSize: 9,
        textColor: [40, 40, 40],
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      margin: { left: 14, right: 14 },
    });

    doc.save(filename);
    return true;
  } catch (err) {
    console.error("Erreur lors de la génération de la liste PDF :", err);
    throw err;
  }
}
