/**
 * Genera un ID único que funciona en TODOS los contextos (HTTP, HTTPS, localhost, móvil).
 * crypto.randomUUID() falla en contextos no-seguros (HTTP desde la red local).
 */
export function generateId(): string {
  // Fallback universal: timestamp + random
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 10);
  const extra = Math.random().toString(36).substring(2, 6);
  return `${timestamp}-${random}${extra}`;
}
