/**
 * API Client Service
 * Centraliza todas las llamadas HTTP hacia el backend
 * Proporciona métodos typed para cada operación
 */

const API_BASE_URL = 'https://backendfinal-rkrx.onrender.com/api';

/**
 * Clase ApiClient
 * Maneja todas las comunicaciones con la API REST
 */
class ApiClient {
  
  /**
   * Método genérico para hacer peticiones HTTP
   * @param {string} endpoint - Ruta del endpoint
   * @param {string} method - Método HTTP (GET, POST, PUT, DELETE)
   * @param {Object} body - Datos para enviar
   * @returns {Promise<Object>} Respuesta de la API
   */
  static async request(endpoint, method = 'GET', body = null) {
    try {
      const options = {
        method,
        headers: {
          'Content-Type': 'application/json',
        }
      };

      // Si hay body, lo serializamos
      if (body) {
        options.body = JSON.stringify(body);
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
      
      // Si la respuesta es 204 (No Content), retornamos null
      if (response.status === 204) {
        return { success: true, message: 'Operación completada' };
      }

      const data = await response.json();

      // Si la respuesta no fue exitosa, lanzamos un error
      if (!response.ok) {
        throw new Error(data.message || 'Error en la solicitud');
      }

      return data;
    } catch (error) {
      console.error('Error en API:', error);
      throw error;
    }
  }

  // ==================== PRODUCTOS ====================

  /**
   * Obtiene todos los productos
   * @returns {Promise<Array>} Lista de productos
   */
  static async obtenerProductos() {
    const response = await this.request('/productos');
    return response.data || [];
  }

  /**
   * Obtiene un producto por ID
   * @param {number} id - ID del producto
   * @returns {Promise<Object>} Datos del producto
   */
  static async obtenerProducto(id) {
    const response = await this.request(`/productos/${id}`);
    return response.data;
  }

  /**
   * Crea un nuevo producto
   * @param {Object} producto - Datos del producto
   * @returns {Promise<Object>} Producto creado
   */
  static async crearProducto(producto) {
    const response = await this.request('/productos', 'POST', producto);
    return response.data;
  }

  /**
   * Actualiza un producto
   * @param {number} id - ID del producto
   * @param {Object} producto - Nuevos datos
   * @returns {Promise<Object>} Producto actualizado
   */
  static async actualizarProducto(id, producto) {
    const response = await this.request(`/productos/${id}`, 'PUT', producto);
    return response.data;
  }

  /**
   * Elimina un producto
   * @param {number} id - ID del producto
   * @returns {Promise<void>}
   */
  static async eliminarProducto(id) {
    await this.request(`/productos/${id}`, 'DELETE');
  }

  // ==================== PEDIDOS ====================

  /**
   * Obtiene todos los pedidos
   * @returns {Promise<Array>} Lista de pedidos
   */
  static async obtenerPedidos() {
    const response = await this.request('/pedidos');
    return response.data || [];
  }

  /**
   * Obtiene un pedido por ID
   * @param {number} id - ID del pedido
   * @returns {Promise<Object>} Datos del pedido
   */
  static async obtenerPedido(id) {
    const response = await this.request(`/pedidos/${id}`);
    return response.data;
  }

  /**
   * Obtiene pedidos por estado
   * @param {string} estado - PENDIENTE, ATENDIDO, o CANCELADO
   * @returns {Promise<Array>} Pedidos del estado especificado
   */
  static async obtenerPedidosPorEstado(estado) {
    const response = await this.request(`/pedidos/estado/${estado}`);
    return response.data || [];
  }

  /**
   * Crea un nuevo pedido
   * @param {Object} pedido - Datos del pedido
   * @returns {Promise<Object>} Pedido creado
   */
  static async crearPedido(pedido) {
    const response = await this.request('/pedidos', 'POST', pedido);
    return response.data;
  }

  /**
   * Cambia el estado de un pedido
   * @param {number} id - ID del pedido
   * @param {string} estado - Nuevo estado
   * @returns {Promise<Object>} Pedido actualizado
   */
  static async cambiarEstadoPedido(id, estado) {
    const response = await this.request(
      `/pedidos/${id}/estado?estado=${estado}`,
      'PUT'
    );
    return response.data;
  }
}

// ==================== USO EJEMPLOS ====================

/**
 * Ejemplo: Cargar productos en la página inicial
 */
async function cargarProductos() {
  try {
    const productos = await ApiClient.obtenerProductos();
    console.log('Productos cargados:', productos);
    mostrarProductos(productos);
  } catch (error) {
    console.error('Error al cargar productos:', error);
    mostrarError('No se pudieron cargar los productos');
  }
}

/**
 * Ejemplo: Crear un nuevo pedido desde el carrito
 */
async function finalizarCompra(datosCliente, itemsCarrito) {
  try {
    // Calcular total
    const total = itemsCarrito.reduce(
      (sum, item) => sum + (item.cantidad * item.precioUnitario),
      0
    );

    // Crear pedido
    const pedido = await ApiClient.crearPedido({
      nombreCliente: datosCliente.nombre,
      telefono: datosCliente.telefono,
      direccion: datosCliente.direccion,
      total: total,
      itemsJson: JSON.stringify(itemsCarrito)
    });

    console.log('Pedido creado:', pedido);
    alert(`Pedido creado exitosamente. ID: ${pedido.id}`);
    
    // Limpiar carrito
    localStorage.removeItem('carrito');
    
    // Redirigir a confirmación
    window.location.href = `/confirmacion.html?pedidoId=${pedido.id}`;
    
  } catch (error) {
    console.error('Error al crear pedido:', error);
    mostrarError('Error al procesar el pedido: ' + error.message);
  }
}

/**
 * Ejemplo: Dashboard - Ver pedidos pendientes
 */
async function cargarPedidosPendientes() {
  try {
    const pedidos = await ApiClient.obtenerPedidosPorEstado('PENDIENTE');
    console.log('Pedidos pendientes:', pedidos);
    mostrarPedidosEnTabla(pedidos);
  } catch (error) {
    console.error('Error:', error);
  }
}

/**
 * Ejemplo: Marcar pedido como atendido
 */
async function atenderPedido(pedidoId) {
  try {
    const pedido = await ApiClient.cambiarEstadoPedido(pedidoId, 'ATENDIDO');
    console.log('Pedido atendido:', pedido);
    alert('Pedido marcado como atendido');
    cargarPedidosPendientes(); // Recargar lista
  } catch (error) {
    console.error('Error:', error);
  }
}

/**
 * Funciones auxiliares para UI
 */
function mostrarProductos(productos) {
  const contenedor = document.getElementById('productos-container');
  if (!contenedor) return;

  contenedor.innerHTML = productos.map(p => `
    <div class="producto-card">
      <img src="${p.imagenUrl}" alt="${p.nombre}">
      <h3>${p.nombre}</h3>
      <p>${p.descripcion}</p>
      <p class="precio">$${p.precio.toLocaleString('es-CO')}</p>
      <button onclick="agregarAlCarrito(${p.id}, '${p.nombre}', ${p.precio})">
        Agregar al carrito
      </button>
    </div>
  `).join('');
}

function mostrarError(mensaje) {
  const alerta = document.createElement('div');
  alerta.className = 'alert alert-danger';
  alerta.textContent = mensaje;
  document.body.insertBefore(alerta, document.body.firstChild);
  setTimeout(() => alerta.remove(), 5000);
}

function agregarAlCarrito(productoId, nombre, precio) {
  let carrito = JSON.parse(localStorage.getItem('carrito') || '[]');
  
  const itemExistente = carrito.find(item => item.productoId === productoId);
  
  if (itemExistente) {
    itemExistente.cantidad++;
  } else {
    carrito.push({
      productoId,
      nombre,
      cantidad: 1,
      precioUnitario: precio
    });
  }
  
  localStorage.setItem('carrito', JSON.stringify(carrito));
  alert(`${nombre} agregado al carrito`);
}

// Exportar para uso en módulos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ApiClient;
}
