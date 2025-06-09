/**
 * Decodifica un JWT sin verificar la firma.
 * @param {string} token - El JWT.
 * @returns {object|null} - El payload decodificado o null si falla.
 */
export function decodeJWT(token) {
  try {
    const payloadBase64Url = token.split('.')[1];
    if (!payloadBase64Url) return null;

    // Convertir Base64URL a Base64
    const payloadBase64 = payloadBase64Url.replace(/-/g, '+').replace(/_/g, '/');

    // Decodificar Base64
    const payloadJson = atob(payloadBase64);

    // Parsear JSON
    return JSON.parse(payloadJson);
  } catch (e) {
    return null;
  }
}

/**
 * Verifica si el token ha expirado (basado en el claim exp).
 * @param {string} token - El JWT.
 * @returns {object|null} - El payload si no ha expirado, o null si expiró o inválido.
 */
function verifyJWT(token) {
  const payload = decodeJWT(token);
  if (!payload) {
    console.log('Token inválido');
    return null;
  }

  // Verificar expiración (exp viene en segundos desde epoch)
  const now = Math.floor(Date.now() / 1000);
  if (payload.exp && payload.exp < now) {
    console.log('El token ha expirado');
    return null;
  }

  return payload;
}