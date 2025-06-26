import { decodeJWT } from "./jwt-decode.js";
import endpoint from "./endpoint.js";

const session = sessionStorage.getItem("session");
const tokenPayload = decodeJWT(session);

const isAdmin = tokenPayload.role === "ADMIN";

function setAccionesRapidas() {
  const accionesRapidas = document.getElementById("panel-acciones-rapidas");

  if (isAdmin) {
    accionesRapidas.innerHTML = `
      <a class="accion-card" href="/pages/gestionarservicios.html">
        <span class="icono">⚙️</span>
        <span>Gestionar servicios</span>
      </a>
      <a class="accion-card" href="/pages/misturnos.html">
        <span class="icono">📅</span>
        <span>Ver todos los turnos</span>
      </a>
      <a class="accion-card" href="/pages/gestionarprofesionales.html">
        <span class="icono">🧑‍⚕️</span>
        <span>Gestionar profesionales</span>
      </a>
      <a class="accion-card" href="/pages/turnos.html">
        <span class="icono">📅</span>
        <span>Crear turno manualmente</span>
      </a>
      <a class="accion-card" href="/pages/reportes-pago.html">
        <span class="icono">💵</span>
        <span>Reportes de pago</span>
      </a>
    `;
    return;
  }

  accionesRapidas.innerHTML = `
    <a class="accion-card" href="/pages/misturnos.html">
      <span class="icono">📅</span>
      <span>Historial de turnos</span>
    </a>
    <a class="accion-card" href="/pages/historialclientes.html">
      <span class="icono">🧑‍⚕️</span>
      <span>Historial clientes</span>
    </a>
    <a class="accion-card" href="/pages/proximos-turnos.html">
      <span class="icono">📅</span>
      <span>Próximos turnos</span>
    </a>
  `;
}

if (window.location.pathname === "/pages/panel.html") {
  if (!["ADMIN", "PROFESSIONAL"].includes(tokenPayload.role)) {
    window.location.href = "/index.html";
  }

  document.getElementById("panel-titulo").innerHTML = `Panel del ${isAdmin ? "Administrador" : "Profesional"}`;
  setAccionesRapidas();
}

if (window.location.pathname === "/pages/gestionarservicios.html") {
  if (tokenPayload.role !== "ADMIN") {
    window.location.href = "/pages/panel.html";
  }

  async function getServices() {
    const response = await fetch(`${endpoint}/services`);
    const servicios = await response.json();

    let totalServicios = document.querySelector("#services");

    if (totalServicios) {
      document.querySelector("#services").innerHTML = servicios.length;
    }

    const getProssionalData = await fetch(`${endpoint}/professionals`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Role": `${tokenPayload.role}`,
      },
    });
    const profesionales = await getProssionalData.json();

    const grid = document.getElementById("servicios");

    servicios.forEach((servicio) => {
      const card = document.createElement("div");
      card.className = "blog-card";
      card.id = `blog-card-${servicio.id}`;
      card.innerHTML = `
          <!-- <img src="${servicio.imagen}" alt="${servicio.categoria}"> -->
          <div class="blog-content">
            <p class="blog-category">${servicio.categoria}</p>
            <h3 class="blog-heading">${servicio.precio}</h3>
            <p class="blog-description">${servicio.descripcion}</p>
            <button class="blog-button" id="button_service_${servicio.id}">EDITAR</button>
        <button style="background-color: red" class="blog-button" id="button_service_remove_${servicio.id}">BORRAR</button>
          </div>
        `;
      grid.appendChild(card);

      document
        .getElementById(`button_service_${servicio.id}`)
        .addEventListener("click", function () {
          document.getElementById("edit-panel").classList.remove("hidden");

          document.getElementById("edit-id").value = servicio.id;
          document.getElementById("edit-categoria").value = servicio.categoria;
          document.getElementById("edit-precio").value = servicio.precio;
          document.getElementById("edit-descripcion").value =
            servicio.descripcion;
          document.getElementById("edit-imagen").value = servicio.imagen;

          const select = document.getElementById("edit-profesional");
          select.innerHTML = "";
          profesionales.forEach((profesional) => {
            const selected = profesional.id === servicio.professionalId ? "selected" : "";
            select.innerHTML += `
        <option value="${profesional.id}" ${selected}>
          ID: ${profesional.id} - ${profesional.name}
        </option>`;
          })
        });

      document
        .getElementById(`button_service_remove_${servicio.id}`)
        .addEventListener("click", async () => {
          const confirm = window.confirm(
            `¿Estás seguro de que quieres borrar el servicio ${servicio.categoria}?`
          );
          if (!confirm) return;

          const response = await fetch(`${endpoint}/services/${servicio.id}`, {
            method: "DELETE",
          });
          const data = await response.json();

          if (!response.ok) {
            throw {
              status: response.status,
              message: response.statusText,
            };
          }

          if (response.ok) {
            alert(data.message);
            window.location.reload();
          }
        });
    });
  }

  getServices();

  document.getElementById("add-service").addEventListener("click", () => {
    async function getProfessionals() {
      const response = await fetch(`${endpoint}/professionals`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Role": `${tokenPayload.role}`,
        },
      });
      const profesionales = await response.json();

      const select = document.getElementById("add-profesional");
      select.innerHTML = "";
      profesionales.forEach((profesional) => {
        select.innerHTML += `
        <option value="${profesional.id}">
          ID: ${profesional.id} - ${profesional.name}
        </option>`;
      })
    }

    getProfessionals()
    document.getElementById("add-panel").classList.remove("hidden-add");

    document.getElementById("add-panel").addEventListener("submit", async (e) => {
      e.preventDefault();

      const newService = {
        categoria: document.getElementById("add-categoria").value,
        precio: document.getElementById("add-precio").value,
        descripcion: document.getElementById("add-descripcion").value,
        imagen: document.getElementById("add-imagen").value,
        professionalId: document.getElementById("add-profesional").value,
      };

      const response = await fetch(`${endpoint}/services`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newService),
      });
      const data = await response.json();

      if (!response.ok) {
        throw {
          status: response.status,
          message: response.statusText,
        };
      }

      if (response.ok) {
        alert(data.message);
        window.location.reload();
      }
    });
  });

  document.getElementById("edit-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const updatedService = {
      id: document.getElementById("edit-id").value,
      categoria: document.getElementById("edit-categoria").value,
      precio: document.getElementById("edit-precio").value,
      descripcion: document.getElementById("edit-descripcion").value,
      imagen: document.getElementById("edit-imagen").value,
      professionalId: document.getElementById("edit-profesional").value
    };

    const response = await fetch(`${endpoint}/services/${updatedService.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedService),
    });
    const data = await response.json();

    if (!response.ok) {
      throw {
        status: response.status,
        message: response.statusText,
      };
    }

    if (response.ok) {
      alert(data.message);
      window.location.reload();
    }
    document.getElementById("edit-panel").classList.add("hidden");
  });

  document.getElementById("cancel-edit").addEventListener("click", () => {
    document.getElementById("edit-panel").classList.add("hidden");
  });

  document.getElementById("cancel-add").addEventListener("click", () => {
    document.getElementById("add-panel").classList.add("hidden-add");
  });
}
