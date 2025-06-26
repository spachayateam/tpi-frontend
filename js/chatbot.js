const toggleBtn = document.querySelector('.chatbot-toggle');
const chatBox = document.querySelector('.chatbot-box');
const sendBtn = document.getElementById('chatbotSend');
const input = document.getElementById('chatbotInput');
const messages = document.getElementById('chatbotMessages');

// Abrir/cerrar chat y limpiar al abrir
toggleBtn.addEventListener('click', () => {
  const isOpen = chatBox.style.display === 'flex';
  if (isOpen) {
    chatBox.style.display = 'none';
  } else {
    messages.innerHTML = ''; // Limpiar historial anterior
    chatBox.style.display = 'flex';
    setTimeout(() => {
      appendMessage('bot', '¡Hola! Soy Carolina, tu asistente virtual del Spa. ¿En qué puedo ayudarte hoy?');
    }, 400);
  }
});

// Eventos para enviar mensaje
sendBtn.addEventListener('click', sendMessage);
input.addEventListener('keypress', function (e) {
  if (e.key === 'Enter') sendMessage();
});

function sendMessage() {
  const userText = input.value.trim();
  if (!userText) return;

  appendMessage('user', userText);
  input.value = '';

  setTimeout(() => {
    const botReply = getBotReply(userText.toLowerCase());
    appendMessage('bot', botReply);
  }, 600);
}

function appendMessage(sender, text) {
  const message = document.createElement('div');
  message.classList.add('message', sender);

  const avatar = document.createElement('img');
  avatar.classList.add('avatar');
  avatar.src = sender === 'bot' ? '/media/bot_avatar.png' : '/media/user_icon.jpg';

  const bubble = document.createElement('div');
  bubble.classList.add('bubble');
  bubble.innerText = text;

  if (sender === 'bot') {
    message.appendChild(avatar);
    message.appendChild(bubble);
  } else {
    message.appendChild(bubble);
  }

  messages.appendChild(message);

  // ✅ Scroll al fondo con suavidad
  setTimeout(() => {
    messages.scrollTo({
      top: messages.scrollHeight,
      behavior: 'smooth'
    });
  }, 100);
}

function getBotReply(msg) {
  // Normalizar texto (sin tildes)
  msg = msg.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  if (msg.includes("pago") || msg.includes("medios") || msg.includes("forma de pago")) {
    return 'Aceptamos pagos en efectivo y con tarjeta de débito. Si abonás con débito 48hs antes del servicio, obtenés un 15% de descuento.';
  }

  const servicios = {
    "anti-stress": "MASAJES ANTI-STRESS ($7.000): Opción ideal si te sentís estresado.",
    "descontracturante": "MASAJES DESCONTRACTURANTES ($8.000): Alivian tensión muscular, mejoran circulación y reducen el estrés corporal.",
    "piedras calientes": "MASAJES CON PIEDRAS CALIENTES ($9.000): Relajan profundamente, equilibran energías y mejoran el bienestar físico y mental.",
    "circulatorio": "MASAJES CIRCULATORIOS ($10.000): Mejoran el flujo sanguíneo, reducen hinchazón y favorecen la eliminación de toxinas.",
    "lifting de pestanas": "BELLEZA LIFTING DE PESTAÑAS ($12.000): Realza la mirada, curva las pestañas naturalmente y potencia su volumen.",
    "depilacion facial": "BELLEZA DEPILACIÓN FACIAL ($11.000): Elimina vello no deseado, suaviza la piel y mejora la apariencia estética.",
    "manos y piel": "BELLEZA MANOS Y PIEL ($9.500): Remueve vello, suaviza la piel y mejora su textura naturalmente.",
    "punta de diamante": "FACIAL Punta de Diamante ($15.000): Microexfoliación que elimina células muertas y mejora la luminosidad.",
    "limpieza profunda": "FACIAL Limpieza profunda + Hidratación ($22.000): Limpia, nutre y revitaliza la piel intensamente.",
    "crio frecuencia facial": "FACIAL Crio frecuencia facial ($20.000): Tonifica la piel, reduce flacidez y estimula colágeno.",
    "velasim": "CORPORAL VelaSim ($22.000): Reduce celulitis, modela el cuerpo y mejora la firmeza.",
    "dermohealth": "CORPORAL DermoHealth ($22.000): Mejora circulación, combate celulitis y reafirma la piel.",
    "criofrecuencia": "CORPORAL Criofrecuencia ($22.000): Reduce grasa localizada y mejora firmeza cutánea.",
    "ultracavitacion": "CORPORAL Ultracavitación ($22.000): Reduce grasa localizada, mejora contorno y combate celulitis."
  };

  for (const key in servicios) {
    if (msg.includes(key)) {
      return servicios[key];
    }
  }

  if (msg.includes("servicio")) {
    return 'Contamos con masajes, belleza facial y corporal, tratamientos relajantes y más. ¿Querés información sobre alguno en particular?';
  }
  if (msg.includes("horario") || msg.includes("hora") || msg.includes("dias") || msg.includes("dia")) {
    return 'Estamos abiertos de lunes a domingos, de 09:00AM a 17:00PM . ¡Te esperamos!';
  }
  if (msg.includes("ubicacion") || msg.includes("donde") || msg.includes("direccion")) {
    return 'Nos encontramos en Jujuy 1020, Resistencia, Chaco. Un espacio pensado para tu bienestar.';
  }
  if (msg.includes("turno") || msg.includes("reserva") || msg.includes("reservar")) {
    return 'Podés reservar tu turno desde la sección "Turnos" en el menú principal. ¿Te gustaría que te guíe?';
  }

  return 'Gracias por tu mensaje. En breve nos pondremos en contacto para ayudarte 😊';
}
