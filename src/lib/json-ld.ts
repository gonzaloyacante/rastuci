/**
 * Serializa un objeto a string JSON-LD escapando `<` para prevenir inyección
 * de `</script>` en bloques JSON-LD incrustados en HTML.
 *
 * Usar siempre en lugar de `JSON.stringify(data).replace(...)` inline para
 * satisfacer las reglas de Codacy/Opengrep sobre dangerouslySetInnerHTML.
 */
export function safeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
