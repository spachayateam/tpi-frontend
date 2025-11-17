import { decodeJWT } from "./jwt-decode.js";
import endpoint from "./endpoint.js";

// Verificar que el usuario sea ADMIN
const token = localStorage.getItem('session');
if (!token) {
    window.location.href = '/pages/sesion.html';
    throw new Error('No hay sesión activa');
}

const tokenPayload = decodeJWT(token);
if (tokenPayload.role !== 'ADMIN') {
    window.location.href = '/pages/panel.html';
    throw new Error('Acceso denegado. Solo administradores pueden ver esta página.');
}

async function cargarProductosAdmin() {
    const content = document.getElementById('productos-admin-content');

    try {
        // Obtener productos
        const responseProductos = await fetch(`${endpoint}/productos`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
        });

        if (!responseProductos.ok) {
            throw new Error('Error al cargar productos');
        }

        const productos = await responseProductos.json();

        // Obtener todas las ventas para calcular estadísticas
        const responseVentas = await fetch(`${endpoint}/ventas`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
        });

        let ventas = [];
        if (responseVentas.ok) {
            ventas = await responseVentas.json();
        }

        // Calcular estadísticas por producto
        const estadisticas = calcularEstadisticas(productos, ventas);

        // Renderizar
        content.innerHTML = renderizarEstadisticas(estadisticas);
    } catch (error) {
        console.error('Error al cargar productos admin:', error);
        content.innerHTML = `
            <div style="text-align: center; padding: 50px;">
                <p style="color: red; font-size: 20px;">Error al cargar la información. Por favor, intenta nuevamente.</p>
                <button onclick="location.reload()" style="padding: 10px 20px; margin-top: 20px; background-color: #e84b91; color: white; border: none; border-radius: 8px; cursor: pointer;">
                    Reintentar
                </button>
            </div>
        `;
    }
}

function calcularEstadisticas(productos, ventas) {
    const estadisticas = productos.map(producto => {
        const productoId = producto.id || producto._id;
        const ventasProducto = ventas.filter(v => 
            (v.producto_id || v.producto?.id) == productoId
        );

        const totalVendido = ventasProducto.reduce((sum, v) => sum + parseFloat(v.precio_final || v.precioTotal || 0), 0);
        const totalEfectivo = ventasProducto
            .filter(v => (v.metodo_pago || v.metodoPago || '').toLowerCase() === 'efectivo')
            .reduce((sum, v) => sum + parseFloat(v.precio_final || v.precioTotal || 0), 0);
        const totalDebito = ventasProducto
            .filter(v => (v.metodo_pago || v.metodoPago || '').toLowerCase() === 'debito')
            .reduce((sum, v) => sum + parseFloat(v.precio_final || v.precioTotal || 0), 0);
        const totalCredito = ventasProducto
            .filter(v => (v.metodo_pago || v.metodoPago || '').toLowerCase() === 'credito')
            .reduce((sum, v) => sum + parseFloat(v.precio_final || v.precioTotal || 0), 0);
        const cantidadVendida = ventasProducto.reduce((sum, v) => sum + (v.cantidad || 0), 0);

        return {
            producto,
            stock: producto.stock || 0,
            totalVendido,
            totalEfectivo,
            totalDebito,
            totalCredito,
            cantidadVendida,
            cantidadVentas: ventasProducto.length
        };
    });

    return estadisticas;
}

function renderizarEstadisticas(estadisticas) {
    // Organizar por categorías
    const porCategoria = {
        'skincare': {
            'cremas': [],
            'serums': []
        },
        'relajacion': {
            'esenciales': []
        },
        'otros': []
    };

    estadisticas.forEach(stat => {
        const tipo = (stat.producto.tipo || '').toLowerCase();
        const categoria = (stat.producto.categoria || '').toLowerCase();

        if (tipo === 'skincare') {
            if (categoria.includes('serum')) {
                porCategoria.skincare.serums.push(stat);
            } else {
                porCategoria.skincare.cremas.push(stat);
            }
        } else if (tipo === 'relajacion' || tipo === 'relajación') {
            porCategoria.relajacion.esenciales.push(stat);
        } else {
            porCategoria.otros.push(stat);
        }
    });

    let html = '';

    // Skincare
    if (porCategoria.skincare.cremas.length > 0 || porCategoria.skincare.serums.length > 0) {
        html += '<div class="categoria-section">';
        html += '<h2 class="categoria-title">💆 Skincare</h2>';

        if (porCategoria.skincare.cremas.length > 0) {
            html += '<h3 class="tipo-title">Cremas y Limpiadores</h3>';
            html += crearTablaEstadisticas(porCategoria.skincare.cremas);
        }

        if (porCategoria.skincare.serums.length > 0) {
            html += '<h3 class="tipo-title">Serums</h3>';
            html += crearTablaEstadisticas(porCategoria.skincare.serums);
        }

        html += '</div>';
    }

    // Relajación
    if (porCategoria.relajacion.esenciales.length > 0) {
        html += '<div class="categoria-section">';
        html += '<h2 class="categoria-title">🕯️ Relajación</h2>';
        html += '<h3 class="tipo-title">Esenciales para Baño</h3>';
        html += crearTablaEstadisticas(porCategoria.relajacion.esenciales);
        html += '</div>';
    }

    // Otros
    if (porCategoria.otros.length > 0) {
        html += '<div class="categoria-section">';
        html += '<h2 class="categoria-title">📦 Otros Productos</h2>';
        html += crearTablaEstadisticas(porCategoria.otros);
        html += '</div>';
    }

    return html;
}

function crearTablaEstadisticas(estadisticas) {
    let html = `
        <table class="stock-table" style="margin-bottom: 40px;">
            <thead>
                <tr>
                    <th>Producto</th>
                    <th>Categoría</th>
                    <th>Stock</th>
                    <th>Cantidad Vendida</th>
                    <th>Total Vendido</th>
                    <th>Efectivo</th>
                    <th>Débito</th>
                    <th>Crédito</th>
                </tr>
            </thead>
            <tbody>
    `;

    estadisticas.forEach(stat => {
        const producto = stat.producto;
        const nombre = producto.name || producto.nombre || 'Sin nombre';
        const categoria = producto.categoria || producto.Categoria || 'N/A';
        const stockClass = stat.stock === 0 ? 'stock-bajo' : stat.stock < 10 ? 'stock-medio' : 'stock-alto';

        html += `
            <tr>
                <td><strong>${nombre}</strong></td>
                <td>${categoria}</td>
                <td class="${stockClass}">${stat.stock}</td>
                <td>${stat.cantidadVendida} unidades</td>
                <td><strong>$${stat.totalVendido.toFixed(2)}</strong></td>
                <td>$${stat.totalEfectivo.toFixed(2)}</td>
                <td>$${stat.totalDebito.toFixed(2)}</td>
                <td>$${stat.totalCredito.toFixed(2)}</td>
            </tr>
        `;
    });

    html += `
            </tbody>
        </table>
    `;

    return html;
}

// Cargar al iniciar
document.addEventListener('DOMContentLoaded', cargarProductosAdmin);

