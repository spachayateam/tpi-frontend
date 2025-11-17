import { decodeJWT } from "./jwt-decode.js";
import endpoint from "./endpoint.js";

async function mostrarHistorial() {
    const token = localStorage.getItem('session');
    const userId = decodeJWT(token).userId;

    const response = await fetch(`${endpoint}/historial`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "userId": userId,
            "Authorization": `Bearer ${token}`,
        },
    });

    const turnosGuardados = await response.json();

    const historialTurnosEl = document.getElementById("historialTurnos");
    if (historialTurnosEl) {
        const idsVistos = new Set();

        const turnosUnicos = turnosGuardados.filter(user => {
            if (idsVistos.has(user.userId)) return false;
            idsVistos.add(user.userId);
            return true;
        });
        historialTurnosEl.innerHTML = turnosUnicos.map((user) => `
            <a href="historial.html?userId=${user.userId}" style="background: #fff; text-decoration: none; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 400px; margin: 20px auto; padding: 20px; text-align: center; transition: transform 0.2s ease;">
                <p style="color: #333">Ver el historial de</p>
                <h3 style="font-size: 1.5rem; margin-bottom: 10px; color: #333; text-transform: uppercase;">${user.name}</h3>
                <p style="font-size: 1rem; color: #555;"><strong>Email:</strong> ${user.email}</p>
            </a>
        `).join("");
    }

    const historialEl = document.getElementById("historial");
    const params = new URLSearchParams(window.location.search);
    const userIdParams = Number(params.get('userId'));
    if (historialEl) {
        const turnosFiltrados = turnosGuardados.filter(turno => turno.userId == userIdParams);
        historialEl.innerHTML = turnosFiltrados.map((turno) => `
            <div style="background: #fff; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 500px; margin: 20px auto; padding: 20px; font-family: sans-serif;">
                <h2 style="margin-bottom: 10px; color: #333;">${turno.name}</h2>
                <p style="margin: 4px 0; color: #555;"><strong>Tipo de cita:</strong> ${turno.mode}</p>
                <p style="margin: 4px 0; color: #555;"><strong>Profesional:</strong> ${turno.professional}</p>
                <p style="margin: 4px 0; color: #555;"><strong>Email:</strong> ${turno.email}</p>
                <p style="margin: 4px 0; color: #555;"><strong>Fecha:</strong> ${new Date(turno.date).toLocaleDateString()}</p>
                <p style="margin: 4px 0; color: #555;"><strong>Hora:</strong> ${turno.time}</p>
                <p style="margin: 4px 0; color: #555;"><strong>Duración:</strong> ${turno.duration}</p>
                <p style="margin: 4px 0; color: #555;"><strong>Estado:</strong> ${turno.state}</p>
                <p style="margin: 4px 0; color: #555;"><strong>Pago:</strong> ${turno.payment_method}</p>
                <p style="margin: 4px 0; color: #aaa;"><small>Creado: ${new Date(turno.created_at).toLocaleString()}</small></p>
            </div>
        `).join("");
    }
}

mostrarHistorial();
