"use client";

import { motion } from "framer-motion";
import { X, Printer, Download, CheckCircle } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface ReceiptItem {
  name: string;
  quantity: number;
  price: number;
  subtotal: number;
}

interface Receipt {
  receiptNumber: string;
  issuedAt: string;
  table: {
    number: number;
    location: string;
  };
  items: ReceiptItem[];
  subtotal: number;
  discountTotal: number;
  total: number;
  method: "cash" | "transfer" | "card" | "split";
  change: number;
  processedBy: {
    name: string;
    role: string;
  };
  maintenanceUntil?: string;
  discounts?: Array<{
    type: string;
    value: number;
    amountApplied: number;
    reason: string;
  }>;
}

interface Props {
  receipt: Receipt;
  onClose: () => void;
}

export default function ReceiptModal({ receipt, onClose }: Props) {
  const handlePrint = () => {
    // Simular impresión
    console.log("Imprimiendo recibo:", receipt.receiptNumber);
  };

  const handleDownload = () => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      // Nebula Branding - Header
      doc.setFillColor(15, 15, 35); // Dark background
      doc.rect(0, 0, pageWidth, 40, "F");

      doc.setTextColor(255, 215, 0); // Gold color
      doc.setFontSize(24);
      doc.setFont("helvetica", "bold");
      doc.text("NEBULA", pageWidth / 2, 20, { align: "center" });

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text("Sistema de Gestión de Bar", pageWidth / 2, 30, { align: "center" });

      // Receipt Info
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("RECIBO DE PAGO", pageWidth / 2, 55, { align: "center" });

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text(`No. ${receipt.receiptNumber}`, pageWidth / 2, 62, { align: "center" });

      // Table and Date Info
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("Mesa:", 20, 75);
      doc.setFont("helvetica", "normal");
      doc.text(`${receipt.table.number}`, 45, 75);

      doc.setFont("helvetica", "bold");
      doc.text("Fecha:", 20, 82);
      doc.setFont("helvetica", "normal");
      doc.text(new Date(receipt.issuedAt).toLocaleString(), 45, 82);

      // Items Table
      const tableData = receipt.items.map((item) => [
        item.name,
        item.quantity.toString(),
        `$${item.price.toFixed(2)}`,
        `$${item.subtotal.toFixed(2)}`,
      ]);

      autoTable(doc, {
        startY: 95,
        head: [["Item", "Cantidad", "Precio", "Subtotal"]],
        body: tableData,
        theme: "grid",
        headStyles: {
          fillColor: [255, 215, 0],
          textColor: [0, 0, 0],
          fontStyle: "bold",
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
        margin: { top: 10, left: 20, right: 20 },
      });

      // Totals
      let finalY = (doc as any).lastAutoTable.finalY + 10;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Subtotal:`, 120, finalY);
      doc.text(`$${receipt.subtotal.toFixed(2)}`, 170, finalY, { align: "right" });

      if (receipt.discountTotal > 0) {
        finalY += 7;
        doc.setTextColor(34, 197, 94); // Green
        doc.text(`Descuento:`, 120, finalY);
        doc.text(`-$${receipt.discountTotal.toFixed(2)}`, 170, finalY, { align: "right" });
      }

      finalY += 10;
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text(`TOTAL:`, 120, finalY);
      doc.setTextColor(255, 215, 0); // Gold
      doc.text(`$${receipt.total.toFixed(2)}`, 170, finalY, { align: "right" });

      if (receipt.method === "cash" && receipt.change > 0) {
        finalY += 7;
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text(`Vuelto:`, 120, finalY);
        doc.setTextColor(34, 197, 94);
        doc.text(`$${receipt.change.toFixed(2)}`, 170, finalY, { align: "right" });
      }

      // Payment Method
      finalY += 15;
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("Método de pago:", 20, finalY);
      doc.setFont("helvetica", "normal");
      const methodText = {
        cash: "Efectivo",
        transfer: "Transferencia",
        card: "Tarjeta",
        split: "Cuenta dividida",
      }[receipt.method] || receipt.method;
      doc.text(methodText, 60, finalY);

      // Footer
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text("Procesado por: " + (receipt.processedBy?.name || "Caja"), 20, pageHeight - 20);
      doc.text("Gracias por su preferencia", pageWidth / 2, pageHeight - 20, { align: "center" });

      // Save PDF
      doc.save(`recibo_${receipt.receiptNumber}.pdf`);
    } catch (error) {
      console.error("Error generando PDF:", error);
      alert("Hubo un error al generar el PDF. Por favor intenta de nuevo.");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-8"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-md bg-white rounded-2xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="bg-gradient-to-br from-obsidian to-black p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center mx-auto mb-3">
            <CheckCircle size={24} className="text-gold" />
          </div>
          <h2 className="text-xl font-black text-white tracking-tight mb-1">RECIBO DE PAGO</h2>
          <p className="text-[10px] font-bold text-gold uppercase tracking-widest">
            {receipt.receiptNumber}
          </p>
        </div>

        {/* CONTENT */}
        <div className="p-6 space-y-6">
          {/* TABLE INFO */}
          <div className="flex justify-between items-center pb-4 border-b border-gray-200">
            <div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Mesa</p>
              <p className="text-lg font-black text-gray-900">{receipt.table.number}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Fecha</p>
              <p className="text-xs font-bold text-gray-700">
                {new Date(receipt.issuedAt).toLocaleString()}
              </p>
            </div>
          </div>

          {/* ITEMS */}
          <div className="space-y-3">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Items</p>
            <div className="space-y-2">
              {receipt.items.map((item, index) => (
                <div key={index} className="flex justify-between items-center text-sm">
                  <div className="flex-1">
                    <p className="font-bold text-gray-900">{item.name}</p>
                    <p className="text-[10px] text-gray-500">x{item.quantity} × ${item.price.toFixed(2)}</p>
                  </div>
                  <p className="font-black text-gray-900">${item.subtotal.toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* DISCOUNTS */}
          {receipt.discounts && receipt.discounts.length > 0 && (
            <div className="space-y-2 p-4 bg-green-50 rounded-xl border border-green-200">
              <p className="text-[10px] font-bold text-green-700 uppercase tracking-widest">Descuentos</p>
              {receipt.discounts.map((discount, index) => (
                <div key={index} className="flex justify-between items-center text-xs">
                  <span className="text-green-700">
                    {discount.type === "PERCENT" ? `${discount.value}%` : `$${discount.value}`} - {discount.reason}
                  </span>
                  <span className="font-bold text-green-700">-${discount.amountApplied.toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}

          {/* TOTALS */}
          <div className="space-y-2 pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500">Subtotal</span>
              <span className="font-bold text-gray-900">${receipt.subtotal.toFixed(2)}</span>
            </div>
            {receipt.discountTotal > 0 && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-green-600">Descuento</span>
                <span className="font-bold text-green-600">-${receipt.discountTotal.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between items-center text-lg">
              <span className="font-black text-gray-900">TOTAL</span>
              <span className="font-black text-gold">${receipt.total.toFixed(2)}</span>
            </div>
            {receipt.method === "cash" && receipt.change > 0 && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Cambio</span>
                <span className="font-bold text-green-600">${receipt.change.toFixed(2)}</span>
              </div>
            )}
          </div>

          {/* PAYMENT METHOD */}
          <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
            <div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Método de Pago</p>
              <p className="text-sm font-bold text-gray-900 uppercase">
                {{
                  cash: "Efectivo",
                  transfer: "Transferencia",
                  card: "Tarjeta",
                  split: "Cuenta dividida",
                }[receipt.method] || receipt.method}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Procesado por</p>
              <p className="text-xs font-bold text-gray-700">{receipt.processedBy?.name || "Caja"}</p>
            </div>
          </div>

          {receipt.maintenanceUntil && (
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-3 text-center">
              Mesa en mantenimiento hasta{" "}
              {new Date(receipt.maintenanceUntil).toLocaleTimeString()}
            </p>
          )}
        </div>

        {/* FOOTER ACTIONS */}
        <div className="p-6 bg-gray-50 border-t border-gray-200 flex gap-3">
          <button
            onClick={handlePrint}
            className="flex-1 py-3 rounded-xl bg-obsidian text-white text-[10px] font-black uppercase tracking-widest hover:bg-obsidian/90 transition-all flex items-center justify-center gap-2"
          >
            <Printer size={14} />
            Imprimir
          </button>
          <button
            onClick={handleDownload}
            className="flex-1 py-3 rounded-xl bg-white text-obsidian border border-gray-300 text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
          >
            <Download size={14} />
            Descargar
          </button>
          <button
            onClick={onClose}
            className="w-12 h-12 rounded-xl bg-gray-200 text-gray-700 flex items-center justify-center hover:bg-gray-300 transition-all"
          >
            <X size={18} />
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
