document.addEventListener('DOMContentLoaded', () => {
  const profesionales = [
    { id: 'p1', nombre: 'Ana Gómez' },
    { id: 'p2', nombre: 'Luis Pérez' },
    { id: 'p3', nombre: 'María López' },
  ];

  const serviciosPorProfesional = {
    p1: [
      { id: 's1', nombre: 'Masajes Anti-Stress', precio: 7000 },
      { id: 's2', nombre: 'Criofrecuencia', precio: 12000 },
    ],
    p2: [
      { id: 's3', nombre: 'Depilación Láser', precio: 15000 },
    ],
    p3: [
      { id: 's1', nombre: 'Masajes Anti-Stress', precio: 7000 },
      { id: 's4', nombre: 'Facial Rejuvenecedor', precio: 9000 },
    ],
  };

  const turnos = [
    { profesionalId: 'p1', servicioId: 's1', cantidad: 5 },
    { profesionalId: 'p1', servicioId: 's2', cantidad: 3 },
    { profesionalId: 'p2', servicioId: 's3', cantidad: 8 },
    { profesionalId: 'p3', servicioId: 's1', cantidad: 2 },
    { profesionalId: 'p3', servicioId: 's4', cantidad: 6 },
  ];

  const selectProfesional = document.getElementById('profesional-select');
  const tbodyReportes = document.getElementById('tabla-reportes');

  // Cargar profesionales en el select
  function cargarProfesionales() {
    profesionales.forEach(prof => {
      const option = document.createElement('option');
      option.value = prof.id;
      option.textContent = prof.nombre;
      selectProfesional.appendChild(option);
    });
  }

  // Al cambiar profesional, mostrar datos
  selectProfesional.addEventListener('change', () => {
    const profId = selectProfesional.value;
    if (!profId) {
      tbodyReportes.innerHTML = '';
      return;
    }
    mostrarReporteProfesional(profId);
  });

  function mostrarReporteProfesional(profId) {
    tbodyReportes.innerHTML = '';

    const servicios = serviciosPorProfesional[profId] || [];

    // Calcular total turnos del profesional
    let totalTurnosProfesional = 0;
    servicios.forEach(servicio => {
      const turnoData = turnos.find(
        t => t.profesionalId === profId && t.servicioId === servicio.id
      );
      const cantidadTurnos = turnoData ? turnoData.cantidad : 0;
      totalTurnosProfesional += cantidadTurnos;
    });

    // Renderizar filas
    servicios.forEach(servicio => {
      const turnoData = turnos.find(
        t => t.profesionalId === profId && t.servicioId === servicio.id
      );
      const cantidadTurnos = turnoData ? turnoData.cantidad : 0;
      const totalRecaudado = cantidadTurnos * servicio.precio;

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${servicio.nombre}</td>
        <td>${cantidadTurnos}</td>
        <td>$ ${totalRecaudado.toLocaleString('es-AR')}</td>
        <td>${totalTurnosProfesional}</td>
      `;

      tbodyReportes.appendChild(tr);
    });
  }

  // Inicializar select
  cargarProfesionales();
});
