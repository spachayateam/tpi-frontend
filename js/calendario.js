import { saveTurno } from "./api.js";
import { listaTurnos } from "./constants.js";

const { DateTime } = luxon;
const now = DateTime.now().startOf("day");

const calendar = document.getElementById("calendar");
const monthYear = document.getElementById("monthYear");
const turnos = document.getElementById("turnos");
const paymentMethodForm = document.getElementById("payment_method_form");

let currentDate = new Date(2025, 0); // Inicia en enero 2025

const diasSemana = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

document.getElementById("prevMonth").addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderCalendar();
});

document.getElementById("nextMonth").addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderCalendar();
});

const today = new Date();
const todayDate = today.getDate();
const todayMonth = today.getMonth();
const todayYear = today.getFullYear();

currentDate.setMonth(todayMonth);

function renderCalendar() {
  calendar.innerHTML = "";
  monthYear.textContent = currentDate.toLocaleString("default", {
    month: "long",
    year: "numeric"
  });

  // Cabecera de días
  diasSemana.forEach(dia => {
    const div = document.createElement("div");
    div.textContent = dia;
    calendar.appendChild(div);
  });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1);
  const startingDay = (firstDay.getDay() + 6) % 7; // Ajustar domingo al final

  const lastDate = new Date(year, month + 1, 0).getDate();


  for (let i = 0; i < startingDay; i++) {
    const empty = document.createElement("div");
    calendar.appendChild(empty);
  }

  for (let day = 1; day <= lastDate; day++) {
    const jsDate = new Date(year, month, day);
    
    const luxonDay = DateTime.fromJSDate(jsDate).startOf("day");
    const diffDay = now.diff(luxonDay, "days").days;
    const selectedDate = diffDay < -1 && diffDay >= -2
    
    const isPastToAvailableDate = diffDay > -2;
    
    const dayDiv = document.createElement("div");
    dayDiv.classList.add("day")
    dayDiv.id = `day-${day}`;
    dayDiv.textContent = day;

    if (selectedDate) {
      dayDiv.classList.add("selected");
      mostrarTurnos(todayDate, todayMonth + 1, todayYear);
    }

    if (isPastToAvailableDate) {
      dayDiv.style.color = "#ccc";
      dayDiv.style.cursor = "not-allowed";
      dayDiv.style.opacity = "0.8";
    }

    if (!isPastToAvailableDate) {
      dayDiv.addEventListener("click", () => {
        document.querySelectorAll(".day").forEach(el => el.classList.remove("selected"));
        dayDiv.classList.add("selected");
        mostrarTurnos(day, month + 1, year);
      });
    }

    calendar.appendChild(dayDiv);
  }
}

// mostrarTurnos(currentDate.getDate(), currentDate.getMonth() + 1, currentDate.getFullYear());

function mostrarTurnos(dia, mes, anio) {
    const servicio = localStorage.getItem("servicio");
    if (!servicio) return;

    turnos.innerText = "";
    paymentMethodForm.innerText = "";

    const fecha = `${anio}-${String(mes).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;

    const seleccionado = JSON.parse(localStorage.getItem("servicio") || "{}");

    const profesional = seleccionado.profesional;
    const modalidad = seleccionado.servicio;
    const payout = seleccionado.payout;
  
    const turnosEjemplo = listaTurnos(profesional);

    // const { DateTime } = luxon

    // const turnos = []
  
    turnosEjemplo.map((t, i) => {
      const params = {
        fecha,
        hora: t.hora,
        profesional: t.profesional,
        duracion: t.duracion,
        modalidad: t.modalidad,
        servicio: t.servicio,
        payout,
      };

      const turnoDiv = document.createElement("div");
      turnoDiv.classList = "turno";
      turnoDiv.id = `turno-${i + 1}`;
  
      turnoDiv.innerHTML = `
        <div>
          <p><strong>Fecha:</strong> ${fecha}</p>
          <p><strong>Hora:</strong> ${t.hora}</p>
          <p><strong>Profesional:</strong> ${t.profesional}</p>
          <p><strong>Duración:</strong> ${t.duracion}</p>
          <p><strong>Modalidad:</strong> ${t.modalidad}</p>
          <p><strong>Servicio:</strong> ${t.servicio}</p>
          <p class="seleccionar-turno">Seleccionar turno</p>
        </div>
      `;

      turnos.appendChild(turnoDiv);

      document.getElementById(`turno-${i + 1}`).addEventListener("click", () => {
        guardarTurno(params);
        document.getElementById("payment_method_form").scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });
    });
  }
  
  
  renderCalendar(); // Inicializa el calendario
  
  function guardarTurno(turno) {    
    const session = localStorage.getItem("session");
    
    if (!session) { 
      localStorage.setItem("turno", JSON.stringify(turno));
      alert("Inicia sesión para guardar turnos");
      window.location.href = "/pages/sesion.html";
      return;
    }


    paymentMethodForm.innerHTML = "";

    const form = document.createElement("form");
    form.className = "payment-method-form";

    // insertar detalle de turno
    const turnoDetail = document.createElement("div");
    turnoDetail.className = "turno-seleccionado";
    turnoDetail.innerHTML = `
      <h3 style="padding-bottom: 5px;">Turno Seleccionado</h3>
      <p>Fecha: ${turno.fecha}</p>
      <p>Hora: ${turno.hora}</p>
      <p>Profesional: ${turno.profesional}</p>
      <p>Duración: ${turno.duracion}</p>
      <p>Modalidad: ${turno.modalidad}</p>
      <p>Pago: ${turno.payout}</p>
    `;
    form.appendChild(turnoDetail);

    turno.payment_method = 'Efectivo';

    // insertart label
    const label = document.createElement("label");
    label.textContent = "Selecciona un método de pago:";
    form.appendChild(label);

    // insertart select
    const select = document.createElement("select");
    select.name = "payment_method";
    select.value = turno.payment_method;
    select.addEventListener("change", () => {
      turno.payment_method = select.value;
    });

    const options = [
      { value: "Efectivo", text: "Efectivo" },
      { value: "Transferencia", text: "Transferencia" },
    ];

    options.forEach((option) => {
      const optionElement = document.createElement("option");
      optionElement.value = option.value;
      optionElement.textContent = option.text;
      select.appendChild(optionElement);
    });

    form.appendChild(select);

    // insertart button
    const button = document.createElement("button");
    button.type = "submit";
    button.textContent = "Guardar";
    button.addEventListener("click", async (e) => {
      e.preventDefault();

      try {
        
        await saveTurno(turno);
  
        alert("Turno guardado y comprobante enviado exitosamente");
        window.location.href = "/pages/misturnos.html";
        localStorage.removeItem("turno");
        localStorage.removeItem("servicio");
      } catch (error) {
        if (error.status === 400) {
          alert(error.message);
          return;
        }

        console.error(error);
        alert("Error al guardar turno");
      }
      
    });

    form.appendChild(button);

    paymentMethodForm.appendChild(form);

  // TODO guardar turno en back con datos de usuario logueado
}