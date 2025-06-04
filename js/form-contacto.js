import { registrarContacto } from "./api.js";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("form_contacto");

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const subject = document.getElementById("subject").value.trim();
    const message = document.getElementById("message").value.trim();

    if (name.length < 2 || name.length > 50) {
      alert("El nombre debe tener entre 2 y 50 caracteres");
      return;
    }

    if (email.length < 5 || email.length > 50) {
      alert("El email debe tener entre 5 y 50 caracteres");
      return;
    }

    if (subject.length < 2 || subject.length > 50) {
      alert("El asunto debe tener entre 2 y 50 caracteres");
      return;
    }

    if (message.length < 2 || message.length > 500) {
      alert("El mensaje debe tener entre 2 y 500 caracteres");
      return;
    }

    const params = {
      name,
      email,
      subject,
      message,
    };

    try {
      registrarContacto(params);

      alert("Mensaje enviado con éxito");

      document.getElementById("name").value = "";
      document.getElementById("email").value = "";
      document.getElementById("subject").value = "";
      document.getElementById("message").value = "";
    } catch (error) {
      console.error(error.message);

      if (error.status === 400) {
        alert("Peticion incorrecta");
        return;
      }

      alert("Error al enviar mensaje");
    }

  });
});