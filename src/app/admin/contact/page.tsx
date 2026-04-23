"use client";

import { PageHeaderWithActions, TabLayout, TabPanel } from "@/components/admin";
import { ContactMessagesList } from "@/components/admin/contact/ContactMessagesList";
import ContactForm from "@/components/forms/ContactForm";
import { useDocumentTitle } from "@/hooks";
import { useTabWithUrl } from "@/hooks/useTabWithUrl";

type TabType = "mensajes" | "configuracion";

const TABS = [
  { id: "mensajes", label: "Mensajes" },
  { id: "configuracion", label: "Configuración" },
];

export default function AdminContactPage() {
  useDocumentTitle({ title: "Contacto" });
  const [activeTab, setActiveTab] = useTabWithUrl("mensajes");

  return (
    <div className="space-y-6">
      <PageHeaderWithActions
        title="Contacto"
        subtitle="Gestiona mensajes y configuración de contacto"
      />

      <TabLayout
        tabs={TABS}
        activeTab={activeTab}
        onTabChange={(id) => setActiveTab(id as TabType)}
      >
        <TabPanel id="mensajes" activeTab={activeTab}>
          <ContactMessagesList />
        </TabPanel>

        <TabPanel id="configuracion" activeTab={activeTab}>
          <ContactForm />
        </TabPanel>
      </TabLayout>
    </div>
  );
}
