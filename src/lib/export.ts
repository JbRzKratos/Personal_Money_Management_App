import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { formatDate, getMonthName } from "@/lib/utils";
import { useSettingsStore } from "@/stores/settings-store";
import type { TransactionDisplay, MonthlyReportSerialized } from "@/types";

// Safe wrapper for XLSX due to ESM/Turbopack import wrapping issues
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const XLSX_SAFE: any = (XLSX as any).utils ? XLSX : ((XLSX as any).default || XLSX);

/**
 * Format currency to ASCII format (e.g. "INR 10,000.00" or "-USD 250.00")
 * to avoid Unicode font rendering bugs in PDF generators like jsPDF.
 */
function formatExportCurrency(amount: number): string {
  const rounded = Math.round(amount * 100) / 100;
  let currencyCode = "INR";
  try {
    currencyCode = useSettingsStore.getState().currencyCode || "INR";
  } catch (e) {
    // Ignore error
  }
  
  const absVal = Math.abs(rounded);
  const formattedAmount = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(absVal);
  
  return rounded < 0 ? `-${currencyCode} ${formattedAmount}` : `${currencyCode} ${formattedAmount}`;
}

/**
 * Draws a premium card for summary metrics in the monthly PDF report.
 */
function drawCard(
  doc: jsPDF,
  x: number,
  y: number,
  width: number,
  height: number,
  bgColor: [number, number, number],
  borderColor: [number, number, number],
  label: string,
  value: string,
  valueColor: [number, number, number]
) {
  // Draw background
  doc.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
  doc.roundedRect(x, y, width, height, 3, 3, "F");

  // Draw border
  doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
  doc.setLineWidth(0.3);
  doc.roundedRect(x, y, width, height, 3, 3, "S");

  // Draw label
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  const labelWidth = doc.getTextWidth(label);
  doc.text(label, x + (width - labelWidth) / 2, y + 8);

  // Draw value
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(valueColor[0], valueColor[1], valueColor[2]);
  const valueWidth = doc.getTextWidth(value);
  doc.text(value, x + (width - valueWidth) / 2, y + 17);
}

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
    Number(t.amount).toFixed(2),
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
    Amount: Math.round(Number(t.amount) * 100) / 100,
    Account: t.accountName,
    "From Category": t.fromCategoryName || "-",
    "To Category": t.toCategoryName || "-",
    Note: t.note || "",
  }));

  const ws = XLSX_SAFE.utils.json_to_sheet(data);
  const wb = XLSX_SAFE.utils.book_new();
  XLSX_SAFE.utils.book_append_sheet(wb, ws, "Transactions");

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

  XLSX_SAFE.writeFile(wb, `${filename}.xlsx`);
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
    formatExportCurrency(Number(t.amount)),
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

  // Summary Metrics Cards Section
  const startY = 38;
  const cardHeight = 22;
  const cardWidth = 56;
  const gap = 7;

  // Card 1: Total Income (Green Theme)
  drawCard(
    doc,
    14,
    startY,
    cardWidth,
    cardHeight,
    [240, 253, 244], // #f0fdf4
    [187, 247, 208], // #bbf7d0
    "TOTAL INCOME",
    formatExportCurrency(Number(report.income)),
    [22, 163, 74]     // #16a34a
  );

  // Card 2: Total Expenses (Red Theme)
  drawCard(
    doc,
    14 + cardWidth + gap,
    startY,
    cardWidth,
    cardHeight,
    [254, 242, 242], // #fef2f2
    [254, 202, 202], // #fecaca
    "TOTAL EXPENSES",
    formatExportCurrency(Number(report.expenses)),
    [220, 38, 38]     // #dc2626
  );

  // Card 3: Net Savings (Blue or Orange Theme)
  const isPositiveSavings = Number(report.savings) >= 0;
  const savingsBgColor: [number, number, number] = isPositiveSavings ? [239, 246, 255] : [255, 247, 237]; // #eff6ff : #fff7ed
  const savingsBorderColor: [number, number, number] = isPositiveSavings ? [191, 219, 254] : [255, 237, 213]; // #bfdbfe : #ffedd5
  const savingsTextColor: [number, number, number] = isPositiveSavings ? [37, 99, 235] : [234, 88, 12]; // #2563eb : #ea580c

  drawCard(
    doc,
    14 + 2 * (cardWidth + gap),
    startY,
    cardWidth,
    cardHeight,
    savingsBgColor,
    savingsBorderColor,
    "NET SAVINGS",
    (isPositiveSavings ? "+" : "") + formatExportCurrency(Number(report.savings)),
    savingsTextColor
  );

  // Transactions Section
  const tableStartY = startY + cardHeight + 15;
  if (transactions.length > 0) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(37, 99, 235);
    doc.text("Transactions", 14, tableStartY);

    const tableData = transactions.map((t) => [
      formatDate(t.transactionDate),
      t.transactionType,
      formatExportCurrency(Number(t.amount)),
      t.accountName,
      (t.note || "").slice(0, 45),
    ]);

    autoTable(doc, {
      head: [["Date", "Type", "Amount", "Account", "Note"]],
      body: tableData,
      startY: tableStartY + 4,
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
  const wb = XLSX_SAFE.utils.book_new();
  const monthName = getMonthName(report.month);

  // Summary sheet
  const summaryData = [
    ["Monthly Report", `${monthName} ${report.year}`],
    [],
    ["Total Income", Math.round(Number(report.income) * 100) / 100],
    ["Total Expenses", Math.round(Number(report.expenses) * 100) / 100],
    ["Net Savings", Math.round(Number(report.savings) * 100) / 100],
    ["Total Transactions", transactions.length],
  ];
  const summaryWs = XLSX_SAFE.utils.aoa_to_sheet(summaryData);
  XLSX_SAFE.utils.book_append_sheet(wb, summaryWs, "Summary");

  // Transactions sheet
  if (transactions.length > 0) {
    const txData = transactions.map((t) => ({
      Date: formatDate(t.transactionDate),
      Type: t.transactionType,
      Amount: Math.round(Number(t.amount) * 100) / 100,
      Account: t.accountName,
      "From Category": t.fromCategoryName || "-",
      "To Category": t.toCategoryName || "-",
      Note: t.note || "",
    }));
    const txWs = XLSX_SAFE.utils.json_to_sheet(txData);
    XLSX_SAFE.utils.book_append_sheet(wb, txWs, "Transactions");
  }

  XLSX_SAFE.writeFile(wb, `report-${monthName.toLowerCase()}-${report.year}.xlsx`);
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
