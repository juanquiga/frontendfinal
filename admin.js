// admin.js - Admin panel for managing pedidos

const API_URL = "https://backendfinal-rkrx.onrender.com/api";

let todosPedidos = [];
let pedidosFiltrados = [];

// Check session on load
window.addEventListener("DOMContentLoaded", () => {
  verificarSesion();
  cargarPedidos();
  configurarEventos();
});

function verificarSesion() {
  const isLoggedIn = localStorage.getItem("isLoggedIn");
  const role = localStorage.getItem("role");
  const username = localStorage.getItem("username");

  if (isLoggedIn !== "true") {
    alert("⚠️ Debes iniciar sesión para acceder al panel de administración.");
    window.location.href = "Login.html";
    return;
  }

  if (role !== "ROLE_ADMIN") {
    alert("⚠️ No tienes permisos de administrador.");
    window.location.href = "Menu.html";
    return;
  }

  // Display username
  if (username) {
    document.getElementById("username-display").textContent = username;
  }
}

function cerrarSesion() {
  localStorage.clear();
  alert("✅ Sesión cerrada correctamente");
  window.location.href = "Login.html";
}

function configurarEventos() {
  // Search input
  document.getElementById("search-input").addEventListener("input", filtrarPedidos);
  
  // Estado filter
  document.getElementById("filter-estado").addEventListener("change", filtrarPedidos);
}

async function cargarPedidos() {
  try {
    const token = localStorage.getItem("token");
    
    // Try authenticated endpoint first
    let response = await fetch(`${API_URL}/pedidos`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    if (!response.ok) {
      // Fallback to public endpoint
      response = await fetch(`${API_URL}/public/pedidos`);
    }

    const data = await response.json();
    
    // Handle different response formats
    let pedidosRaw = [];
    if (Array.isArray(data)) {
      pedidosRaw = data;
    } else if (data.data && Array.isArray(data.data)) {
      pedidosRaw = data.data;
    } else if (data.pedidos && Array.isArray(data.pedidos)) {
      pedidosRaw = data.pedidos;
    } else {
      console.error("Formato de respuesta inesperado:", data);
      pedidosRaw = [];
    }

    // Normalize pedidos: parse items if it's a string, add id if missing
    todosPedidos = pedidosRaw.map((pedido, index) => {
      let itemsParsed = pedido.items;
      
      // If items is a string, try to parse it
      if (typeof pedido.items === 'string') {
        try {
          itemsParsed = JSON.parse(pedido.items);
        } catch (e) {
          console.warn("Could not parse items for pedido:", pedido);
          itemsParsed = [];
        }
      }

      return {
        ...pedido,
        id: pedido.id || index + 1,
        items: Array.isArray(itemsParsed) ? itemsParsed : [],
        fecha: pedido.fecha || pedido["Columna 1"] || pedido.fechaCreacion,
        total: pedido.total || 0
      };
    });

    pedidosFiltrados = [...todosPedidos];
    actualizarEstadisticas();
    renderizarPedidos();
  } catch (error) {
    console.error("Error al cargar pedidos:", error);
    mostrarError("No se pudieron cargar los pedidos");
  }
}

function actualizarEstadisticas() {
  const total = todosPedidos.length;
  const pendiente = todosPedidos.filter(p => p.estado === "PENDIENTE").length;
  const atendido = todosPedidos.filter(p => p.estado === "ATENDIDO").length;
  const cancelado = todosPedidos.filter(p => p.estado === "CANCELADO").length;

  document.getElementById("stat-total").textContent = total;
  document.getElementById("stat-pendiente").textContent = pendiente;
  document.getElementById("stat-atendido").textContent = atendido;
  document.getElementById("stat-cancelado").textContent = cancelado;
}

function filtrarPedidos() {
  const searchTerm = document.getElementById("search-input").value.toLowerCase();
  const estadoFiltro = document.getElementById("filter-estado").value;

  pedidosFiltrados = todosPedidos.filter(pedido => {
    // Search filter
    const matchSearch = 
      pedido.nombre?.toLowerCase().includes(searchTerm) ||
      pedido.telefono?.toLowerCase().includes(searchTerm) ||
      pedido.direccion?.toLowerCase().includes(searchTerm) ||
      pedido.id?.toString().includes(searchTerm);

    // Estado filter
    const matchEstado = !estadoFiltro || pedido.estado === estadoFiltro;

    return matchSearch && matchEstado;
  });

  renderizarPedidos();
}

function renderizarPedidos() {
  const tbody = document.getElementById("pedidos-tbody");

  if (pedidosFiltrados.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="9" class="empty-state">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
          </svg>
          <h3>No se encontraron pedidos</h3>
          <p>Intenta ajustar los filtros de búsqueda</p>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = pedidosFiltrados
    .sort((a, b) => {
      // Sort by date if available, otherwise by id
      const dateA = new Date(a.fecha || 0).getTime();
      const dateB = new Date(b.fecha || 0).getTime();
      return dateB - dateA || b.id - a.id;
    })
    .map(pedido => {
      const itemsPreview = obtenerItemsPreview(pedido);
      const total = calcularTotal(pedido);
      const fecha = formatearFecha(pedido.fecha);

      return `
        <tr>
          <td><strong>#${pedido.id || "N/A"}</strong></td>
          <td>${fecha}</td>
          <td>${pedido.nombre || "N/A"}</td>
          <td>${pedido.telefono || "N/A"}</td>
          <td>${pedido.direccion || "N/A"}</td>
          <td>
            <span class="items-preview" onclick="verDetalles(${pedido.id})">
              ${itemsPreview}
            </span>
          </td>
          <td><strong>$${total.toFixed(2)}</strong></td>
          <td>
            <span class="estado-badge ${pedido.estado || 'PENDIENTE'}">
              ${pedido.estado || "PENDIENTE"}
            </span>
          </td>
          <td>
            ${renderizarAcciones(pedido)}
          </td>
        </tr>
      `;
    })
    .join("");
}

function renderizarAcciones(pedido) {
  if (pedido.estado === "PENDIENTE") {
    return `
      <button class="action-btn btn-atender" onclick="cambiarEstado(${pedido.id}, 'ATENDIDO')">
        ✓ Atender
      </button>
      <button class="action-btn btn-cancelar" onclick="cambiarEstado(${pedido.id}, 'CANCELADO')">
        ✗ Cancelar
      </button>
    `;
  }
  return `<span style="color: #999;">Sin acciones</span>`;
}

async function cambiarEstado(pedidoId, nuevoEstado) {
  const confirmMsg = nuevoEstado === "ATENDIDO" 
    ? "¿Marcar este pedido como ATENDIDO?" 
    : "¿Estás seguro de CANCELAR este pedido?";

  if (!confirm(confirmMsg)) return;

  try {
    const token = localStorage.getItem("token");
    const response = await fetch(
      `${API_URL}/pedidos/${pedidoId}/estado?estado=${nuevoEstado}`,
      {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    alert(`✅ Pedido ${nuevoEstado.toLowerCase()} correctamente`);
    await cargarPedidos(); // Reload data
  } catch (error) {
    console.error("Error al cambiar estado:", error);
    alert(`❌ Error al cambiar el estado del pedido: ${error.message}`);
  }
}

function obtenerItemsPreview(pedido) {
  if (!pedido.items || !Array.isArray(pedido.items) || pedido.items.length === 0) {
    return "Sin items";
  }

  const totalItems = pedido.items.reduce((sum, item) => sum + (item.cantidad || 0), 0);
  
  if (totalItems === 0) {
    return "Sin items";
  }

  const primerItem = pedido.items[0];
  
  return totalItems === 1 
    ? `1 × ${primerItem.nombre || primerItem.producto || "Producto"}`
    : `${totalItems} items (ver detalles)`;
}

function calcularTotal(pedido) {
  // If total is already calculated (Google Script format), use it
  if (pedido.total !== undefined && pedido.total !== null) {
    return parseFloat(pedido.total);
  }

  // Otherwise calculate from items
  if (!pedido.items || !Array.isArray(pedido.items) || pedido.items.length === 0) return 0;
  
  return pedido.items.reduce((sum, item) => {
    const precio = parseFloat(item.precio || 0);
    const cantidad = parseInt(item.cantidad || 0);
    return sum + (precio * cantidad);
  }, 0);
}

function formatearFecha(fecha) {
  if (!fecha) return "N/A";
  
  try {
    const date = new Date(fecha);
    const opciones = { 
      year: "numeric", 
      month: "short", 
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    };
    return date.toLocaleDateString("es-ES", opciones);
  } catch (e) {
    return fecha;
  }
}

function verDetalles(pedidoId) {
  const pedido = todosPedidos.find(p => p.id === pedidoId);
  if (!pedido) {
    alert("Pedido no encontrado");
    return;
  }

  const total = calcularTotal(pedido);
  const fecha = formatearFecha(pedido.fechaCreacion || pedido.fecha);

  const itemsHtml = pedido.items && pedido.items.length > 0
    ? pedido.items.map(item => `
        <div class="item-entry">
          <strong>${item.nombre || item.producto || "Producto"}</strong><br>
          Cantidad: ${item.cantidad || 0} × $${parseFloat(item.precio || 0).toFixed(2)} 
          = $${(parseFloat(item.precio || 0) * parseInt(item.cantidad || 0)).toFixed(2)}
        </div>
      `).join("")
    : "<p>No hay items en este pedido</p>";

  document.getElementById("modal-body").innerHTML = `
    <div class="detail-row">
      <strong>ID del Pedido</strong>
      <span>#${pedido.id || "N/A"}</span>
    </div>
    <div class="detail-row">
      <strong>Estado</strong>
      <span class="estado-badge ${pedido.estado || 'PENDIENTE'}">
        ${pedido.estado || "PENDIENTE"}
      </span>
    </div>
    <div class="detail-row">
      <strong>Fecha de Creación</strong>
      <span>${fecha}</span>
    </div>
    <div class="detail-row">
      <strong>Cliente</strong>
      <span>${pedido.nombre || "N/A"}</span>
    </div>
    <div class="detail-row">
      <strong>Teléfono</strong>
      <span>${pedido.telefono || "N/A"}</span>
    </div>
    <div class="detail-row">
      <strong>Dirección de Entrega</strong>
      <span>${pedido.direccion || "N/A"}</span>
    </div>
    <div class="detail-row">
      <strong>Items del Pedido</strong>
      <div class="items-list">
        ${itemsHtml}
      </div>
    </div>
    <div class="detail-row">
      <strong>Total</strong>
      <span style="font-size: 24px; color: #667eea;"><strong>$${total.toFixed(2)}</strong></span>
    </div>
  `;

  document.getElementById("modal-detalles").classList.add("active");
}

function cerrarModal() {
  document.getElementById("modal-detalles").classList.remove("active");
}

// Close modal on background click
document.getElementById("modal-detalles").addEventListener("click", (e) => {
  if (e.target.id === "modal-detalles") {
    cerrarModal();
  }
});

function mostrarError(mensaje) {
  const tbody = document.getElementById("pedidos-tbody");
  tbody.innerHTML = `
    <tr>
      <td colspan="9" class="empty-state">
        <h3>❌ Error</h3>
        <p>${mensaje}</p>
        <button class="btn-refresh" onclick="cargarPedidos()" style="margin-top: 15px;">
          🔄 Reintentar
        </button>
      </td>
    </tr>
  `;
}
