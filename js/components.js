import { decodeJWT } from "./jwt-decode.js";

// Función para cargar la barra de navegación
function loadNav() {
    fetch('/components/nav.html')  // Ruta del archivo nav.html
        .then(response => response.text())
        .then(data => {
            document.getElementById('navbar').innerHTML = data;
            const session = localStorage.getItem('session');
            if (!session) {
                document.getElementById('misturnos').style.display = 'none';
                document.getElementById('btn_logout').style.display = 'none';
                document.getElementById('btn_personal').style.display = 'none';
                // Ocultar enlaces de vendedora si existen
                const btnCarrito = document.getElementById('btn_carrito');
                const btnStock = document.getElementById('btn_stock');
                if (btnCarrito) btnCarrito.style.display = 'none';
                if (btnStock) btnStock.style.display = 'none';
                return;
            }

            const tokenPayload = decodeJWT(session);

            const isADmin = tokenPayload.role === 'ADMIN';
            const isProfessional = tokenPayload.role === 'PROFESSIONAL';
            const isSeller = tokenPayload.role === 'SELLER';

            if (!isADmin && !isProfessional) {
                document.getElementById('btn_personal').style.display = 'none';
            }

            // Mostrar enlaces de vendedora solo si es SELLER
            const btnCarrito = document.getElementById('btn_carrito');
            const btnStock = document.getElementById('btn_stock');
            if (btnCarrito) {
                btnCarrito.style.display = isSeller ? 'block' : 'none';
            }
            if (btnStock) {
                btnStock.style.display = isSeller ? 'block' : 'none';
            }

            // Ocultar "CARRITO" (misturnos) para vendedoras, ya que tienen su propio carrito
            if (isSeller && document.getElementById('misturnos')) {
                document.getElementById('misturnos').style.display = 'none';
            }

            document.getElementById('btn_logout').addEventListener('click', () => {
                const confirm = window.confirm('¿Estás seguro de cerrar sesión?');
                if (!confirm) return;
                localStorage.removeItem('session');
                window.location.href = '/pages/sesion.html';
            });

        })
        .catch(error => {
            console.error('Error cargando la barra de navegación:', error);
        });
}

// Llamamos a la función para cargar el nav al cargar la página
window.onload = loadNav;
