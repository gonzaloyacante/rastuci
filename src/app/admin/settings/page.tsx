"use client";

import { useToast } from "@/components/ui/Toast";
import { PageHeaderWithActions, TabLayout, TabPanel } from "@/components/admin";
import ContactForm from "@/components/forms/ContactForm";
import HomeForm from "@/components/forms/HomeForm";
import StoreForm from "@/components/forms/StoreForm";
import VacationSettingsForm from "@/components/forms/VacationSettings";
import PaymentSettings from "@/components/forms/PaymentSettings";
import StockSettings from "@/components/forms/StockSettings";
import ShippingSettings from "@/components/forms/ShippingSettings";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import { useDocumentTitle } from "@/hooks";
import { useTabWithUrl } from "@/hooks/useTabWithUrl";
import { useSettings } from "@/hooks/useSettings";
import { Plus, Trash2, Save } from "lucide-react";

import { useEffect, useState } from "react";

type TabType =
  | "tienda"
  | "pagos"
  | "stock"
  | "envios"
  | "contacto"
  | "home"
  | "faqs"
  | "vacaciones";

interface FAQ {
  question: string;
  answer: string;
}

export default function ConfiguracionPage() {
  useDocumentTitle({ title: "Configuración del Sitio" });
  const [activeTab, setActiveTab] = useTabWithUrl("tienda");
  const { show } = useToast();
  const [loading, setLoading] = useState(false);

  // FAQs state
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loadingFaqs, setLoadingFaqs] = useState(true);

  // SWR Hook for FAQs
  const {
    settings: faqsData,
    loading: loadingFaqsData,
    mutate: mutateFaqs,
  } = useSettings<FAQ[]>("faqs");

  // Sync state with SWR data
  useEffect(() => {
    if (faqsData) {
      setFaqs(faqsData);
      setLoadingFaqs(false);
    }
  }, [faqsData]);

  // Handle loading
  useEffect(() => {
    setLoadingFaqs(loadingFaqsData);
  }, [loadingFaqsData]);

  // Remove manual loadFaqs function as it's handled by SWR
  // const loadFaqs = ... (removed)

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
        show({ type: "success", message: "FAQs guardadas exitosamente" });
        mutateFaqs(); // Refresh cache
      } else {
        show({ type: "error", message: data.error || "Error al guardar" });
      }
    } catch (error) {
      console.error("Error saving FAQs:", error);
      show({ type: "error", message: "Error al guardar" });
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
          { id: "tienda", label: "Tienda (Identidad)" },
          { id: "pagos", label: "Pagos & Vencimientos" },
          { id: "stock", label: "Inventario & Stock" },
          { id: "envios", label: "Envíos y Logística" },
          { id: "vacaciones", label: "Vacaciones" },
          { id: "contacto", label: "Contacto" },
          { id: "home", label: "Inicio" },
          { id: "faqs", label: "FAQs" },
        ]}
        activeTab={activeTab}
        onTabChange={(id) => setActiveTab(id as TabType)}
      >
        <TabPanel id="tienda" activeTab={activeTab}>
          <Card>
            <CardContent className="p-4 md:p-6">
              <StoreForm />
            </CardContent>
          </Card>
        </TabPanel>

        <TabPanel id="pagos" activeTab={activeTab}>
          <Card>
            <CardContent className="p-4 md:p-6">
              <PaymentSettings />
            </CardContent>
          </Card>
        </TabPanel>

        <TabPanel id="stock" activeTab={activeTab}>
          <Card>
            <CardContent className="p-4 md:p-6">
              <StockSettings />
            </CardContent>
          </Card>
        </TabPanel>

        <TabPanel id="envios" activeTab={activeTab}>
          <Card>
            <CardContent className="p-4 md:p-6">
              <ShippingSettings />
            </CardContent>
          </Card>
        </TabPanel>

        <TabPanel id="vacaciones" activeTab={activeTab}>
          <VacationSettingsForm />
        </TabPanel>

        <TabPanel id="contacto" activeTab={activeTab}>
          <Card>
            <CardContent className="p-4 md:p-6">
              <ContactForm />
            </CardContent>
          </Card>
        </TabPanel>

        <TabPanel id="home" activeTab={activeTab}>
          <Card>
            <CardContent className="p-4 md:p-6">
              <HomeForm />
            </CardContent>
          </Card>
        </TabPanel>

        <TabPanel id="faqs" activeTab={activeTab}>
          <Card>
            <CardContent className="p-4 md:p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">
                    Preguntas Frecuentes
                  </h3>
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

                <Button
                  onClick={saveFaqs}
                  disabled={loading}
                  className="w-full"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? "Guardando..." : "Guardar FAQs"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabPanel>
      </TabLayout>
    </div>
  );
}
