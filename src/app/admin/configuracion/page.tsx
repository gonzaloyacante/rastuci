"use client";

import { PageHeaderWithActions, TabLayout, TabPanel } from "@/components/admin";
import ContactForm from "@/components/forms/ContactForm";
import HomeForm from "@/components/forms/HomeForm";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import { useDocumentTitle } from "@/hooks";
import { Plus, Save, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

type TabType = "home" | "contacto" | "faqs" | "shipping" | "payment";

interface FAQ {
  question: string;
  answer: string;
}

interface ShippingOption {
  id: string;
  name: string;
  description: string;
  price: number;
  estimatedDays: string;
}

interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  description: string;
  requiresShipping?: boolean;
}

export default function ConfiguracionPage() {
  useDocumentTitle({ title: "Configuración del Sitio" });
  const [activeTab, setActiveTab] = useState<TabType>("home");
  const [loading, setLoading] = useState(false);

  // FAQs state
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loadingFaqs, setLoadingFaqs] = useState(true);

  // Shipping options state
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [loadingShipping, setLoadingShipping] = useState(true);

  // Payment methods state
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loadingPayment, setLoadingPayment] = useState(true);

  // Cargar FAQs
  useEffect(() => {
    if (activeTab === "faqs") {
      loadFaqs();
    }
  }, [activeTab]);

  // Cargar Shipping Options
  useEffect(() => {
    if (activeTab === "shipping") {
      loadShippingOptions();
    }
  }, [activeTab]);

  // Cargar Payment Methods
  useEffect(() => {
    if (activeTab === "payment") {
      loadPaymentMethods();
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

  const loadShippingOptions = async () => {
    try {
      setLoadingShipping(true);
      const res = await fetch("/api/settings/shipping-options");
      const data = await res.json();
      if (data.success) {
        setShippingOptions(data.data || []);
      }
    } catch (error) {
      console.error("Error loading shipping options:", error);
      toast.error("Error al cargar las opciones de envío");
    } finally {
      setLoadingShipping(false);
    }
  };

  const loadPaymentMethods = async () => {
    try {
      setLoadingPayment(true);
      const res = await fetch("/api/settings/payment-methods");
      const data = await res.json();
      if (data.success) {
        setPaymentMethods(data.data || []);
      }
    } catch (error) {
      console.error("Error loading payment methods:", error);
      toast.error("Error al cargar los métodos de pago");
    } finally {
      setLoadingPayment(false);
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

  const saveShippingOptions = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/settings/shipping-options", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(shippingOptions),
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Opciones de envío guardadas");
      } else {
        toast.error(data.error || "Error al guardar");
      }
    } catch (error) {
      console.error("Error saving shipping options:", error);
      toast.error("Error al guardar");
    } finally {
      setLoading(false);
    }
  };

  const savePaymentMethods = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/settings/payment-methods", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(paymentMethods),
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Métodos de pago guardados");
      } else {
        toast.error(data.error || "Error al guardar");
      }
    } catch (error) {
      console.error("Error saving payment methods:", error);
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
          { id: "home", label: "Inicio" },
          { id: "contacto", label: "Contacto" },
          { id: "faqs", label: "FAQs" },
          { id: "shipping", label: "Envío" },
          { id: "payment", label: "Pago" },
        ]}
        activeTab={activeTab}
        onTabChange={(id) => setActiveTab(id as TabType)}
      >
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

        <TabPanel id="shipping" activeTab={activeTab}>
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Opciones de Envío</h3>
                  <Button
                    size="sm"
                    onClick={() =>
                      setShippingOptions([
                        ...shippingOptions,
                        {
                          id: `option-${Date.now()}`,
                          name: "",
                          description: "",
                          price: 0,
                          estimatedDays: "",
                        },
                      ])
                    }
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar Opción
                  </Button>
                </div>

                {loadingShipping ? (
                  <div className="space-y-4">
                    {[1, 2].map((i) => (
                      <Skeleton key={i} className="h-48" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {shippingOptions.map((option, index) => (
                      <div
                        key={option.id}
                        className="p-4 border border-muted rounded-lg space-y-3"
                      >
                        <div className="flex justify-between items-start">
                          <h4 className="font-medium">
                            Opción #{index + 1}
                          </h4>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              setShippingOptions(
                                shippingOptions.filter((_, i) => i !== index)
                              )
                            }
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <Input
                            label="ID"
                            value={option.id}
                            onChange={(e) => {
                              const newOptions = [...shippingOptions];
                              newOptions[index].id = e.target.value;
                              setShippingOptions(newOptions);
                            }}
                            placeholder="standard"
                          />
                          <Input
                            label="Nombre"
                            value={option.name}
                            onChange={(e) => {
                              const newOptions = [...shippingOptions];
                              newOptions[index].name = e.target.value;
                              setShippingOptions(newOptions);
                            }}
                            placeholder="Envío estándar"
                          />
                        </div>
                        <Input
                          label="Descripción"
                          value={option.description}
                          onChange={(e) => {
                            const newOptions = [...shippingOptions];
                            newOptions[index].description = e.target.value;
                            setShippingOptions(newOptions);
                          }}
                          placeholder="Envío a domicilio en 3-5 días hábiles"
                        />
                        <div className="grid grid-cols-2 gap-3">
                          <Input
                            label="Precio (ARS)"
                            type="number"
                            value={option.price}
                            onChange={(e) => {
                              const newOptions = [...shippingOptions];
                              newOptions[index].price = Number(e.target.value);
                              setShippingOptions(newOptions);
                            }}
                            placeholder="1500"
                          />
                          <Input
                            label="Días estimados"
                            value={option.estimatedDays}
                            onChange={(e) => {
                              const newOptions = [...shippingOptions];
                              newOptions[index].estimatedDays = e.target.value;
                              setShippingOptions(newOptions);
                            }}
                            placeholder="3-5 días"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <Button
                  onClick={saveShippingOptions}
                  disabled={loading}
                  className="w-full"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? "Guardando..." : "Guardar Opciones de Envío"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabPanel>

        <TabPanel id="payment" activeTab={activeTab}>
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Métodos de Pago</h3>
                  <Button
                    size="sm"
                    onClick={() =>
                      setPaymentMethods([
                        ...paymentMethods,
                        {
                          id: `payment-${Date.now()}`,
                          name: "",
                          icon: "wallet",
                          description: "",
                          requiresShipping: true,
                        },
                      ])
                    }
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar Método
                  </Button>
                </div>

                {loadingPayment ? (
                  <div className="space-y-4">
                    {[1, 2].map((i) => (
                      <Skeleton key={i} className="h-40" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {paymentMethods.map((method, index) => (
                      <div
                        key={method.id}
                        className="p-4 border border-muted rounded-lg space-y-3"
                      >
                        <div className="flex justify-between items-start">
                          <h4 className="font-medium">Método #{index + 1}</h4>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              setPaymentMethods(
                                paymentMethods.filter((_, i) => i !== index)
                              )
                            }
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <Input
                            label="ID"
                            value={method.id}
                            onChange={(e) => {
                              const newMethods = [...paymentMethods];
                              newMethods[index].id = e.target.value;
                              setPaymentMethods(newMethods);
                            }}
                            placeholder="mercadopago"
                          />
                          <Input
                            label="Nombre"
                            value={method.name}
                            onChange={(e) => {
                              const newMethods = [...paymentMethods];
                              newMethods[index].name = e.target.value;
                              setPaymentMethods(newMethods);
                            }}
                            placeholder="MercadoPago"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <Input
                            label="Icono"
                            value={method.icon}
                            onChange={(e) => {
                              const newMethods = [...paymentMethods];
                              newMethods[index].icon = e.target.value;
                              setPaymentMethods(newMethods);
                            }}
                            placeholder="wallet"
                          />
                          <div>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={method.requiresShipping}
                                onChange={(e) => {
                                  const newMethods = [...paymentMethods];
                                  newMethods[index].requiresShipping =
                                    e.target.checked;
                                  setPaymentMethods(newMethods);
                                }}
                                className="w-4 h-4"
                              />
                              <span className="text-sm">Requiere envío</span>
                            </label>
                          </div>
                        </div>
                        <Input
                          label="Descripción"
                          value={method.description}
                          onChange={(e) => {
                            const newMethods = [...paymentMethods];
                            newMethods[index].description = e.target.value;
                            setPaymentMethods(newMethods);
                          }}
                          placeholder="Tarjetas, transferencias y más"
                        />
                      </div>
                    ))}
                  </div>
                )}

                <Button
                  onClick={savePaymentMethods}
                  disabled={loading}
                  className="w-full"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? "Guardando..." : "Guardar Métodos de Pago"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabPanel>
      </TabLayout>
    </div>
  );
}
