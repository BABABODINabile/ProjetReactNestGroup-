import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/**
 * Génère un reçu PDF professionnel
 */
export function generateReceiptPDF(transaction, download = true) {
  try {
    const doc = new jsPDF();

    // Normalisation des données pour éviter les erreurs "undefined"
    const transDate = transaction.transaction_date || transaction.date;
    const author = transaction.user?.firstname + " " + transaction.user?.name|| transaction.createdBy?.fullname || "Système";
    const amountFormatted = (Number(transaction.amount) || 0);
    const categoryName = transaction.category?.name || transaction.category?.name || "Général";

    // ========== ENTÊTE PROFESSIONNELLE ==========
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(25, 118, 210); 
    doc.text("VOTRE ENTREPRISE", 14, 15);

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80, 80, 80);
    doc.text("Reçu officiel de transaction", 14, 22);
    doc.text("Gestion des Finances", 14, 28);

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
    doc.text(`Date d'émission : ${transDate ? new Date(transDate).toLocaleString("fr-FR") : 'N/A'}`, 14, 52);
    doc.text(`Enregistré par : ${author}`, 14, 59);

    // Badge de type
    const isExpense = transaction.type === "Dépense";
    const badgeColor = isExpense ? [220, 38, 38] : [34, 197, 94];
    doc.setFillColor(...badgeColor);
    doc.rect(160, 45, 35, 8, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.text(transaction.type.toUpperCase(), 177.5, 50, { align: "center" });

    // Ligne de séparation
    doc.setLineWidth(0.5);
    doc.setDrawColor(200, 200, 200);
    doc.line(14, 65, 195, 65);

    // ========== TABLEAU DÉTAILS ==========
    const detailsData = [
      ["Type de mouvement", transaction.type],
      ["Catégorie", categoryName],
      ["Montant", `${amountFormatted} FCFA`],
      ["Description", transaction.description || "Aucune description fournie"],
    ];

    autoTable(doc, {
      head: [["Désignation", "Détails"]],
      body: detailsData,
      startY: 70,
      headStyles: { fillColor: [25, 118, 210] },
      bodyStyles: { fontSize: 10, cellPadding: 5 },
      alternateRowStyles: { fillColor: [245, 245, 245] },
    });

    const tableEndY = doc.lastAutoTable.finalY;

    // ========== SECTION MONTANT FINAL ==========
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(25, 118, 210);
    doc.text(`TOTAL : ${amountFormatted} FCFA`, 14, tableEndY + 15);

    // ========== SECTION SIGNATURE ==========
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    doc.text("Cachet et Signature :", 140, tableEndY + 35);
    doc.line(135, tableEndY + 60, 185, tableEndY + 60);

    // ========== PIED DE PAGE ==========
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`Généré le ${new Date().toLocaleString("fr-FR")} | Page 1`, 105, 285, { align: "center" });

    if (download) {
      doc.save(`recu-${transaction.id}.pdf`);
      return true;
    }
    return doc;
  } catch (err) {
    console.error("Erreur PDF :", err);
    throw err;
  }
}

/**
 * Génère un PDF de liste de transactions
 */
export function generateTransactionListPDF(transactions = [], filename = "transactions.pdf") {
  try {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Journal des Transactions", 14, 15);

    const rows = (transactions || []).map((t) => [
      String(t.id),
      new Date(t.transaction_date || t.date).toLocaleDateString("fr-FR"),
      t.type,
      t.category?.name || "N/A",
      `${(Number(t.amount) || 0)} FCFA`,
      t.user?.firstname + " " + t.user?.name || t.createdBy?.fullname || "—",
    ]);

    autoTable(doc, {
      head: [["ID", "Date", "Type", "Catégorie", "Montant", "Auteur"]],
      body: rows,
      startY: 25,
      headStyles: { fillColor: [25, 118, 210] },
      styles: { fontSize: 8 },
    });

    doc.save(filename);
    return true;
  } catch (err) {
    console.error("Erreur Liste PDF :", err);
    throw err;
  }
}