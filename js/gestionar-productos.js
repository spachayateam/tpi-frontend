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

// Funciones globales para los tabs
window.mostrarTab = function(tab) {
    document.getElementById('tab-productos').classList.remove('active');
    document.getElementById('tab-proveedores').classList.remove('active');
    document.getElementById('contenido-productos').style.display = 'none';
    document.getElementById('contenido-proveedores').style.display = 'none';

    if (tab === 'productos') {
        document.getElementById('tab-productos').classList.add('active');
        document.getElementById('contenido-productos').style.display = 'block';
        cargarProductos();
    } else {
        document.getElementById('tab-proveedores').classList.add('active');
        document.getElementById('contenido-proveedores').style.display = 'block';
        cargarProveedores();
    }
};

window.cerrarModalProducto = function() {
    document.getElementById('modal-producto').style.display = 'none';
    document.getElementById('form-producto').reset();
    document.getElementById('producto-id').value = '';
};

window.cerrarModalProveedor = function() {
    document.getElementById('modal-proveedor').style.display = 'none';
    document.getElementById('form-proveedor').reset();
    document.getElementById('proveedor-id').value = '';
};

async function cargarProductos() {
    const lista = document.getElementById('productos-lista');
    lista.innerHTML = '<p>Cargando productos...</p>';

    try {
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

        const productos = await response.json();

        if (productos.length === 0) {
            lista.innerHTML = '<p style="text-align: center; padding: 50px;">No hay productos registrados.</p>';
            return;
        }

        lista.innerHTML = productos.map(producto => `
            <div class="product-card" style="margin-bottom: 20px;">
                <div class="card-body" style="display: flex; justify-content: space-between; align-items: start;">
                    <div style="flex: 1;">
                        <h3>${producto.name || 'Sin nombre'}</h3>
                        <p><strong>Tipo:</strong> ${producto.tipo || 'N/A'}</p>
                        <p><strong>Categoría:</strong> ${producto.categoria || 'N/A'}</p>
                        <p><strong>Precio:</strong> $${(producto.precio || 0).toFixed(2)}</p>
                        <p><strong>Stock:</strong> ${producto.stock || 0}</p>
                        <p><strong>Descripción:</strong> ${producto.descripcion || 'Sin descripción'}</p>
                    </div>
                    <div style="display: flex; gap: 10px; flex-direction: column;">
                        <button onclick="editarProducto(${producto.id})" style="
                            padding: 8px 16px;
                            background-color: #2196f3;
                            color: white;
                            border: none;
                            border-radius: 8px;
                            cursor: pointer;
                        ">Editar</button>
                        <button onclick="eliminarProducto(${producto.id}, '${producto.name}')" style="
                            padding: 8px 16px;
                            background-color: #f44336;
                            color: white;
                            border: none;
                            border-radius: 8px;
                            cursor: pointer;
                        ">Eliminar</button>
                    </div>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error:', error);
        lista.innerHTML = `<p style="color: red;">Error al cargar productos: ${error.message}</p>`;
    }
}

async function cargarProveedores() {
    const lista = document.getElementById('proveedores-lista');
    lista.innerHTML = '<p>Cargando proveedores...</p>';

    try {
        const response = await fetch(`${endpoint}/proveedores`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error('Error al cargar proveedores');
        }

        const proveedores = await response.json();

        if (proveedores.length === 0) {
            lista.innerHTML = '<p style="text-align: center; padding: 50px;">No hay proveedores registrados.</p>';
            return;
        }

        // Obtener productos para mostrar cuáles provee cada proveedor
        const responseProductos = await fetch(`${endpoint}/productos`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
        });
        const productos = responseProductos.ok ? await responseProductos.json() : [];

        lista.innerHTML = proveedores.map(proveedor => {
            const productosProveedor = productos.filter(p => p.proveedor_id == proveedor.id);
            return `
                <div class="product-card" style="margin-bottom: 20px;">
                    <div class="card-body">
                        <h3>${proveedor.nombre || 'Sin nombre'}</h3>
                        <p><strong>Email:</strong> ${proveedor.email || 'N/A'}</p>
                        <p><strong>Teléfono:</strong> ${proveedor.telefono || 'N/A'}</p>
                        <p><strong>Dirección:</strong> ${proveedor.direccion || 'No especificada'}</p>
                        <p><strong>Productos que provee:</strong> ${productosProveedor.length} producto(s)</p>
                        ${productosProveedor.length > 0 ? `
                            <ul style="margin-left: 20px; margin-top: 10px;">
                                ${productosProveedor.map(p => `<li>${p.name}</li>`).join('')}
                            </ul>
                        ` : ''}
                        <div style="display: flex; gap: 10px; margin-top: 15px;">
                            <button onclick="editarProveedor(${proveedor.id})" style="
                                padding: 8px 16px;
                                background-color: #2196f3;
                                color: white;
                                border: none;
                                border-radius: 8px;
                                cursor: pointer;
                            ">Editar</button>
                            <button onclick="eliminarProveedor(${proveedor.id}, '${proveedor.nombre}')" style="
                                padding: 8px 16px;
                                background-color: #f44336;
                                color: white;
                                border: none;
                                border-radius: 8px;
                                cursor: pointer;
                            ">Eliminar</button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    } catch (error) {
        console.error('Error:', error);
        lista.innerHTML = `<p style="color: red;">Error al cargar proveedores: ${error.message}</p>`;
    }
}

window.editarProducto = async function(id) {
    try {
        const response = await fetch(`${endpoint}/productos/${id}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error('Error al cargar producto');
        }

        const producto = await response.json();

        document.getElementById('producto-id').value = producto.id;
        document.getElementById('producto-name').value = producto.name || '';
        document.getElementById('producto-tipo').value = producto.tipo || '';
        document.getElementById('producto-categoria').value = producto.categoria || '';
        document.getElementById('producto-precio').value = producto.precio || 0;
        document.getElementById('producto-descripcion').value = producto.descripcion || '';
        document.getElementById('producto-imagen').value = producto.imagen || '';
        document.getElementById('producto-stock').value = producto.stock || 0;
        document.getElementById('producto-proveedor').value = producto.proveedor_id || '';

        document.getElementById('modal-producto-titulo').textContent = 'Editar Producto';
        document.getElementById('modal-producto').style.display = 'block';
    } catch (error) {
        alert('Error al cargar el producto: ' + error.message);
    }
};

window.eliminarProducto = async function(id, nombre) {
    if (!confirm(`¿Estás seguro de eliminar el producto "${nombre}"?`)) {
        return;
    }

    try {
        const response = await fetch(`${endpoint}/productos/${id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Error al eliminar producto');
        }

        alert('Producto eliminado con éxito');
        cargarProductos();
    } catch (error) {
        alert('Error al eliminar producto: ' + error.message);
    }
};

window.editarProveedor = async function(id) {
    try {
        const response = await fetch(`${endpoint}/proveedores/${id}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error('Error al cargar proveedor');
        }

        const proveedor = await response.json();

        document.getElementById('proveedor-id').value = proveedor.id;
        document.getElementById('proveedor-nombre').value = proveedor.nombre || '';
        document.getElementById('proveedor-email').value = proveedor.email || '';
        document.getElementById('proveedor-telefono').value = proveedor.telefono || '';
        document.getElementById('proveedor-direccion').value = proveedor.direccion || '';

        document.getElementById('modal-proveedor-titulo').textContent = 'Editar Proveedor';
        document.getElementById('modal-proveedor').style.display = 'block';
    } catch (error) {
        alert('Error al cargar el proveedor: ' + error.message);
    }
};

window.eliminarProveedor = async function(id, nombre) {
    if (!confirm(`¿Estás seguro de eliminar el proveedor "${nombre}"? Los productos asociados quedarán sin proveedor.`)) {
        return;
    }

    try {
        const response = await fetch(`${endpoint}/proveedores/${id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Error al eliminar proveedor');
        }

        alert('Proveedor eliminado con éxito');
        cargarProveedores();
    } catch (error) {
        alert('Error al eliminar proveedor: ' + error.message);
    }
};

// Cargar proveedores para el select
async function cargarProveedoresSelect() {
    try {
        const response = await fetch(`${endpoint}/proveedores`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
        });

        if (response.ok) {
            const proveedores = await response.json();
            const select = document.getElementById('producto-proveedor');
            select.innerHTML = '<option value="">Sin proveedor</option>';
            proveedores.forEach(prov => {
                select.innerHTML += `<option value="${prov.id}">${prov.nombre}</option>`;
            });
        }
    } catch (error) {
        console.error('Error al cargar proveedores para select:', error);
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    cargarProductos();
    cargarProveedoresSelect();

    // Botón agregar producto
    document.getElementById('btn-agregar-producto').addEventListener('click', () => {
        document.getElementById('form-producto').reset();
        document.getElementById('producto-id').value = '';
        document.getElementById('modal-producto-titulo').textContent = 'Agregar Producto';
        document.getElementById('modal-producto').style.display = 'block';
        cargarProveedoresSelect();
    });

    // Botón agregar proveedor
    document.getElementById('btn-agregar-proveedor').addEventListener('click', () => {
        document.getElementById('form-proveedor').reset();
        document.getElementById('proveedor-id').value = '';
        document.getElementById('modal-proveedor-titulo').textContent = 'Agregar Proveedor';
        document.getElementById('modal-proveedor').style.display = 'block';
    });

    // Formulario producto
    document.getElementById('form-producto').addEventListener('submit', async (e) => {
        e.preventDefault();

        const productoId = document.getElementById('producto-id').value;
        const producto = {
            name: document.getElementById('producto-name').value,
            tipo: document.getElementById('producto-tipo').value,
            categoria: document.getElementById('producto-categoria').value,
            precio: parseFloat(document.getElementById('producto-precio').value),
            descripcion: document.getElementById('producto-descripcion').value,
            imagen: document.getElementById('producto-imagen').value || '/media/organic-spa-products-white-background.jpg',
            stock: parseInt(document.getElementById('producto-stock').value),
            proveedor_id: document.getElementById('producto-proveedor').value || null
        };

        try {
            const url = productoId ? `${endpoint}/productos/${productoId}` : `${endpoint}/productos`;
            const method = productoId ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify(producto),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Error al guardar producto');
            }

            alert(productoId ? 'Producto actualizado con éxito' : 'Producto creado con éxito');
            cerrarModalProducto();
            cargarProductos();
        } catch (error) {
            alert('Error: ' + error.message);
        }
    });

    // Formulario proveedor
    document.getElementById('form-proveedor').addEventListener('submit', async (e) => {
        e.preventDefault();

        const proveedorId = document.getElementById('proveedor-id').value;
        const proveedor = {
            nombre: document.getElementById('proveedor-nombre').value,
            email: document.getElementById('proveedor-email').value,
            telefono: document.getElementById('proveedor-telefono').value,
            direccion: document.getElementById('proveedor-direccion').value || null
        };

        try {
            const url = proveedorId ? `${endpoint}/proveedores/${proveedorId}` : `${endpoint}/proveedores`;
            const method = proveedorId ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify(proveedor),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Error al guardar proveedor');
            }

            alert(proveedorId ? 'Proveedor actualizado con éxito' : 'Proveedor creado con éxito');
            cerrarModalProveedor();
            cargarProveedores();
            cargarProveedoresSelect();
        } catch (error) {
            alert('Error: ' + error.message);
        }
    });
});

