"use client";

import { PageHeaderWithActions, TabLayout, TabPanel } from "@/components/admin";
import ContactForm from "@/components/forms/ContactForm";
import HomeForm from "@/components/forms/HomeForm";
import StoreForm from "@/components/forms/StoreForm";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import { useDocumentTitle } from "@/hooks";
import { Plus, Save, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

type TabType = "tienda" | "home" | "contacto" | "faqs" | "envios";

interface FAQ {
  question: string;
  answer: string;
}

export default function ConfiguracionPage() {
  useDocumentTitle({ title: "Configuración del Sitio" });
  const [activeTab, setActiveTab] = useState<TabType>("tienda");
  const [loading, setLoading] = useState(false);

  // FAQs state
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loadingFaqs, setLoadingFaqs] = useState(true);

  // Cargar FAQs
  useEffect(() => {
    if (activeTab === "faqs") {
      loadFaqs();
    }
  }, [activeTab]);

  const loadFaqs = async () => {
    try {
      setLoadingFaqs(true);
      const res = await fetch("/api/settings/faqs");
      const data = await res.json();
      if (data.success) {
        setFaqs(data.data || []);
      }
    } catch (error) {
      console.error("Error loading FAQs:", error);
      toast.error("Error al cargar las FAQs");
    } finally {
      setLoadingFaqs(false);
    }
  };

  const saveFaqs = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/settings/faqs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(faqs),
      });

      const data = await res.json();
      if (data.success) {
        toast.success("FAQs guardadas exitosamente");
      } else {
        toast.error(data.error || "Error al guardar");
      }
    } catch (error) {
      console.error("Error saving FAQs:", error);
      toast.error("Error al guardar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeaderWithActions
        title="Configuración del Sitio"
        subtitle="Gestiona el contenido y configuración de tu tienda"
      />

      <TabLayout
        tabs={[
          { id: "tienda", label: "Tienda y Envíos" },
          { id: "home", label: "Inicio" },
          { id: "contacto", label: "Contacto" },
          { id: "faqs", label: "FAQs" },
          { id: "envios", label: "Envío Gratis (Promo)" },
        ]}
        activeTab={activeTab}
        onTabChange={(id) => setActiveTab(id as TabType)}
      >
        <TabPanel id="tienda" activeTab={activeTab}>
          <Card>
            <CardContent className="p-6">
              <StoreForm />
            </CardContent>
          </Card>
        </TabPanel>

        <TabPanel id="home" activeTab={activeTab}>
          <Card>
            <CardContent className="p-6">
              <HomeForm />
            </CardContent>
          </Card>
        </TabPanel>

        <TabPanel id="contacto" activeTab={activeTab}>
          <Card>
            <CardContent className="p-6">
              <ContactForm />
            </CardContent>
          </Card>
        </TabPanel>

        <TabPanel id="faqs" activeTab={activeTab}>
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Preguntas Frecuentes</h3>
                  <Button
                    size="sm"
                    onClick={() =>
                      setFaqs([...faqs, { question: "", answer: "" }])
                    }
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar FAQ
                  </Button>
                </div>

                {loadingFaqs ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-32" />
                    ))}
                  </div>
                ) : faqs.length === 0 ? (
                  <p className="text-muted text-center py-8">
                    No hay FAQs. Agrega la primera pregunta frecuente.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {faqs.map((faq, index) => (
                      <div
                        key={index}
                        className="p-4 border border-muted rounded-lg space-y-3"
                      >
                        <div className="flex justify-between items-start">
                          <h4 className="font-medium">FAQ #{index + 1}</h4>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              setFaqs(faqs.filter((_, i) => i !== index))
                            }
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        <Input
                          label="Pregunta"
                          value={faq.question}
                          onChange={(e) => {
                            const newFaqs = [...faqs];
                            newFaqs[index].question = e.target.value;
                            setFaqs(newFaqs);
                          }}
                          placeholder="¿Cuál es el tiempo de entrega?"
                        />
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Respuesta
                          </label>
                          <textarea
                            value={faq.answer}
                            onChange={(e) => {
                              const newFaqs = [...faqs];
                              newFaqs[index].answer = e.target.value;
                              setFaqs(newFaqs);
                            }}
                            placeholder="Los envíos tardan entre 3 a 7 días hábiles..."
                            className="w-full min-h-[100px] p-3 surface border border-muted rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <Button onClick={saveFaqs} disabled={loading} className="w-full">
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? "Guardando..." : "Guardar FAQs"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabPanel>

        <TabPanel id="envios" activeTab={activeTab}>
          <Card>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Promoción de Envío Gratis</h3>
                  <p className="text-sm text-muted mb-4">
                    Activa esta opción para ofrecer envío gratis en todos los pedidos.
                    El costo real del envío se mostrará tachado como descuento en el checkout.
                  </p>
                </div>

                <div className="p-4 border border-muted rounded-lg">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <div>
                      <div className="font-medium">Activar Envío Gratis</div>
                      <div className="text-sm text-muted">
                        Los clientes verán el costo de envío tachado y "ENVÍO GRATIS" destacado
                      </div>
                    </div>
                  </label>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">ℹ️ Cómo funciona</h4>
                  <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                    <li>El cliente elige su sucursal de envío normalmente</li>
                    <li>El costo real se calcula con la API de Correo Argentino</li>
                    <li>Se muestra el precio tachado con badge "ENVÍO GRATIS"</li>
                    <li>El total final NO incluye el costo de envío</li>
                    <li>Ideal para promociones de Black Friday, Navidad, etc.</li>
                  </ul>
                </div>

                <Button onClick={() => toast.success("Configuración guardada")} disabled={loading} className="w-full">
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? "Guardando..." : "Guardar Configuración"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabPanel>
      </TabLayout>
    </div>
  );
}
