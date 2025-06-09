import { decodeJWT } from "./jwt-decode.js";

const session = localStorage.getItem('session');
const tokenPayload = decodeJWT(session);

if (tokenPayload.role !== 'ADMIN') {
  window.location.href = '/index.html';
}