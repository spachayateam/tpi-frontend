import { login } from "./api.js";

document.addEventListener('DOMContentLoaded', () => {
  const session = localStorage.getItem('session');

  if (session) {
    window.location.href = '/pages/turnos.html';
    return;
  }

  
  const form = document.getElementById('form_login');
  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = document.getElementById('emaillogin').value.trim();
    const password = document.getElementById('passwordlogin').value.trim();
    
    try {
      const response = await login(email, password);

      localStorage.setItem('session', response?.accessToken);
      window.location.href = '/pages/turnos.html';
      
      alert('Sesión iniciada con éxito');
    } catch (error) {
      console.error(error.message);

      if (error.status === 401) {
        alert('Email o contraseña incorrectos');
        return;
      }

      alert('Error al iniciar sesión');
    }
    
  });
});