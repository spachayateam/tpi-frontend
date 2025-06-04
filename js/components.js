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
