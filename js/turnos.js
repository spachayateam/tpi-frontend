const servicios = [
  {
    categoria: "MASAJES ANTI-STRESS",
    precio: "$7,000",
    descripcion: "Opción ideal si te sentis estresado..",
    imagen: "/media/antistress.jpg",
    profesional: "Dr. Ramírez",
  },
  {
    categoria: "MASAJES DESCONTRACTURANTES",
    precio: "$8,000",
    descripcion:
      "Los masajes descontracturantes alivian tensión muscular, mejoran circulación y reducen el estrés corporal eficazmente.",
    imagen: "/media/descontracturantes.jpg",
    profesional: "Lic. Martínez",
  },
  {
    categoria: "MASAJES CON PIEDRAS CALIENTES",
    precio: "$9,000",
    descripcion:
      "Los masajes con piedras calientes relajan profundamente, equilibran energías y mejoran el bienestar físico y mental.",
    imagen: "/media/piedrascalientes.jpg",
    profesional: "Dr. Torres",
  },
  {
    categoria: "MASAJES CIRCULATORIOS",
    precio: "$10,000",
    descripcion:
      "Los masajes circulatorios mejoran el flujo sanguíneo, reducen hinchazón y favorecen la eliminación de toxinas.",
    imagen: "/media/masajescirculatorios.jpg",
    profesional: "Dr. Ramírez",
  },
  {
    categoria: "BELLEZA LIFTING DE PESTAÑAS",
    precio: "$12,000",
    descripcion:
      "El lifting de pestañas realza la mirada, curva las pestañas naturalmente y potencia su volumen.",
    imagen: "/media/liftingdepestañas.jpg",
    profesional: "Lic. Martínez",
  },
  {
    categoria: "BELLEZA DEPILACIÓN FACIAL",
    precio: "$11,000",
    descripcion:
      "La depilación facial elimina vello no deseado, suaviza la piel y mejora la apariencia estética.",
    imagen: "/media/depilacionfacial.jpg",
    profesional: "Dr. Torres",
  },
  {
    categoria: "BELLEZA MANOS Y PIEL",
    precio: "$9,500",
    descripcion:
      "La depilación facial remueve vello, suaviza la piel y mejora su textura naturalmente.",
    imagen: "/media/manosypiel.jpg",
    profesional: "Lic. Martínez",
  },
  {
    categoria: "FACIAL Punta de Diamante: Microexfoliación",
    precio: "$15,000",
    descripcion:
      "La microexfoliación elimina células muertas, suaviza la piel y mejora su luminosidad naturalmente",
    imagen: "/media/puntadediamante.jpg",
    profesional: "Dr. Ramírez",
  },
  {
    categoria: "FACIAL Limpieza profunda + Hidratación",
    precio: "$22,000",
    descripcion:
      "La limpieza profunda elimina impurezas, mientras la hidratación nutre y revitaliza la piel intensamente.",
    imagen: "/media/limpiezaprofunda.jpg",
    profesional: "Dr. Torres",
  },
  {
    categoria: "FACIAL Crio frecuencia facial",
    precio: "$20,000",
    descripcion:
      "La criofrecuencia facial tonifica la piel, reduce flacidez y estimula colágeno para rejuvenecer.",
    imagen: "/media/criofrecuenciafacial.jpg",
    profesional: "Dr. Ramírez",
  },
  {
    categoria: "CORPORAL VelaSim",
    precio: "$22,000",
    descripcion:
      "VelaSlim reduce celulitis, modela el contorno corporal y mejora la firmeza de la piel.",
    imagen: "/media/velasim.jpg",
    profesional: "Lic. Martínez",
  },
  {
    categoria: "CORPORAL DermoHealth",
    precio: "$22,000",
    descripcion:
      "DermoHealth mejora circulación, combate celulitis y estimula colágeno para una piel más firme.",
    imagen: "/media/dermohealth.jpg",
    profesional: "Dr. Torres",
  },
  {
    categoria: "CORPORAL Criofrecuencia",
    precio: "$22,000",
    descripcion:
      "La friofrecuencia combina frío y radiofrecuencia, reduciendo grasa localizada y mejorando firmeza cutánea.",
    imagen: "/media/criofrecuencia.jpg",
    profesional: "Lic. Martínez",
  },
  {
    categoria: "CORPORAL Ultracavitación",
    precio: "$22,000",
    descripcion:
      "La ultracavitación reduce grasa localizada, mejora contorno corporal y combate celulitis eficazmente.",
    imagen: "/media/Ultracavitacion.jpg",
    profesional: "Dr. Ramírez",
  },
];

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
          <button class="blog-button" id="button_service_${
            index + 1
          }">SELECCIONAR</button>
        </div>
      `;
  grid.appendChild(card);

  document
    .getElementById(`button_service_${index + 1}`)
    .addEventListener("click", function () {
      const params = {
        servicio: servicio.categoria,
        profesional: servicio.profesional,
      };
      localStorage.setItem("servicio", JSON.stringify(params));

      const today = new Date().getDate();

      document.getElementById(`day-${today}`).click();

      document
        .getElementById("calendar")
        .scrollIntoView({ behavior: "smooth", block: "center" });
    });
});

