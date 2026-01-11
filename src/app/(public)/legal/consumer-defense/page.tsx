import { prisma } from "@/lib/prisma";
import { Metadata } from "next";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Defensa al Consumidor",
  description: "Derechos del consumidor y normativa aplicable en Rastuci",
};

async function getDefense() {
  const policy = await prisma.legalPolicy.findUnique({
    where: { slug: "defensa-al-consumidor" },
  });
  return policy;
}

export default async function DefensaConsumidorPage() {
  const policy = await getDefense();

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
          {content?.sections?.map((section, index) => (
            <section key={index} className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-semibold text-content-primary font-heading">
                {section.title}
              </h2>
              {section.content && (
                <div
                  dangerouslySetInnerHTML={{
                    __html: section.content.replace(/\n/g, "<br/>"),
                  }}
                />
              )}

              {section.items && section.items.length > 0 && (
                <ul className="list-disc pl-5 space-y-2 mt-2">
                  {section.items.map((item, i) => (
                    <li
                      key={i}
                      dangerouslySetInnerHTML={{
                        __html: item,
                      }}
                    />
                  ))}
                </ul>
              )}
            </section>
          ))}

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
