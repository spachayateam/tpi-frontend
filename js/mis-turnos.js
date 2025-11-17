import { deleteTurno, getTurnos } from "./api.js";
import { decodeJWT } from "./jwt-decode.js";

async function obtenerTurnos() {
  try {
    const turnos = await getTurnos();
    return turnos;
  } catch (error) {
    if (error.status === 401) {
      alert("Sesión expirada, por favor, inicia sesión nuevamente");
      window.location.href = "/pages/sesion.html";
    } else {
      alert("Error al recuperar turnos");
    }
  }
}

async function eliminarTurno(tokenTurno) {
  try {
    await deleteTurno(tokenTurno);
    alert("Turno eliminado");

    const turnos = await obtenerTurnos();
    mostrarTurnos(turnos);
  } catch (error) {
    if (error.status === 401) {
      alert("Sesión expirada, por favor, inicia sesión nuevamente");
      window.location.href = "/pages/sesion.html";
    } else {
      alert("Error al eliminar turno");
    }
  }
}

function mostrarTurnos(turnosGuardados = []) {
  const contenedorTurnos = document.getElementById("misTurnos");

  if (turnosGuardados.length === 0) {
    contenedorTurnos.innerHTML = "<p>No tienes turnos confirmados aún.</p>";
    return;
  }

  contenedorTurnos.innerHTML = "";

  turnosGuardados.map((turno) => {
    const turnoDiv = document.createElement("div");
    turnoDiv.classList = "turno";
    turnoDiv.id = turno.token;

    turnoDiv.innerHTML = `
      <p><strong>Fecha:</strong> ${new Date(turno.date).toLocaleDateString("es-PE")}</p>
      <p><strong>Hora:</strong> ${turno.time}</p>
      <p><strong>Profesional:</strong> ${turno.professional}</p>
      <p><strong>Duración:</strong> ${turno.duration}</p>
      <p><strong>Modalidad:</strong> ${turno.mode}</p>
      <p style="padding-top: 10px; font-weight: bold; color: blue;">Cliente: ${turno.name}</p>
      ${turno.state === 'PENDIENTE' ? '<p style="padding-top: 10px; font-weight: bold; color: orange;">Estado: Pendiente</p>' : ''}
      ${turno.state === 'ATENDIDO' ? '<p style="padding-top: 10px; font-weight: bold; color: green;">Estado: Atendido</p>' : ''}
      ${turno.state === 'CANCELADO' ? '<p style="padding-top: 10px; font-weight: bold; color: gray;">Estado: Cancelado</p>' : ''}
      ${turno.state === 'VENCIDO' ? '<p style="padding-top: 10px; font-weight: bold; color: red;">Estado: Vencido</p>' : ''}
      <button style="display: ${['PENDIENTE'].includes(turno.state) ? 'block' : 'none'}" id="delete-${turno.token}">Eliminar</button>
<button class="descargar-turno" data-token="${turno.token}" style="margin-top: 10px; background-color: green; color: white; border: none; padding: 5px 10px; border-radius: 4px;">Descargar PDF</button>
    `;

    contenedorTurnos.appendChild(turnoDiv);

    // Botón eliminar
    const btnEliminar = document.getElementById(`delete-${turno.token}`);
    if (btnEliminar) {
      btnEliminar.addEventListener("click", () => {
        const confirmacion = window.confirm("¿Estás seguro de eliminar este turno?");
        if (!confirmacion) return;
        eliminarTurno(turno.token);
      });
    }

    // Botón descargar PDF de este turno
    const btnDescarga = turnoDiv.querySelector(".descargar-turno");
    btnDescarga.addEventListener("click", () => {
      const opciones = {
        margin: 0.3,
        filename: `turno-${turno.date.split('T')[0]}-${turno.name}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
      };

      html2pdf().set(opciones).from(turnoDiv).save();
    });
  });
}

// Mostrar los turnos al cargar la página
mostrarTurnos();

// cargar DOM
document.addEventListener("DOMContentLoaded", async () => {
  const turnos = await obtenerTurnos();
  mostrarTurnos(turnos);
});

const session = localStorage.getItem("session");
const tokenPayload = decodeJWT(session);

document.getElementById('turnos_title').innerHTML = `${tokenPayload.role === 'ADMIN' ? 'Todos los' : 'Mis'} turnos`;
