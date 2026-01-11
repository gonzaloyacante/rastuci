"use client";

import { Card, CardContent } from "@/components/ui/Card";
// import { logger } from "@/lib/logger";
import {
  type ContactSettings,
  defaultContactSettings,
} from "@/lib/validation/contact";
// import { Clock, Loader2, Mail, MapPin, Phone } from "lucide-react";
import { Clock, Mail, MapPin, Phone } from "lucide-react"; // Loader2 unused
// import useSWR from "swr";
import { PublicContactForm } from "@/components/contact/PublicContactForm";
import { FaqSection } from "@/components/contact/FaqSection";
import { SocialLinks } from "@/components/contact/SocialLinks";

// Fetcher para SWR (Unused)
// const fetcher = async (url: string): Promise<ContactSettings> => {
//   const res = await fetch(url);
//   const json = await res.json();
//   if (json?.success && json.data) {
//     return json.data;
//   }
//   return defaultContactSettings;
// };

const ContactInfo = ({ contact }: { contact: ContactSettings }) => (
  <div>
    <h2 className="text-2xl mb-6 font-montserrat">Información de Contacto</h2>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6">
      <Card className="surface border border-theme rounded-xl shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-200">
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <div className="pill-icon">
              <Mail size={24} />
            </div>
            <div>
              <h3 className="text-lg mb-2 font-montserrat">Email</h3>
              {contact.emails.map((em) => (
                <p className="muted" key={`email-${em}`}>
                  {em}
                </p>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="surface border border-theme rounded-xl shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-200">
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <div className="pill-icon">
              <Phone size={24} />
            </div>
            <div>
              <h3 className="text-lg mb-2 font-montserrat">Teléfono</h3>
              {contact.phones.map((ph) => (
                <p className="muted" key={`phone-${ph}`}>
                  {ph}
                </p>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="surface border border-theme rounded-xl shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-200">
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <div className="pill-icon">
              <MapPin size={24} />
            </div>
            <div>
              <h3 className="text-lg mb-2 font-montserrat">Ubicación</h3>
              {/* Solo mostramos ciudad/país para mantener privacidad */}
              <p className="muted">{contact.address.cityCountry}</p>
              <p className="text-xs text-muted-foreground mt-1">
                La dirección exacta se proporciona al coordinar el retiro
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="surface border border-theme rounded-xl shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-200">
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <div className="pill-icon">
              <Clock size={24} />
            </div>
            <div>
              <h3 className="text-lg mb-2 font-montserrat">
                {contact.hours.title}
              </h3>
              <p className="muted">{contact.hours.weekdays}</p>
              <p className="muted">{contact.hours.saturday}</p>
              <p className="muted">{contact.hours.sunday}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
);

export default function ContactPageClient({
  contact,
}: {
  contact: ContactSettings;
}) {
  // Los datos vienen del servidor, son obligatorios desde la DB
  const contactData = contact;

  return (
    <div className="min-h-screen surface">
      <main className="max-w-[1200px] mx-auto py-8 px-6">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl mb-4 font-heading text-base-primary">
            {contactData.headerTitle}
          </h1>
          <p className="muted text-lg max-w-2xl mx-auto">
            {contactData.headerSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <ContactInfo contact={contactData} />

          {/* Contact Form */}
          <PublicContactForm contact={contactData} />
        </div>

        {/* FAQ Section */}
        <FaqSection />

        {/* Social links */}
        <SocialLinks contact={contactData} />
      </main>
    </div>
  );
}
