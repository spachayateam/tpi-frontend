import { decodeJWT } from "./jwt-decode.js";
import { obtenerStock } from "./api.js";
import endpoint from "./endpoint.js";

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

async function cargarStock() {
    const stockContent = document.getElementById('stock-content');

    try {
        // Intentar obtener stock desde el endpoint específico
        let productos;
        try {
            productos = await obtenerStock();
        } catch (error) {
            // Si el endpoint de stock no existe, obtener todos los productos
            console.warn('Endpoint de stock no disponible, obteniendo todos los productos');
            const response = await fetch(`${endpoint}/productos`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Error al cargar productos');
            }

            productos = await response.json();
        }

        if (!productos || productos.length === 0) {
            stockContent.innerHTML = `
                <p style="text-align: center; margin-top: 50px; font-size: 24px; color: #666;">
                    No hay productos disponibles.
                </p>
            `;
            return;
        }
        
        // Log para debugging
        console.log('Productos de stock recibidos:', productos);

        // Organizar productos por categoría
        const productosPorCategoria = organizarProductosPorCategoria(productos);

        // Renderizar stock
        stockContent.innerHTML = renderizarStock(productosPorCategoria, productos);
    } catch (error) {
        console.error('Error al cargar stock:', error);
        if (error.status === 401) {
            alert('Sesión expirada. Por favor, inicia sesión nuevamente.');
            window.location.href = '/pages/sesion.html';
        } else {
            const mensajeError = error.message || 'Error al cargar el stock. Por favor, intenta nuevamente.';
            stockContent.innerHTML = `
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

function organizarProductosPorCategoria(productos) {
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

    productos.forEach(producto => {
        // Normalizar acceso a campos
        const tipoPrincipal = (producto.tipo || producto.Tipo || '').toLowerCase().trim();
        const categoriaSub = (producto.categoria || producto.Categoria || '').toLowerCase().trim();

        // Organizar según tipo principal (Skincare o Relajacion)
        if (tipoPrincipal === 'skincare') {
            if (categoriaSub.includes('serum') || categoriaSub === 'serum' || categoriaSub === 'serums') {
                categorias.skincare.serums.push(producto);
            } else if (categoriaSub.includes('crema') || categoriaSub === 'crema' || categoriaSub === 'cremas' || categoriaSub.includes('hidratante') || categoriaSub.includes('limpiador')) {
                categorias.skincare.cremas.push(producto);
            } else {
                categorias.otros.push(producto);
            }
        } else if (tipoPrincipal === 'relajacion' || tipoPrincipal === 'relajación') {
            if (categoriaSub.includes('sal') || categoriaSub.includes('baño') || categoriaSub.includes('bano')) {
                categorias.relajacion['sales-de-bano'].push(producto);
            } else if (categoriaSub.includes('aceite') || categoriaSub.includes('esencial') || categoriaSub.includes('gel')) {
                categorias.relajacion['aceites-esenciales'].push(producto);
            } else if (categoriaSub.includes('vela') || categoriaSub === 'vela' || categoriaSub === 'velas' || categoriaSub.includes('aromática')) {
                categorias.relajacion.velas.push(producto);
            } else {
                categorias.otros.push(producto);
            }
        } else {
            categorias.otros.push(producto);
        }
    });

    return categorias;
}

function renderizarStock(productosPorCategoria, todosLosProductos) {
    let html = '';

    // Calcular resumen (normalizar acceso a campos)
    const totalProductos = todosLosProductos.length;
    const productosConStockBajo = todosLosProductos.filter(p => {
        const stock = p.stock !== undefined ? p.stock : (p.Stock !== undefined ? p.Stock : 0);
        return stock < 10 && stock > 0;
    }).length;
    const productosSinStock = todosLosProductos.filter(p => {
        const stock = p.stock !== undefined ? p.stock : (p.Stock !== undefined ? p.Stock : 0);
        return stock === 0;
    }).length;

    // Resumen general
    html += `
        <div style="background-color: #f9f9f9; padding: 30px; border-radius: 12px; margin-bottom: 40px;">
            <h2 style="font-size: 36px; color: #e84b91; margin-bottom: 20px; text-align: center;">Resumen de Stock</h2>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px;">
                <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); text-align: center;">
                    <h3 style="color: #666; margin: 0 0 10px 0;">Total Productos</h3>
                    <p style="font-size: 32px; font-weight: bold; color: #333; margin: 0;">${totalProductos}</p>
                </div>
                <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); text-align: center;">
                    <h3 style="color: #666; margin: 0 0 10px 0;">Stock Bajo</h3>
                    <p style="font-size: 32px; font-weight: bold; color: #ff9800; margin: 0;">${productosConStockBajo}</p>
                </div>
                <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); text-align: center;">
                    <h3 style="color: #666; margin: 0 0 10px 0;">Sin Stock</h3>
                    <p style="font-size: 32px; font-weight: bold; color: #f44336; margin: 0;">${productosSinStock}</p>
                </div>
            </div>
        </div>
    `;

    // Tabla de stock por categoría
    html += '<div class="ventas-por-categoria">';
    html += '<h2 class="categoria-title">Stock por Categoría</h2>';

    // Sección Skincare
    if (productosPorCategoria.skincare.serums.length > 0 || productosPorCategoria.skincare.cremas.length > 0) {
        html += '<h3 class="tipo-title">Skincare</h3>';
        
        // Mostrar cremas y limpiadores primero
        if (productosPorCategoria.skincare.cremas.length > 0) {
            html += '<h4 style="margin-left: 20px; margin-top: 15px; color: #666;">Cremas y Limpiadores</h4>';
            html += crearTablaStock(productosPorCategoria.skincare.cremas);
        }
        
        // Luego serums
        if (productosPorCategoria.skincare.serums.length > 0) {
            html += '<h4 style="margin-left: 20px; margin-top: 15px; color: #666;">Serums</h4>';
            html += crearTablaStock(productosPorCategoria.skincare.serums);
        }
    }

    // Sección Relajación
    if (productosPorCategoria.relajacion['sales-de-bano'].length > 0 ||
        productosPorCategoria.relajacion['aceites-esenciales'].length > 0 ||
        productosPorCategoria.relajacion.velas.length > 0) {
        html += '<h3 class="tipo-title">Relajación</h3>';
        
        // Mostrar esenciales para baño
        if (productosPorCategoria.relajacion['aceites-esenciales'].length > 0) {
            html += '<h4 style="margin-left: 20px; margin-top: 15px; color: #666;">Esenciales para Baño</h4>';
            html += crearTablaStock(productosPorCategoria.relajacion['aceites-esenciales']);
        }
        
        // Sales de baño
        if (productosPorCategoria.relajacion['sales-de-bano'].length > 0) {
            html += '<h4 style="margin-left: 20px; margin-top: 15px; color: #666;">Sales de Baño</h4>';
            html += crearTablaStock(productosPorCategoria.relajacion['sales-de-bano']);
        }
        
        // Velas
        if (productosPorCategoria.relajacion.velas.length > 0) {
            html += '<h4 style="margin-left: 20px; margin-top: 15px; color: #666;">Velas</h4>';
            html += crearTablaStock(productosPorCategoria.relajacion.velas);
        }
    }

    // Otros productos
    if (productosPorCategoria.otros.length > 0) {
        html += '<h3 class="tipo-title">Otros Productos</h3>';
        html += crearTablaStock(productosPorCategoria.otros);
    }

    html += '</div>';

    return html;
}

function crearTablaStock(productos) {
    if (productos.length === 0) {
        return '<p style="text-align: center; color: #666; margin: 20px 0;">No hay productos en esta categoría.</p>';
    }

    let html = `
        <table class="stock-table">
            <thead>
                <tr>
                    <th>Nombre</th>
                    <th>Categoría</th>
                    <th>Tipo</th>
                    <th>Precio</th>
                    <th>Stock</th>
                    <th>Estado</th>
                </tr>
            </thead>
            <tbody>
    `;

    productos.forEach(producto => {
        // Normalizar acceso a campos
        const nombre = producto.name || producto.nombre || producto.Name || 'Sin nombre';
        const categoria = producto.categoria || producto.Categoria || 'N/A';
        const tipo = producto.tipo || producto.Tipo || 'N/A';
        const precio = producto.precio || producto.Precio || 0;
        const stock = producto.stock !== undefined ? producto.stock : (producto.Stock !== undefined ? producto.Stock : 0);
        
        const estadoClass = stock === 0 ? 'stock-bajo' : stock < 10 ? 'stock-medio' : 'stock-alto';
        const estadoTexto = stock === 0 ? 'Sin Stock' : stock < 10 ? 'Stock Bajo' : 'Disponible';

        html += `
            <tr>
                <td>${nombre}</td>
                <td>${categoria}</td>
                <td>${tipo}</td>
                <td>$${parseFloat(precio).toFixed(2)}</td>
                <td class="${estadoClass}">${stock}</td>
                <td class="${estadoClass}">${estadoTexto}</td>
            </tr>
        `;
    });

    html += `
            </tbody>
        </table>
    `;

    return html;
}

// Cargar stock al iniciar
document.addEventListener('DOMContentLoaded', cargarStock);

