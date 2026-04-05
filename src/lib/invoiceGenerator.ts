import { formatCurrency } from "@/utils/formatters";

interface InvoiceOrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface InvoiceOrder {
  id: string;
  createdAt: string | Date;
  customerName: string;
  customerAddress?: string | null;
  items: InvoiceOrderItem[];
  total: number;
}

function escapeHtml(unsafe: string | null | undefined): string {
  if (unsafe == null) return "";
  return String(unsafe)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

const INVOICE_STYLES = `
  body { font-family: Arial, sans-serif; padding: 40px; }
  .header { text-align: center; margin-bottom: 30px; }
  .info { margin-bottom: 20px; }
  table { width: 100%; border-collapse: collapse; }
  th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
  .total { font-weight: bold; font-size: 1.2em; margin-top: 20px; text-align: right; }
  .legal-notice { font-size: 0.8em; color: #666; margin-top: 30px; border-top: 1px solid #ddd; padding-top: 15px; }
`;

function buildInvoiceRows(items: InvoiceOrderItem[]): string {
  return items
    .map(
      (item) =>
        `<tr><td>${escapeHtml(item.name)}</td><td>${item.quantity}</td>` +
        `<td>${formatCurrency(item.price)}</td><td>${formatCurrency(item.quantity * item.price)}</td></tr>`
    )
    .join("");
}

function buildInvoiceInfo(order: InvoiceOrder): string {
  const date = escapeHtml(
    new Date(order.createdAt).toLocaleDateString("es-AR")
  );
  return `<div class="info">
    <p><strong>Comprobante #:</strong> ${escapeHtml(order.id)}</p>
    <p><strong>Fecha:</strong> ${date}</p>
    <p><strong>Cliente:</strong> ${escapeHtml(order.customerName)}</p>
    <p><strong>Dirección:</strong> ${escapeHtml(order.customerAddress || "N/A")}</p>
  </div>`;
}

export function generateInvoiceHTML(order: InvoiceOrder): string {
  const rows = buildInvoiceRows(order.items);
  const info = buildInvoiceInfo(order);
  return `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8">
  <title>Comprobante de Compra #${order.id}</title>
  <style>${INVOICE_STYLES}</style></head><body>
  <div class="header"><h1>RASTUCI</h1><p>Comprobante de Compra</p>
  <p style="font-size:0.85em;color:#666;">Este documento es un comprobante de compra. La factura legal es emitida por AFIP/ARCA de forma electrónica.</p></div>
  ${info}
  <table><thead><tr><th>Producto</th><th>Cantidad</th><th>Precio Unitario</th><th>Subtotal</th></tr></thead>
  <tbody>${rows}</tbody></table>
  <div class="total"><p>TOTAL: ${formatCurrency(order.total)}</p></div>
  <div class="legal-notice">
    <p>Este comprobante no reemplaza a la factura electrónica oficial emitida por AFIP/ARCA.</p>
    <p>Derecho de arrepentimiento: podés cancelar tu compra dentro de los 10 días corridos de recibido el producto. Contactanos en nuestro sitio web.</p>
  </div></body></html>`;
}
