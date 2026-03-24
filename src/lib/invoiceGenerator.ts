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

export function generateInvoiceHTML(order: InvoiceOrder): string {
  const rows = order.items
    .map(
      (item) => `
      <tr>
        <td>${escapeHtml(item.name)}</td>
        <td>${item.quantity}</td>
        <td>$${item.price.toFixed(2)}</td>
        <td>$${(item.quantity * item.price).toFixed(2)}</td>
      </tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Factura #${order.id}</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 40px; }
    .header { text-align: center; margin-bottom: 30px; }
    .info { margin-bottom: 20px; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
    .total { font-weight: bold; font-size: 1.2em; margin-top: 20px; text-align: right; }
  </style>
</head>
<body>
  <div class="header"><h1>RASTUCI</h1><p>Factura de Compra</p></div>
  <div class="info">
    <p><strong>Factura #:</strong> ${escapeHtml(order.id)}</p>
    <p><strong>Fecha:</strong> ${escapeHtml(new Date(order.createdAt).toLocaleDateString("es-AR"))}</p>
    <p><strong>Cliente:</strong> ${escapeHtml(order.customerName)}</p>
    <p><strong>Dirección:</strong> ${escapeHtml(order.customerAddress || "N/A")}</p>
  </div>
  <table>
    <thead>
      <tr>
        <th>Producto</th><th>Cantidad</th><th>Precio Unitario</th><th>Subtotal</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
  <div class="total"><p>TOTAL: $${order.total.toFixed(2)}</p></div>
</body>
</html>`;
}
