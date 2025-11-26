// Carrito.js
const API_BASE = "https://backendfinal-rkrx.onrender.com/api";
let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

function guardarCarrito() { localStorage.setItem("carrito", JSON.stringify(carrito)); }

function escapeHtml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function mostrarCarrito() {
  const contenedor = document.getElementById("lista-carrito");
  if (!contenedor) return;
  contenedor.innerHTML = "";

  let total = 0;
  carrito.forEach((item, index) => {
    total += item.precio * item.cantidad;
    const div = document.createElement("div");
    div.classList.add("carrito-item");
    div.dataset.index = index;
    div.innerHTML = `
      <span>${escapeHtml(item.producto)}</span>
      <div class="cantidad-control">
        <button class="btn-restar" data-index="${index}">-</button>
        <input type="number" min="1" value="${item.cantidad}" data-index="${index}" />
        <button class="btn-sumar" data-index="${index}">+</button>
      </div>
      <span>$${item.precio * item.cantidad}</span>
    `;
    contenedor.appendChild(div);
  });

  const totalDiv = document.createElement("h3");
  totalDiv.textContent = `Total: $${total}`;
  contenedor.appendChild(totalDiv);

  // Delegación de eventos en contenedor para evitar listeners duplicados
  contenedor.querySelectorAll(".btn-sumar").forEach(btn =>
    btn.addEventListener("click", e => {
      const idx = e.currentTarget.dataset.index;
      carrito[idx].cantidad++;
      guardarCarrito();
      mostrarCarrito();
    })
  );

  contenedor.querySelectorAll(".btn-restar").forEach(btn =>
    btn.addEventListener("click", e => {
      const idx = e.currentTarget.dataset.index;
      if (carrito[idx].cantidad > 1) carrito[idx].cantidad--;
      else carrito.splice(idx, 1);
      guardarCarrito();
      mostrarCarrito();
    })
  );

  contenedor.querySelectorAll(".cantidad-control input").forEach(input =>
    input.addEventListener("change", e => {
      const idx = e.currentTarget.dataset.index;
      let cant = parseInt(e.currentTarget.value, 10);
      if (isNaN(cant) || cant < 1) cant = 1;
      carrito[idx].cantidad = cant;
      guardarCarrito();
      mostrarCarrito();
    })
  );
}

document.addEventListener("DOMContentLoaded", mostrarCarrito);

// Envío del pedido - AHORA USA EL ENDPOINT PÚBLICO /api/public/pedidos
document.addEventListener("DOMContentLoaded", () => {
  const pedidoForm = document.getElementById("pedido-form");
  if (!pedidoForm) return;
  pedidoForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    // ELIMINADA LA VALIDACIÓN DE TOKEN - Ahora cualquiera puede hacer pedidos
    if (carrito.length === 0) { alert("El carrito está vacío."); return; }

    const data = {
      nombre: document.getElementById("nombre").value,
      telefono: document.getElementById("telefono").value,
      direccion: document.getElementById("direccion").value,
      items: JSON.stringify(carrito),
      total: carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0)
    };

    try {
      // CAMBIADO A ENDPOINT PÚBLICO: /api/public/pedidos (sin autenticación)
      const res = await fetch(`${API_BASE}/public/pedidos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      if (!res.ok) {
        const body = await res.json().catch(()=>null);
        console.error("Error creating order:", body);
        alert(body?.error || `Error creando pedido (status ${res.status})`);
        return;
      }

      alert("✅ Pedido enviado correctamente");
      localStorage.removeItem("carrito");
      carrito = [];
      mostrarCarrito();
    } catch (err) {
      console.error(err);
      alert("❌ Error enviando el pedido");
    }
  });
});