import { listaTurnos } from "./constants.js";

import endpoint from "./endpoint.js";

async function getServices() {
  const response = await fetch(`${endpoint}/services`);
  const servicios = await response.json();
  
  const grid = document.getElementById("blogGrid");

  servicios.forEach((servicio, index) => {
    const card = document.createElement("div");
    card.className = "blog-card";
    card.id = `blog-card-${index + 1}`;
    card.innerHTML = `
        <!-- <img src="${servicio.imagen}" alt="${servicio.categoria}"> -->
        <div class="blog-content">
          <p class="blog-category">${servicio.categoria}</p>
          <h3 class="blog-heading">${servicio.precio}</h3>
          <p class="blog-description">${servicio.descripcion}</p>
          <button class="blog-button" id="button_service_${index + 1
      }">SELECCIONAR</button>
        </div>
      `;
    grid.appendChild(card);

  document
    .getElementById(`button_service_${index + 1}`)
    .addEventListener("click", function () {
      // limpiart div id turnos
      document.getElementById("turnos").innerHTML = "";

      const params = {
        servicio: servicio.categoria,
        profesional: servicio.professional,
        professionalId: servicio.professionalId,
        payout: servicio.precio,
      };

      sessionStorage.setItem("servicio", JSON.stringify(params));

        const today = new Date().getDate();

        document.getElementById(`day-${today}`).click();

        document
          .getElementById("calendar")
          .scrollIntoView({ behavior: "smooth", block: "center" });
      });
  });
}

getServices()