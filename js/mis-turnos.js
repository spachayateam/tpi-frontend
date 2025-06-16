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
      <p><strong>Servicio:</strong> ${turno.service}</p>
      <p style="padding-top: 10px; font-weight: bold; color: blue;">Cliente: ${turno.name}</p>
      ${turno.state === 'PENDIENTE' ? '<p style="padding-top: 10px; font-weight: bold; color: orange;">Estado: Pendiente</p>' : ''}
      ${turno.state === 'ATENDIDO' ? '<p style="padding-top: 10px; font-weight: bold; color: green;">Estado: Atendido</p>' : ''}
      ${turno.state === 'CANCELADO' ? '<p style="padding-top: 10px; font-weight: bold; color: gray;">Estado: Cancelado</p>' : ''}
      ${turno.state === 'VENCIDO' ? '<p style="padding-top: 10px; font-weight: bold; color: red;">Estado: Vencido</p>' : ''}
      <button style="display: ${turno.state === 'CANCELADO' ? 'none' : 'block'}" id="delete-${turno.token}">Eliminar</button>
    `;

    contenedorTurnos.appendChild(turnoDiv);

    document.getElementById(`delete-${turno.token}`).addEventListener("click", () => {
      const confirm = window.confirm("¿Estás seguro de eliminar este turno?");
      if (!confirm) return;
      eliminarTurno(turno.token);
    });
  });
  
  // contenedorTurnos.innerHTML =
  //   turnosGuardados.length > 0
  //     ? turnosGuardados
  //       .map(
  //         (turno, index) => `
  //           <div class="turno">
  //               <p><strong>Fecha:</strong> ${new Date(turno.date).toLocaleDateString("es-PE")}</p>
  //               <p><strong>Hora:</strong> ${turno.time}</p>
  //               <p><strong>Profesional:</strong> ${turno.professional}</p>
  //               <p><strong>Duración:</strong> ${turno.duration}</p>
  //               <p><strong>Modalidad:</strong> ${turno.mode}</p>
  //               <div style="display: none" id="${turno.token}"->${turno.token}</div>
  //               <button onclick="eliminarTurno(${index})">Eliminar</button>
  //           </div>
  //         `
  //       )
  //       .join("")
  //     : "<p>No tienes turnos confirmados aún.</p>";
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
