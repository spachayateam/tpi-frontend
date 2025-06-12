import { loginProfesional } from "./api.js";

document.addEventListener('DOMContentLoaded', () => {
  const session = localStorage.getItem('session');

  if (session) {
    window.location.href = '/pages/turnos.html';
    return;
  }
  
  const form = document.getElementById('form_login_profesional');
  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = document.getElementById('emaillogin').value.trim();
    const password = document.getElementById('passwordlogin').value.trim();
    
    try {
      const response = await loginProfesional(email, password);

      localStorage.setItem('session', response?.accessToken);
      window.location.href = '/pages/misturnos.html';
      
      alert('Sesión iniciada con éxito');
    } catch (error) {
      console.error(error.message);

      // if (error.status === 401) {
      //   alert('Email o contraseña incorrectos');
      //   return;
      // }

      alert(error.message ?? 'Error al iniciar sesión');
    }
    
  });
});