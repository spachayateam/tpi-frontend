import { login, registrarUsuario } from "./api.js";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("form_registro");
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    // capturamos valores
    const nombre = document.getElementById("nombre").value.trim();
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const password1 = document.getElementById("password1").value.trim();
    const password2 = document.getElementById("password2").value.trim();

    if (!nombre || !email || !phone || !password1 || !password2) {
      alert("Todos los campos son obligatorios");
      return;
    }

    // validamos campos
    if (password1.length < 8 || password2.length < 8) {
      alert("La contraseña debe tener al menos 8 caracteres");
      return;
    }

    if (password1 !== password2) {
      alert("Las contraseñas no coinciden");
      return;
    }

    if (nombre.length < 2 || nombre.length > 50) {
      alert("El nombre debe tener entre 2 y 50 caracteres");
      return;
    }

    // invocamos la funcion de registro del api
    try {
      const response = await registrarUsuario({
        nombre,
        email,
        password: password1,
        phone,
      });

      alert(response.message);

      window.location.href = "/pages/sesion.html";
    } catch (error) {
      console.error(error.message);

      if (error.status === 401) {
        alert("Email o contraseña incorrectos");
        return;
      }

      alert("Error al registrar usuario");
    }
  });
});
