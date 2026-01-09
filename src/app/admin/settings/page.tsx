import ShippingSettings from "@/components/forms/ShippingSettings";
// ...
export default function ConfiguracionPage() {
  useDocumentTitle({ title: "Configuración del Sitio" });
  const [activeTab, setActiveTab] = useState<TabType>("tienda");
  const [loading, setLoading] = useState(false);

  // FAQs state ...

  return (
    <div className="space-y-6">
      <PageHeaderWithActions
        title="Configuración del Sitio"
        subtitle="Gestiona el contenido y configuración de tu tienda"
      />

      <TabLayout
        tabs={[
          { id: "tienda", label: "Tienda (Identidad)" },
          { id: "envios", label: "Envíos y Logística" },
          { id: "contacto", label: "Contacto" },
          { id: "home", label: "Inicio" },
          { id: "faqs", label: "FAQs" },
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

        <TabPanel id="envios" activeTab={activeTab}>
          <Card>
            <CardContent className="p-6">
              <ShippingSettings />
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

        <TabPanel id="home" activeTab={activeTab}>

          <TabPanel id="faqs" activeTab={activeTab}>
            <Card>
              <CardContent className="p-6">
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

          <TabPanel id="envios" activeTab={activeTab}>
            <ShippingPromoSettings />
          </TabPanel>
      </TabLayout>
    </div>
  );
}

function ShippingPromoSettings() {
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/settings/store")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setEnabled(data.data.shipping?.freeShipping || false);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      // First get current settings to avoid overwriting other fields
      const currentRes = await fetch("/api/settings/store");
      const currentData = await currentRes.json();

      if (!currentData.success) throw new Error("Error al leer configuración");

      const newSettings = {
        ...currentData.data,
        shipping: {
          ...currentData.data.shipping,
          freeShipping: enabled,
        },
      };

      const res = await fetch("/api/settings/store", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSettings),
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Configuración actualizada");
      } else {
        toast.error(data.error || "Error al guardar");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Skeleton className="h-64 w-full" />;

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">
              Promoción de Envío Gratis
            </h3>
            <p className="text-sm text-muted mb-4">
              Activa esta opción para ofrecer envío gratis en todos los pedidos.
              El costo real del envío se mostrará tachado como descuento en el
              checkout.
            </p>
          </div>

          <div className="p-4 border border-muted rounded-lg surface">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={enabled}
                onChange={(e) => setEnabled(e.target.checked)}
                className="w-5 h-5 rounded border-muted text-primary focus:ring-primary"
              />
              <div>
                <div className="font-medium text-content-primary">
                  Activar Envío Gratis
                </div>
                <div className="text-sm text-muted">
                  Los clientes verán el costo de envío tachado y "ENVÍO GRATIS"
                  destacado
                </div>
              </div>
            </label>
          </div>

          <Alert
            inline
            variant="info"
            title="Cómo funciona"
            isOpen={true}
            onClose={() => { }}
            message=""
          >
            <ul className="text-sm space-y-1 list-disc list-inside mt-1">
              <li>El cliente elige su sucursal de envío normalmente</li>
              <li>El costo real se calcula con la API de Correo Argentino</li>
              <li>Se muestra el precio tachado con badge "ENVÍO GRATIS"</li>
              <li>El total final NO incluye el costo de envío</li>
              <li>Ideal para promociones de Black Friday, Navidad, etc.</li>
            </ul>
          </Alert>

          <Button onClick={handleSave} disabled={saving} className="w-full">
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Guardando..." : "Guardar Configuración"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
