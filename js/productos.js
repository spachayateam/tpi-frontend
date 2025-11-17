import { decodeJWT } from "./jwt-decode.js";
import endpoint from "./endpoint.js";
import { crearVenta } from "./api.js";

// Carrito de compras (almacenado en localStorage)
let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
let eventListenerAgregado = false;
let productosActuales = [];

async function mostrarProductos() {
    const token = localStorage.getItem('session');
    if (!token) {
        document.getElementById("productos").innerHTML = `
            <p style="font-size: 50px; color: red; text-transform: uppercase;">
                Debes iniciar sesión para ver los productos
            </p>`;
        return;
    }

    const tokenPayload = decodeJWT(token);
    const isSeller = tokenPayload.role === "SELLER";

    try {
    const response = await fetch(`${endpoint}/productos`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
        },
    });

        if (response.status === 403) {
            document.getElementById("productos").innerHTML = `
            <p style="font-size: 50px; color: red; text-transform: uppercase;">
                Debes iniciar sesión para ver los productos
            </p>`;
        return;
    }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: response.statusText }));
            throw new Error(`Error ${response.status}: ${errorData.message || 'Error al cargar productos'}`);
        }

        const productosGuardados = await response.json();
        
        // Log para debugging
        console.log('Productos recibidos:', productosGuardados);
        const productosEl = document.getElementById("productos");

        if (!productosGuardados || productosGuardados.length === 0) {
            productosEl.innerHTML = `
                <div style="text-align: center; padding: 50px; width: 100%;">
                    <p style="font-size: 24px; color: #666;">No hay productos disponibles en este momento.</p>
                </div>
            `;
            return;
        }

        // Guardar productos actuales para el event listener
        productosActuales = productosGuardados;

        // Organizar productos por categoría y tipo
        const productosPorCategoria = organizarProductos(productosGuardados);

        // Renderizar productos organizados
        productosEl.innerHTML = renderizarProductosPorCategoria(productosPorCategoria, isSeller);

        // Usar event delegation para manejar clicks en los botones (solo una vez)
        if (!eventListenerAgregado) {
            productosEl.addEventListener('click', (e) => {
                if (e.target.classList.contains('btn-producto')) {
                    const btnId = e.target.id;
                    const productoId = btnId.replace('btn-', '');
                    const producto = productosActuales.find(p => 
                        (p.id || p._id || '').toString() === productoId
                    );
                    
                    if (producto) {
                        if (isSeller) {
                            abrirModalVenta(producto);
                        } else {
                            agregarAlCarrito(producto);
                        }
                    }
                }
            });
            eventListenerAgregado = true;
        }
    } catch (error) {
        console.error('Error al cargar productos:', error);
        const productosEl = document.getElementById("productos");
        let mensajeError = 'Error al cargar los productos. Por favor, intenta nuevamente.';
        
        if (error.message) {
            mensajeError += `<br><small>${error.message}</small>`;
        }
        
        productosEl.innerHTML = `
            <div style="text-align: center; padding: 50px;">
                <p style="color: red; font-size: 20px;">${mensajeError}</p>
                <button onclick="location.reload()" style="padding: 10px 20px; margin-top: 20px; background-color: #e84b91; color: white; border: none; border-radius: 8px; cursor: pointer;">
                    Reintentar
                </button>
            </div>`;
    }
}

function organizarProductos(productos) {
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
        // Normalizar categoría y tipo
        // El backend usa 'tipo' como categoría principal (Skincare/Relajacion)
        // y 'categoria' como subcategoría (serum, crema, limpiador facial, etc.)
        const tipoPrincipal = (producto.tipo || producto.Tipo || '').toLowerCase().trim();
        const categoriaSub = (producto.categoria || producto.Categoria || '').toLowerCase().trim();

        // Mapear según tipo principal (Skincare o Relajacion)
        if (tipoPrincipal === 'skincare') {
            // Subcategorías de Skincare
            if (categoriaSub.includes('serum') || categoriaSub === 'serum' || categoriaSub === 'serums') {
                categorias.skincare.serums.push(producto);
            } else if (categoriaSub.includes('crema') || categoriaSub === 'crema' || categoriaSub === 'cremas' || categoriaSub.includes('hidratante') || categoriaSub.includes('limpiador')) {
                categorias.skincare.cremas.push(producto);
            } else {
                categorias.otros.push(producto);
            }
        } else if (tipoPrincipal === 'relajacion' || tipoPrincipal === 'relajación') {
            // Subcategorías de Relajación
            if (categoriaSub.includes('sal') || categoriaSub.includes('baño') || categoriaSub.includes('bano')) {
                categorias.relajacion['sales-de-bano'].push(producto);
            } else if (categoriaSub.includes('aceite') || categoriaSub.includes('esencial') || categoriaSub === 'aceite esencial' || categoriaSub.includes('gel')) {
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

function renderizarProductosPorCategoria(categorias, isSeller) {
    let html = '';

    // Sección Skincare
    if (categorias.skincare.serums.length > 0 || categorias.skincare.cremas.length > 0) {
        html += '<div class="categoria-section">';
        html += '<h2 class="categoria-title">💆 Skincare</h2>';

        // Mostrar cremas primero (incluye limpiadores faciales)
        if (categorias.skincare.cremas.length > 0) {
            html += '<h3 class="tipo-title">🧴 Cremas y Limpiadores</h3>';
            html += '<div class="productos-grid">';
            // Ordenar por nombre
            const cremasOrdenadas = [...categorias.skincare.cremas].sort((a, b) => {
                const nombreA = (a.name || a.nombre || '').toLowerCase();
                const nombreB = (b.name || b.nombre || '').toLowerCase();
                return nombreA.localeCompare(nombreB);
            });
            html += cremasOrdenadas.map(producto => crearTarjetaProducto(producto, isSeller)).join('');
            html += '</div>';
        }

        // Luego serums
        if (categorias.skincare.serums.length > 0) {
            html += '<h3 class="tipo-title">✨ Serums</h3>';
            html += '<div class="productos-grid">';
            // Ordenar por nombre
            const serumsOrdenados = [...categorias.skincare.serums].sort((a, b) => {
                const nombreA = (a.name || a.nombre || '').toLowerCase();
                const nombreB = (b.name || b.nombre || '').toLowerCase();
                return nombreA.localeCompare(nombreB);
            });
            html += serumsOrdenados.map(producto => crearTarjetaProducto(producto, isSeller)).join('');
            html += '</div>';
        }

        html += '</div>';
    }

    // Sección Relajación
    if (categorias.relajacion['sales-de-bano'].length > 0 || 
        categorias.relajacion['aceites-esenciales'].length > 0 || 
        categorias.relajacion.velas.length > 0) {
        html += '<div class="categoria-section">';
        html += '<h2 class="categoria-title">🕯️ Relajación</h2>';

        if (categorias.relajacion['sales-de-bano'].length > 0) {
            html += '<h3 class="tipo-title">🧂 Sales de Baño</h3>';
            html += '<div class="productos-grid">';
            // Ordenar por nombre
            const salesOrdenadas = [...categorias.relajacion['sales-de-bano']].sort((a, b) => {
                const nombreA = (a.name || a.nombre || '').toLowerCase();
                const nombreB = (b.name || b.nombre || '').toLowerCase();
                return nombreA.localeCompare(nombreB);
            });
            html += salesOrdenadas.map(producto => crearTarjetaProducto(producto, isSeller)).join('');
            html += '</div>';
        }

        if (categorias.relajacion['aceites-esenciales'].length > 0) {
            html += '<h3 class="tipo-title">🌿 Esenciales para Baño</h3>';
            html += '<div class="productos-grid">';
            // Ordenar por nombre
            const aceitesOrdenados = [...categorias.relajacion['aceites-esenciales']].sort((a, b) => {
                const nombreA = (a.name || a.nombre || '').toLowerCase();
                const nombreB = (b.name || b.nombre || '').toLowerCase();
                return nombreA.localeCompare(nombreB);
            });
            html += aceitesOrdenados.map(producto => crearTarjetaProducto(producto, isSeller)).join('');
            html += '</div>';
        }

        if (categorias.relajacion.velas.length > 0) {
            html += '<h3 class="tipo-title">🕯️ Velas</h3>';
            html += '<div class="productos-grid">';
            // Ordenar por nombre
            const velasOrdenadas = [...categorias.relajacion.velas].sort((a, b) => {
                const nombreA = (a.name || a.nombre || '').toLowerCase();
                const nombreB = (b.name || b.nombre || '').toLowerCase();
                return nombreA.localeCompare(nombreB);
            });
            html += velasOrdenadas.map(producto => crearTarjetaProducto(producto, isSeller)).join('');
            html += '</div>';
        }

        html += '</div>';
    }

    // Otros productos
    if (categorias.otros.length > 0) {
        html += '<div class="categoria-section">';
        html += '<h2 class="categoria-title">📦 Otros Productos</h2>';
        html += '<div class="productos-grid">';
        // Ordenar por nombre
        const otrosOrdenados = [...categorias.otros].sort((a, b) => {
            const nombreA = (a.name || a.nombre || '').toLowerCase();
            const nombreB = (b.name || b.nombre || '').toLowerCase();
            return nombreA.localeCompare(nombreB);
        });
        html += otrosOrdenados.map(producto => crearTarjetaProducto(producto, isSeller)).join('');
        html += '</div>';
        html += '</div>';
    }

    return html;
}

function crearTarjetaProducto(producto, isSeller) {
    // Normalizar campos del producto (aceptar diferentes nombres de campos)
    const productoId = producto.id || producto._id || producto.ID;
    const nombre = producto.name || producto.nombre || producto.Name || 'Sin nombre';
    const precio = parseFloat(producto.precio || producto.Precio || 0);
    const stock = producto.stock !== undefined ? producto.stock : (producto.Stock !== undefined ? producto.Stock : undefined);
    const imagen = producto.imagen || producto.Imagen || producto.image || '/media/organic-spa-products-white-background.jpg';
    const descripcion = producto.descripcion || producto.Descripcion || producto.descripción || 'Sin descripción';
    const categoria = producto.categoria || producto.Categoria || '';
    const tipo = producto.tipo || producto.Tipo || '';
    
    // Mostrar stock solo para vendedoras
    const stockInfo = (isSeller && stock !== undefined) ? `<p><strong>Stock disponible:</strong> ${stock}</p>` : '';
    const categoriaInfo = categoria ? `<p><strong>Categoría:</strong> ${categoria}</p>` : '';
    const tipoInfo = tipo ? `<p><strong>Tipo:</strong> ${tipo}</p>` : '';
    
    // Limitar descripción a 100 caracteres
    const descripcionCorta = descripcion.length > 100 ? descripcion.substring(0, 100) + '...' : descripcion;
    
    return `
        <div class="product-card">
            <img src="${imagen}" alt="${nombre}" onerror="this.src='/media/organic-spa-products-white-background.jpg'">
            <div class="card-body">
                <h3>${nombre}</h3>
                <p class="producto-precio"><strong>Precio:</strong> $${precio.toFixed(2)}</p>
                ${stockInfo}
                ${categoriaInfo}
                ${tipoInfo}
                <p class="producto-descripcion"><strong>Descripción:</strong> ${descripcionCorta}</p>
                <button id="btn-${productoId || Math.random()}" class="btn-producto">
                    ${isSeller ? "Vender" : "Agregar al Carrito"}
                </button>
            </div>
        </div>
    `;
}

function agregarAlCarrito(producto) {
    const itemExistente = carrito.find(item => item.id === (producto.id || producto._id));
    
    if (itemExistente) {
        itemExistente.cantidad += 1;
    } else {
        carrito.push({
            id: producto.id || producto._id,
            name: producto.name,
            precio: producto.precio,
            imagen: producto.imagen,
            cantidad: 1
        });
    }

    localStorage.setItem('carrito', JSON.stringify(carrito));
    alert(`¡${producto.name} agregado al carrito!`);
}

function abrirModalVenta(producto) {
    // Normalizar datos del producto
    const productoId = producto.id || producto._id || producto.ID;
    const nombre = producto.name || producto.nombre || producto.Name || 'Sin nombre';
    const precio = parseFloat(producto.precio || producto.Precio || 0);
    const stock = producto.stock !== undefined ? producto.stock : (producto.Stock !== undefined ? producto.Stock : 999);
    const descripcion = producto.descripcion || producto.Descripcion || producto.descripción || '';
    
    // Eliminar modal anterior si existe
    const modalAnterior = document.getElementById('modal-venta');
    if (modalAnterior) {
        document.body.removeChild(modalAnterior);
    }
    
    // Crear modal para venta
    const modal = document.createElement('div');
    modal.className = 'modal-venta';
    modal.id = 'modal-venta';
    modal.innerHTML = `
        <div class="modal-content-venta">
            <span class="close-modal">&times;</span>
            <h2>Vender Producto</h2>
            <div class="producto-info-venta">
                <h3>${nombre}</h3>
                ${descripcion ? `<p><strong>Descripción:</strong> ${descripcion}</p>` : ''}
                <p><strong>Precio unitario:</strong> $${precio.toFixed(2)}</p>
                <p><strong>Stock disponible:</strong> ${stock}</p>
            </div>
            <form id="form-venta">
                <h3 style="margin-top: 20px; margin-bottom: 15px; color: #e84b91;">Datos del Cliente</h3>
                <label for="nombre-cliente">Nombre del Cliente:</label>
                <input type="text" id="nombre-cliente" required>
                
                <label for="apellido-cliente">Apellido del Cliente:</label>
                <input type="text" id="apellido-cliente" required>
                
                <label for="dni-cliente">DNI del Cliente:</label>
                <input type="text" id="dni-cliente" pattern="[0-9]{7,8}" title="Ingrese un DNI válido (7 u 8 dígitos)" required>
                
                <h3 style="margin-top: 20px; margin-bottom: 15px; color: #e84b91;">Detalles de la Venta</h3>
                <label for="cantidad-venta">Cantidad:</label>
                <input type="number" id="cantidad-venta" min="1" max="${stock}" value="1" required>
                
                <label for="metodo-pago">Método de Pago:</label>
                <select id="metodo-pago" required>
                    <option value="">Seleccione método de pago</option>
                    <option value="efectivo">Efectivo (10% descuento)</option>
                    <option value="debito">Débito</option>
                    <option value="credito">Crédito</option>
                </select>
                
                <div id="precio-final">
                    <p><strong>Precio base:</strong> $<span id="precio-base">${precio.toFixed(2)}</span></p>
                    <p><strong>Descuento:</strong> $<span id="descuento-aplicado">0.00</span></p>
                    <p style="font-size: 24px; margin-top: 10px;"><strong>Precio final:</strong> $<span id="precio-total">${precio.toFixed(2)}</span></p>
                </div>
                
                <button type="submit" class="btn-confirmar-venta">Confirmar Venta</button>
            </form>
        </div>
    `;

    document.body.appendChild(modal);
    modal.style.display = 'block';

    // Calcular precio con descuento
    const metodoPago = document.getElementById('metodo-pago');
    const cantidad = document.getElementById('cantidad-venta');
    const precioTotal = document.getElementById('precio-total');
    const precioBase = document.getElementById('precio-base');
    const descuentoAplicado = document.getElementById('descuento-aplicado');

    function actualizarPrecio() {
        const cantidadValue = parseInt(cantidad.value) || 1;
        const precioBaseCalculado = precio * cantidadValue;
        let precioFinal = precioBaseCalculado;
        let descuento = 0;

        if (metodoPago.value === 'efectivo') {
            descuento = precioBaseCalculado * 0.1; // 10% descuento
            precioFinal = precioBaseCalculado - descuento;
        }

        precioBase.textContent = precioBaseCalculado.toFixed(2);
        descuentoAplicado.textContent = descuento.toFixed(2);
        precioTotal.textContent = precioFinal.toFixed(2);
    }

    metodoPago.addEventListener('change', actualizarPrecio);
    cantidad.addEventListener('input', actualizarPrecio);

    // Cerrar modal al hacer click fuera
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });

    // Cerrar modal con X
    document.querySelector('.close-modal').addEventListener('click', () => {
        document.body.removeChild(modal);
    });

    // Enviar venta
    document.getElementById('form-venta').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const nombreCliente = document.getElementById('nombre-cliente').value.trim();
        const apellidoCliente = document.getElementById('apellido-cliente').value.trim();
        const dniCliente = document.getElementById('dni-cliente').value.trim();
        const cantidadValue = parseInt(cantidad.value);
        const metodoPagoValue = metodoPago.value;
        
        // Validaciones
        if (!nombreCliente) {
            alert('Por favor, ingrese el nombre del cliente');
            return;
        }
        
        if (!apellidoCliente) {
            alert('Por favor, ingrese el apellido del cliente');
            return;
        }
        
        if (!dniCliente || dniCliente.length < 7) {
            alert('Por favor, ingrese un DNI válido (7 u 8 dígitos)');
            return;
        }
        
        if (!metodoPagoValue) {
            alert('Por favor, seleccione un método de pago');
            return;
        }
        
        if (cantidadValue > stock) {
            alert(`No hay suficiente stock. Disponible: ${stock}`);
            return;
        }
        
        const precioBaseCalculado = precio * cantidadValue;
        let precioFinal = precioBaseCalculado;

        if (metodoPagoValue === 'efectivo') {
            precioFinal = precioBaseCalculado * 0.9;
        }

        // Deshabilitar botón mientras se procesa
        const btnSubmit = document.querySelector('.btn-confirmar-venta');
        btnSubmit.disabled = true;
        btnSubmit.textContent = 'Procesando...';

        try {
            await crearVenta({
                productoId: productoId,
                cantidad: cantidadValue,
                metodoPago: metodoPagoValue,
                precioTotal: precioFinal,
                precioUnitario: precio,
                compradorNombre: `${nombreCliente} ${apellidoCliente}`,
                compradorDni: dniCliente
            });

            alert('¡Venta realizada con éxito!');
            document.body.removeChild(modal);
            mostrarProductos(); // Recargar productos para actualizar stock
        } catch (error) {
            console.error('Error al realizar venta:', error);
            const mensajeError = error.message || 'Error al realizar la venta. Por favor, intenta nuevamente.';
            alert(mensajeError);
            btnSubmit.disabled = false;
            btnSubmit.textContent = 'Confirmar Venta';
        }
    });
}

// Cargar productos al iniciar
mostrarProductos();
