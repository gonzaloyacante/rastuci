import { PolicySection } from "@/lib/policy-utils";

interface LegalPolicyRendererProps {
  htmlContent?: string | null;
  content?: { sections?: PolicySection[] } | null;
}

export function LegalPolicyRenderer({
  htmlContent,
  content,
}: LegalPolicyRendererProps) {
  if (htmlContent) {
    return (
      <div
        className="prose prose-sm sm:prose lg:prose-lg max-w-none text-content-secondary"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    );
  }

  if (content?.sections) {
    return (
      <>
        {content.sections.map((section, index) => (
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
            {section.bullets && section.bullets.length > 0 && (
              <ul className="list-disc pl-5 space-y-2 mt-2">
                {section.bullets.map((b, i) => (
                  <li
                    key={i}
                    dangerouslySetInnerHTML={{
                      __html: b.text,
                    }}
                  />
                ))}
              </ul>
            )}
          </section>
        ))}
      </>
    );
  }

  return null;
}
