/**
 * Interface representing the structure of a policy section from the frontend editor.
 */
export interface PolicySection {
  title: string;
  content?: string;
  bullets?: { text: string }[];
  items?: string[]; // Legacy support
}

/**
 * Generates a semantic HTML string from the structured JSON sections.
 * This is used to enable server-side rendering of policy content without
 * client-side JSON parsing or mapping.
 *
 * @param sections Array of policy sections
 * @returns HTML string representation of the policy
 */
export function generateHtmlContent(
  sections: PolicySection[] | undefined
): string {
  if (!sections || !Array.isArray(sections)) {
    return "";
  }

  return sections
    .map(
      (s) => `
    <section>
      <h2>${escapeHtml(s.title)}</h2>
      ${s.content ? `<p>${s.content.replace(/\n/g, "<br/>")}</p>` : ""}
      ${
        s.bullets && s.bullets.length > 0
          ? `<ul>${s.bullets.map((b) => `<li>${escapeHtml(b.text)}</li>`).join("")}</ul>`
          : s.items && s.items.length > 0
            ? `<ul>${s.items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`
            : ""
      }
    </section>
  `
    )
    .join("");
}

/**
 * Basic HTML escaping to prevent XSS when generating HTML from user input
 */
function escapeHtml(text: string): string {
  if (!text) return "";
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
