import { prisma } from "@/lib/prisma";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { LegalPolicyRenderer } from "@/components/ui/LegalPolicyRenderer";
import { PolicySection } from "@/lib/policy-utils";

export const metadata: Metadata = {
  title: "Política de Privacidad",
  description: "Política de privacidad y protección de datos de Rastuci",
};

async function getPrivacy() {
  const policy = await prisma.legalPolicy.findUnique({
    where: { slug: "politica-de-privacidad" },
  });
  return policy;
}

export default async function PrivacidadPage() {
  const policy = await getPrivacy();

  if (!policy || !policy.isActive) {
    notFound();
  }

  const content = policy.content as {
    sections: { title: string; content: string; items?: string[] }[];
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold text-content-primary mb-8 font-heading">
          {policy.title}
        </h1>

        <div className="prose prose-sm sm:prose lg:prose-lg max-w-none space-y-8 text-content-secondary">
          <LegalPolicyRenderer
            htmlContent={policy.htmlContent}
            content={content as { sections?: PolicySection[] } | null}
          />

          <section className="pt-8 border-t border-muted">
            <p className="text-sm text-content-tertiary">
              Última actualización:{" "}
              {new Date(policy.updatedAt).toLocaleDateString("es-AR", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
