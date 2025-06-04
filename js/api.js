const endpoint = 'http://localhost:3000/api';

export async function registrarContacto(params = {}) {
  const { name, email, subject, message } = params;

  const body = { name, email, subject, message };

  const response = await fetch(`${endpoint}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {

    throw {
      status: response.status,
      message: response.statusText,
    };
  }

  return response.json();
}

export async function login(email, password) {
  const response = await fetch(`${endpoint}/users/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });

  if (!response.ok) {

    throw {
      status: response.status,
      message: response.statusText,
    };
  }

  return response.json();
}

export async function registrarUsuario(params = {}) {
  const { nombre, email, password, phone } = params;

  const body = { nombre, email, password, phone };

  const response = await fetch(`${endpoint}/users/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {

    throw {
      status: response.status,
      message: response.statusText,
    };
  }

  return response.json();
}

export async function saveTurno(params) {
  const token = localStorage.getItem('session');

  const response = await fetch(`${endpoint}/appointments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      date: params.fecha,
      time: params.hora,
      professional: params.profesional,
      duration: '60 minutos',
      mode: params.modalidad,
      payment_method: params.payment_method,
    }),
  });

  if (!response.ok) {

    const message = await response.json();

    throw {
      status: response.status,
      message: message.message,
    };
  }

  return response.json();
}

export async function getTurnos() {
  const token = localStorage.getItem('session');

  const response = await fetch(`${endpoint}/appointments`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {

    throw {
      status: response.status,
      message: response.statusText,
    };
  }

  return response.json();
}

export async function deleteTurno(turnoToken) {
  const token = localStorage.getItem('session');

  const response = await fetch(`${endpoint}/appointments/${turnoToken}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {

    throw {
      status: response.status,
      message: response.statusText,
    };
  }

  return response.json();
}
