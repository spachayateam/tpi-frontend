import { decodeJWT } from "./jwt-decode.js";
import { obtenerVentas } from "./api.js";

// Verificar que el usuario sea SELLER
const token = localStorage.getItem('session');
if (!token) {
    window.location.href = '/pages/sesion.html';
    throw new Error('No hay sesión activa');
}

const tokenPayload = decodeJWT(token);
if (tokenPayload.role !== 'SELLER') {
    window.location.href = '/pages/productos.html';
    throw new Error('Acceso denegado. Solo vendedoras pueden ver esta página.');
}

async function cargarVentas() {
    const ventasContent = document.getElementById('ventas-content');

    try {
        const ventas = await obtenerVentas();

        if (!ventas || ventas.length === 0) {
            ventasContent.innerHTML = `
                <p style="text-align: center; margin-top: 50px; font-size: 24px; color: #666;">
                    No has realizado ninguna venta aún.
                </p>
            `;
            return;
        }

        // Organizar ventas por categoría
        const ventasPorCategoria = organizarVentasPorCategoria(ventas);

        // Renderizar ventas
        ventasContent.innerHTML = renderizarVentas(ventasPorCategoria, ventas);
    } catch (error) {
        console.error('Error al cargar ventas:', error);
        if (error.status === 401) {
            alert('Sesión expirada. Por favor, inicia sesión nuevamente.');
            window.location.href = '/pages/sesion.html';
        } else {
            const mensajeError = error.message || 'Error al cargar las ventas. Por favor, intenta nuevamente.';
            ventasContent.innerHTML = `
                <div style="text-align: center; padding: 50px;">
                    <p style="color: red; font-size: 20px;">${mensajeError}</p>
                    <button onclick="location.reload()" style="padding: 10px 20px; margin-top: 20px; background-color: #e84b91; color: white; border: none; border-radius: 8px; cursor: pointer;">
                        Reintentar
                    </button>
                </div>
            `;
        }
    }
}

function organizarVentasPorCategoria(ventas) {
    const categorias = {
        'skincare': {
            'serums': [],
            'cremas': []
        },
        'relajacion': {
            'sales-de-bano': [],
            'aceites-esenciales': [],
            'velas': []
        },
        'otros': []
    };

    ventas.forEach(venta => {
        // Normalizar acceso a datos del producto
        const producto = venta.producto || {};
        const tipoPrincipal = (producto.tipo || producto.Tipo || venta.producto_tipo || '').toLowerCase().trim();
        const categoriaSub = (producto.categoria || producto.Categoria || venta.producto_categoria || '').toLowerCase().trim();

        // Organizar según tipo principal (Skincare o Relajacion)
        if (tipoPrincipal === 'skincare') {
            if (categoriaSub.includes('serum') || categoriaSub === 'serum' || categoriaSub === 'serums') {
                categorias.skincare.serums.push(venta);
            } else if (categoriaSub.includes('crema') || categoriaSub === 'crema' || categoriaSub === 'cremas' || categoriaSub.includes('hidratante') || categoriaSub.includes('limpiador')) {
                categorias.skincare.cremas.push(venta);
            } else {
                categorias.otros.push(venta);
            }
        } else if (tipoPrincipal === 'relajacion' || tipoPrincipal === 'relajación') {
            if (categoriaSub.includes('sal') || categoriaSub.includes('baño') || categoriaSub.includes('bano')) {
                categorias.relajacion['sales-de-bano'].push(venta);
            } else if (categoriaSub.includes('aceite') || categoriaSub.includes('esencial') || categoriaSub.includes('gel')) {
                categorias.relajacion['aceites-esenciales'].push(venta);
            } else if (categoriaSub.includes('vela') || categoriaSub === 'vela' || categoriaSub === 'velas' || categoriaSub.includes('aromática')) {
                categorias.relajacion.velas.push(venta);
            } else {
                categorias.otros.push(venta);
            }
        } else {
            categorias.otros.push(venta);
        }
    });

    return categorias;
}

function renderizarVentas(ventasPorCategoria, todasLasVentas) {
    let html = '';

        // Calcular totales (normalizar acceso a campos)
        const totalGeneral = todasLasVentas.reduce((sum, venta) => {
            const precio = venta.precioTotal || venta.precio_final || 0;
            return sum + parseFloat(precio);
        }, 0);
        
        const totalEfectivo = todasLasVentas
            .filter(v => {
                const metodo = (v.metodoPago || v.metodo_pago || '').toLowerCase();
                return metodo === 'efectivo';
            })
            .reduce((sum, venta) => {
                const precio = venta.precioTotal || venta.precio_final || 0;
                return sum + parseFloat(precio);
            }, 0);
            
        const totalDebito = todasLasVentas
            .filter(v => {
                const metodo = (v.metodoPago || v.metodo_pago || '').toLowerCase();
                return metodo === 'debito';
            })
            .reduce((sum, venta) => {
                const precio = venta.precioTotal || venta.precio_final || 0;
                return sum + parseFloat(precio);
            }, 0);
            
        const totalCredito = todasLasVentas
            .filter(v => {
                const metodo = (v.metodoPago || v.metodo_pago || '').toLowerCase();
                return metodo === 'credito';
            })
            .reduce((sum, venta) => {
                const precio = venta.precioTotal || venta.precio_final || 0;
                return sum + parseFloat(precio);
            }, 0);

    // Sección Skincare
    if (ventasPorCategoria.skincare.serums.length > 0 || ventasPorCategoria.skincare.cremas.length > 0) {
        html += '<div class="ventas-por-categoria">';
        html += '<h2 class="categoria-title">💆 Skincare</h2>';

        if (ventasPorCategoria.skincare.cremas.length > 0) {
            html += '<h3 class="tipo-title">🧴 Cremas y Limpiadores</h3>';
            html += ventasPorCategoria.skincare.cremas.map(venta => crearTarjetaVenta(venta)).join('');
        }

        if (ventasPorCategoria.skincare.serums.length > 0) {
            html += '<h3 class="tipo-title">✨ Serums</h3>';
            html += ventasPorCategoria.skincare.serums.map(venta => crearTarjetaVenta(venta)).join('');
        }

        html += '</div>';
    }

    // Sección Relajación
    if (ventasPorCategoria.relajacion['sales-de-bano'].length > 0 ||
        ventasPorCategoria.relajacion['aceites-esenciales'].length > 0 ||
        ventasPorCategoria.relajacion.velas.length > 0) {
        html += '<div class="ventas-por-categoria">';
        html += '<h2 class="categoria-title">🕯️ Relajación</h2>';

        if (ventasPorCategoria.relajacion['aceites-esenciales'].length > 0) {
            html += '<h3 class="tipo-title">🌿 Esenciales para Baño</h3>';
            html += ventasPorCategoria.relajacion['aceites-esenciales'].map(venta => crearTarjetaVenta(venta)).join('');
        }

        if (ventasPorCategoria.relajacion['sales-de-bano'].length > 0) {
            html += '<h3 class="tipo-title">🧂 Sales de Baño</h3>';
            html += ventasPorCategoria.relajacion['sales-de-bano'].map(venta => crearTarjetaVenta(venta)).join('');
        }

        if (ventasPorCategoria.relajacion.velas.length > 0) {
            html += '<h3 class="tipo-title">🕯️ Velas</h3>';
            html += ventasPorCategoria.relajacion.velas.map(venta => crearTarjetaVenta(venta)).join('');
        }

        html += '</div>';
    }

    // Otros productos
    if (ventasPorCategoria.otros.length > 0) {
        html += '<div class="ventas-por-categoria">';
        html += '<h2 class="categoria-title">Otros Productos</h2>';
        html += ventasPorCategoria.otros.map(venta => crearTarjetaVenta(venta)).join('');
        html += '</div>';
    }

    // Resumen de ventas
    html += `
        <div class="ventas-por-categoria" style="background-color: #f9f9f9; padding: 30px; border-radius: 12px; margin-top: 50px;">
            <h2 class="categoria-title" style="font-size: 36px;">Resumen de Ventas</h2>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-top: 30px;">
                <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <h3 style="color: #666; margin: 0 0 10px 0;">Total General</h3>
                    <p style="font-size: 28px; font-weight: bold; color: #e84b91; margin: 0;">$${totalGeneral.toFixed(2)}</p>
                </div>
                <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <h3 style="color: #666; margin: 0 0 10px 0;">Efectivo</h3>
                    <p style="font-size: 28px; font-weight: bold; color: #4caf50; margin: 0;">$${totalEfectivo.toFixed(2)}</p>
                </div>
                <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <h3 style="color: #666; margin: 0 0 10px 0;">Débito</h3>
                    <p style="font-size: 28px; font-weight: bold; color: #2196f3; margin: 0;">$${totalDebito.toFixed(2)}</p>
                </div>
                <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <h3 style="color: #666; margin: 0 0 10px 0;">Crédito</h3>
                    <p style="font-size: 28px; font-weight: bold; color: #ff9800; margin: 0;">$${totalCredito.toFixed(2)}</p>
                </div>
            </div>
        </div>
    `;

    return html;
}

function crearTarjetaVenta(venta) {
    // Normalizar acceso a datos de la venta
    const producto = venta.producto || {};
    const nombreProducto = producto.name || producto.nombre || venta.producto_nombre || 'Producto no disponible';
    const cantidad = venta.cantidad || 1;
    const precioUnitario = venta.precioUnitario || venta.precio_unitario || venta.precioTotal || 0;
    const precioTotal = venta.precioTotal || venta.precio_final || 0;
    const metodoPago = venta.metodoPago || venta.metodo_pago || 'N/A';
    const fechaVenta = venta.fecha || venta.fecha_venta || venta.created_at;
    
    const fecha = fechaVenta ? new Date(fechaVenta).toLocaleDateString('es-AR') : 'Fecha no disponible';
    const metodoPagoLabels = {
        'efectivo': 'Efectivo',
        'debito': 'Débito',
        'credito': 'Crédito',
        'Efectivo': 'Efectivo',
        'Debito': 'Débito',
        'Credito': 'Crédito'
    };
    const metodoPagoLabel = metodoPagoLabels[metodoPago.toLowerCase()] || metodoPagoLabels[metodoPago] || metodoPago;

    return `
        <div class="venta-item">
            <div class="venta-info">
                <h4>${nombreProducto}</h4>
                <p><strong>Cantidad:</strong> ${cantidad}</p>
                <p><strong>Precio unitario:</strong> $${parseFloat(precioUnitario).toFixed(2)}</p>
                <p><strong>Método de pago:</strong> ${metodoPagoLabel}</p>
                <p><strong>Fecha:</strong> ${fecha}</p>
            </div>
            <div class="venta-total">
                $${parseFloat(precioTotal).toFixed(2)}
            </div>
        </div>
    `;
}

// Cargar ventas al iniciar
document.addEventListener('DOMContentLoaded', cargarVentas);

