"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { useSettings } from "@/hooks/useSettings";
import { StoreSettings } from "@/lib/validation/store";
import { toast } from "react-hot-toast";
import { Loader2, CheckCircle, Copy } from "lucide-react";
import Link from "next/link";

interface OrderDetails {
  id: string;
  total: number;
  status: string;
  customerName: string;
  paymentMethod: string;
}

export default function TransferPaymentPage() {
  const params = useParams();
  const router = useRouter();
  const { settings, loading: loadingSettings } =
    useSettings<StoreSettings>("store");

  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [senderName, setSenderName] = useState("");
  // For MVP, we simulate file upload or just ask for transaction ID / URL
  // "Upload" usually requires an S3/Cloudinary setup.
  // We'll stick to a simple "Transaction ID / Comprobante" text field or URL for now
  // unless we have an upload endpoint ready.
  // Given the context, we'll ask for "Transaction ID or Link" and "Sender Name".
  const [transactionId, setTransactionId] = useState("");

  useEffect(() => {
    if (params.id) {
      fetch(`/api/orders/${params.id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.id) {
            setOrder(data);
          } else {
            toast.error("Orden no encontrada");
          }
        })
        .catch(() => toast.error("Error cargando orden"))
        .finally(() => setLoading(false));
    }
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/orders/${order.id}/confirm-transfer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderName,
          transactionId,
        }),
      });

      if (!res.ok) throw new Error("Error al enviar comprobante");

      toast.success("Comprobante enviado con éxito");
      router.push(`/checkout/success?orderId=${order.id}&method=transfer`);
    } catch {
      toast.error("Error al enviar. Intenta nuevamente.");
    } finally {
      setSubmitting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copiado al portapapeles");
  };

  if (loading || loadingSettings) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold">Orden no encontrada</h2>
        <Link href="/" className="text-primary hover:underline mt-4 block">
          Volver a la tienda
        </Link>
      </div>
    );
  }

  // Determine if we should show the form (only if waiting for proof)
  const showForm = order.status === "WAITING_TRANSFER_PROOF";

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-surface rounded-xl border border-border overflow-hidden shadow-sm">
        {/* Header */}
        <div className="bg-primary/5 p-6 border-b border-border">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-primary">
                Pago por Transferencia
              </h1>
              <p className="text-content-secondary mt-1">
                Orden #{order.id.slice(-6)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-content-secondary">Total a Pagar</p>
              <p className="text-2xl font-bold text-content-primary">
                ${order.total.toLocaleString("es-AR")}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-8">
          {/* Bank Details */}
          <section className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              🏦 Datos Bancarios
            </h3>
            <div className="bg-surface-secondary p-4 rounded-lg border border-border space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-border/50">
                <span className="text-content-secondary">Banco</span>
                <span className="font-medium">
                  {settings?.payments?.bankName || "Consultar"}
                </span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-border/50">
                <span className="text-content-secondary">Titular</span>
                <span className="font-medium text-right">
                  {settings?.payments?.bankHolder || "-"}
                </span>
              </div>
              <div
                className="flex justify-between items-center group cursor-pointer"
                onClick={() =>
                  copyToClipboard(settings?.payments?.bankCbu || "")
                }
              >
                <span className="text-content-secondary">CBU / CVU</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-medium text-primary">
                    {settings?.payments?.bankCbu || "No configurado"}
                  </span>
                  <Copy className="w-4 h-4 text-content-tertiary group-hover:text-primary transition-colors" />
                </div>
              </div>
              <div
                className="flex justify-between items-center group cursor-pointer pt-2"
                onClick={() =>
                  copyToClipboard(settings?.payments?.bankAlias || "")
                }
              >
                <span className="text-content-secondary">Alias</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-medium text-primary">
                    {settings?.payments?.bankAlias || "No configurado"}
                  </span>
                  <Copy className="w-4 h-4 text-content-tertiary group-hover:text-primary transition-colors" />
                </div>
              </div>
            </div>
            <p className="text-sm text-center text-content-secondary">
              Realiza la transferencia por el monto exacto de{" "}
              <strong>${order.total.toLocaleString("es-AR")}</strong>
            </p>
          </section>

          {/* Proof Upload Form */}
          {showForm ? (
            <section className="space-y-4 pt-4 border-t border-border">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                📂 Informar Pago
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="sender">
                    Nombre del Titular de la Cuenta (Origen)
                  </Label>
                  <Input
                    id="sender"
                    placeholder="Desde qué cuenta transferiste..."
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="transactionId">
                    Nro. de Comprobante / ID Operación
                  </Label>
                  <Input
                    id="transactionId"
                    placeholder="Ej: 12345678"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    required
                  />
                  <p className="text-xs text-content-secondary">
                    Ingresa el ID de la operación que figura en tu comprobante.
                  </p>
                </div>

                <div className="pt-4">
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="w-full h-12 text-lg"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5 mr-2" />
                        Confirmar Pago
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </section>
          ) : (
            <div className="text-center py-6 bg-green-50 text-green-800 rounded-lg">
              <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-600" />
              <h3 className="font-bold text-lg">¡Comprobante Enviado!</h3>
              <p>
                Tu pago está en revisión. Te notificaremos cuando sea aprobado.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
