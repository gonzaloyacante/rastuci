import { Metadata } from 'next';
import { Suspense } from 'react';
import ContactPageClient from './client-page';

export const metadata: Metadata = {
  title: 'Contacto - Rastuci',
  description: 'Ponte en contacto con Rastuci. Encuentra nuestros horarios, ubicación y formas de comunicarte con nosotros.',
  keywords: 'contacto, Rastuci, atención al cliente, horarios, ubicación, teléfono, email',
  openGraph: {
    title: 'Contacto - Rastuci',
    description: 'Ponte en contacto con Rastuci. Estamos aquí para ayudarte.',
    type: 'website',
  },
  alternates: {
    canonical: '/contacto',
  },
};

const ContactPageSkeleton = () => (
  <div className="min-h-screen surface">
    <main className="max-w-[1200px] mx-auto py-8 px-6">
      {/* Header Skeleton */}
      <div className="text-center mb-12">
        <div className="h-12 surface-secondary rounded animate-pulse w-96 mx-auto mb-4" />
        <div className="h-6 surface-secondary rounded animate-pulse w-full max-w-2xl mx-auto" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Contact Info Skeleton */}
        <div>
          <div className="h-8 surface-secondary rounded animate-pulse w-64 mb-6" />
          <div className="space-y-6">
            {[...Array(4)].map(() => (
              <div key={`contact-info-${Math.random()}`} className="surface border border-muted rounded-lg p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 surface-secondary rounded-full animate-pulse" />
                  <div className="flex-1">
                    <div className="h-6 surface-secondary rounded animate-pulse w-24 mb-2" />
                    <div className="h-4 surface-secondary rounded animate-pulse w-32" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Form Skeleton */}
        <div>
          <div className="h-8 surface-secondary rounded animate-pulse w-48 mb-6" />
          <div className="surface border border-muted rounded-lg p-8">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="h-4 surface-secondary rounded animate-pulse w-16 mb-2" />
                  <div className="h-12 surface-secondary rounded animate-pulse w-full" />
                </div>
                <div>
                  <div className="h-4 surface-secondary rounded animate-pulse w-16 mb-2" />
                  <div className="h-12 surface-secondary rounded animate-pulse w-full" />
                </div>
              </div>
              <div>
                <div className="h-4 surface-secondary rounded animate-pulse w-16 mb-2" />
                <div className="h-12 surface-secondary rounded animate-pulse w-full" />
              </div>
              <div>
                <div className="h-4 surface-secondary rounded animate-pulse w-16 mb-2" />
                <div className="h-32 surface-secondary rounded animate-pulse w-full" />
              </div>
              <div className="h-12 surface-secondary rounded animate-pulse w-full" />
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Skeleton */}
      <div className="mt-16">
        <div className="h-10 surface-secondary rounded animate-pulse w-80 mx-auto mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map(() => (
            <div key={`faq-skeleton-${Math.random()}`} className="surface border border-muted rounded-lg p-6">
              <div className="h-6 surface-secondary rounded animate-pulse w-3/4 mb-3" />
              <div className="h-4 surface-secondary rounded animate-pulse w-full mb-2" />
              <div className="h-4 surface-secondary rounded animate-pulse w-2/3" />
            </div>
          ))}
        </div>
      </div>
    </main>
  </div>
);

export default function ContactPage() {
  return (
    <Suspense fallback={<ContactPageSkeleton />}>
      <ContactPageClient />
    </Suspense>
  );
}
