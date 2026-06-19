import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { formatCurrency, formatDate, getMonthName } from "@/lib/utils";
import type { TransactionDisplay, MonthlyReportSerialized } from "@/types";

export function exportTransactionsCSV(
  transactions: TransactionDisplay[],
  filename: string = "transactions"
) {
  const headers = [
    "Date",
    "Type",
    "Amount",
    "Account",
    "From Category",
    "To Category",
    "Note",
  ];

  const rows = transactions.map((t) => [
    formatDate(t.transactionDate),
    t.transactionType,
    t.amount.toFixed(2),
    t.accountName,
    t.fromCategoryName || "-",
    t.toCategoryName || "-",
    t.note || "",
  ]);

  const csv = [headers, ...rows]
    .map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
    )
    .join("\n");

  downloadBlob(csv, `${filename}.csv`, "text/csv;charset=utf-8;");
}

export function exportTransactionsExcel(
  transactions: TransactionDisplay[],
  filename: string = "transactions"
) {
  const data = transactions.map((t) => ({
    Date: formatDate(t.transactionDate),
    Type: t.transactionType,
    Amount: t.amount,
    Account: t.accountName,
    "From Category": t.fromCategoryName || "-",
    "To Category": t.toCategoryName || "-",
    Note: t.note || "",
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Transactions");

  // Set column widths
  ws["!cols"] = [
    { wch: 14 },
    { wch: 12 },
    { wch: 14 },
    { wch: 20 },
    { wch: 18 },
    { wch: 18 },
    { wch: 30 },
  ];

  XLSX.writeFile(wb, `${filename}.xlsx`);
}

export function exportTransactionsPDF(
  transactions: TransactionDisplay[],
  filename: string = "transactions"
) {
  const doc = new jsPDF();

  // Title
  doc.setFontSize(20);
  doc.setTextColor(37, 99, 235);
  doc.text("Transaction Report", 14, 22);

  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated on ${formatDate(new Date())}`, 14, 30);

  // Table
  const tableData = transactions.map((t) => [
    formatDate(t.transactionDate),
    t.transactionType,
    formatCurrency(t.amount),
    t.accountName,
    t.fromCategoryName || "-",
    t.toCategoryName || "-",
    (t.note || "").slice(0, 30),
  ]);

  autoTable(doc, {
    head: [["Date", "Type", "Amount", "Account", "From", "To", "Note"]],
    body: tableData,
    startY: 38,
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: {
      fillColor: [37, 99, 235],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    alternateRowStyles: { fillColor: [245, 247, 250] },
  });

  doc.save(`${filename}.pdf`);
}

export function exportMonthlyReportPDF(
  report: MonthlyReportSerialized,
  transactions: TransactionDisplay[]
) {
  const doc = new jsPDF();
  const monthName = getMonthName(report.month);

  // Title
  doc.setFontSize(22);
  doc.setTextColor(37, 99, 235);
  doc.text(`Monthly Report — ${monthName} ${report.year}`, 14, 22);

  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated on ${formatDate(new Date())}`, 14, 30);

  // Summary
  doc.setFontSize(12);
  doc.setTextColor(30, 30, 30);
  let y = 42;

  const summaryData = [
    ["Total Income", formatCurrency(report.income)],
    ["Total Expenses", formatCurrency(report.expenses)],
    ["Net Savings", formatCurrency(report.savings)],
    ["Total Transactions", String(transactions.length)],
  ];

  autoTable(doc, {
    body: summaryData,
    startY: y,
    theme: "plain",
    styles: { fontSize: 11, cellPadding: 5 },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 60 },
      1: { halign: "right", cellWidth: 60 },
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  y = (doc as any).lastAutoTable.finalY + 15;

  // Transactions table
  if (transactions.length > 0) {
    doc.setFontSize(14);
    doc.setTextColor(37, 99, 235);
    doc.text("Transactions", 14, y);

    const tableData = transactions.map((t) => [
      formatDate(t.transactionDate),
      t.transactionType,
      formatCurrency(t.amount),
      t.accountName,
      t.note || "",
    ]);

    autoTable(doc, {
      head: [["Date", "Type", "Amount", "Account", "Note"]],
      body: tableData,
      startY: y + 5,
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: {
        fillColor: [37, 99, 235],
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      alternateRowStyles: { fillColor: [245, 247, 250] },
    });
  }

  doc.save(`report-${monthName.toLowerCase()}-${report.year}.pdf`);
}

export function exportMonthlyReportExcel(
  report: MonthlyReportSerialized,
  transactions: TransactionDisplay[]
) {
  const wb = XLSX.utils.book_new();
  const monthName = getMonthName(report.month);

  // Summary sheet
  const summaryData = [
    ["Monthly Report", `${monthName} ${report.year}`],
    [],
    ["Total Income", report.income],
    ["Total Expenses", report.expenses],
    ["Net Savings", report.savings],
    ["Total Transactions", transactions.length],
  ];
  const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, summaryWs, "Summary");

  // Transactions sheet
  if (transactions.length > 0) {
    const txData = transactions.map((t) => ({
      Date: formatDate(t.transactionDate),
      Type: t.transactionType,
      Amount: t.amount,
      Account: t.accountName,
      "From Category": t.fromCategoryName || "-",
      "To Category": t.toCategoryName || "-",
      Note: t.note || "",
    }));
    const txWs = XLSX.utils.json_to_sheet(txData);
    XLSX.utils.book_append_sheet(wb, txWs, "Transactions");
  }

  XLSX.writeFile(wb, `report-${monthName.toLowerCase()}-${report.year}.xlsx`);
}

function downloadBlob(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
