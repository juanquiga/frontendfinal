// Menu.js
// =========================
// CONFIG
// =========================
const API_BASE = "https://backendfinal-rkrx.onrender.com/api";
let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

// =========================
// CARGAR PRODUCTOS DESDE BACKEND
// =========================
async function cargarProductos() {
  try {
    const res = await fetch(`${API_BASE}/productos`);
    if (!res.ok) {
      console.error("Error fetch productos", res.status);
      return;
    }
    const productos = await res.json();

    const contenedor = document.getElementById("productos");
    if (!contenedor) return;
    contenedor.innerHTML = "";

    productos.forEach(prod => {
      // ajusta campo de imagen si tu backend lo nombra diferente
      const imagen = prod.imagenUrl || prod.imagen_url || prod.imagen || "placeholder.jpg";

      const card = document.createElement("div");
      card.classList.add("card");

      card.innerHTML = `
        <h3>${escapeHtml(prod.nombre)}</h3>
        <img src="${escapeHtml(imagen)}" alt="${escapeHtml(prod.nombre)}">
        <p>${escapeHtml(prod.descripcion || "")}</p>
        <p><strong>$${prod.precio} COP</strong></p>

        <button class="add-to-cart"
          data-product="${escapeHtml(prod.nombre)}"
          data-price="${prod.precio}">
          Agregar al Carrito
        </button>
      `;

      contenedor.appendChild(card);
    });

    asignarEventosCarrito();

  } catch (e) {
    console.error("Error cargando productos:", e);
  }
}

function escapeHtml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// =========================
// AÑADIR AL CARRITO
// =========================
function asignarEventosCarrito() {
  document.querySelectorAll(".add-to-cart").forEach(btn => {
    btn.addEventListener("click", () => {
      const producto = btn.dataset.product;
      const precio = parseInt(btn.dataset.price, 10) || 0;

      const item = carrito.find(i => i.producto === producto);

      if (item) {
        item.cantidad++;
      } else {
        carrito.push({ producto, precio, cantidad: 1 });
      }

      localStorage.setItem("carrito", JSON.stringify(carrito));
      alert(`${producto} añadido al carrito ✔️`);
    });
  });
}

// =========================
// INICIO
// =========================
cargarProductos();