// Menu.js

const URL_SHEET =
  "https://backendfinal-rkrx.onrender.com/api/public/menu";

// Inicializar carrito desde localStorage o vacío
let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

// Cargar productos desde Sheets
async function cargarProductos() {
  try {
    const res = await fetch(URL_SHEET);
    const json = await res.json();
    console.log("Respuesta Google Sheets:", json);

    // Accedemos a json.data
    let productos = json.data;

    if (!Array.isArray(productos)) {
      console.error("⚠️ El campo 'data' no es un array:", productos);
      return;
    }

    const contenedor = document.getElementById("productos");
    contenedor.innerHTML = "";

    productos.forEach((prod) => {
      const nombre = prod["Nombre "] || prod.Nombre;
      const precio = prod["Precio "] || prod.Precio;
      const descripcion = prod.Descripcion || "";

      let imagen = "placeholder.jpg";
      if (typeof prod.imagen === "string" && prod.imagen.trim() !== "") {
        if (prod.imagen.startsWith("http")) {
          imagen = prod.imagen.trim(); 
        } else {
          imagen = prod.imagen.trim(); 
        }
      }

      const card = document.createElement("div");
      card.classList.add("card");

      card.innerHTML = `
        <h3>${nombre}</h3>
        <img src="${imagen}" alt="${nombre}">
        <p>${descripcion}</p>
        <p><strong>$${precio} COP</strong></p>
        <button class="add-to-cart" data-product="${nombre}" data-price="${precio}">
          Agregar al Carrito
        </button>
      `;

      contenedor.appendChild(card);
    });

    // ⚡ Importante: re-asignar eventos después de cargar
    asignarEventosCarrito();
  } catch (error) {
    console.error("❌ Error cargando productos:", error);
  }
}

// Asignar eventos al carrito
function asignarEventosCarrito() {
  const botones = document.querySelectorAll(".add-to-cart");
  botones.forEach((boton) => {
    boton.addEventListener("click", () => {
      const producto = boton.getAttribute("data-product");
      const precio = parseInt(boton.getAttribute("data-price"));

      const item = carrito.find((i) => i.producto === producto);

      if (item) {
        item.cantidad++;
      } else {
        carrito.push({ producto, precio, cantidad: 1 });
      }

      localStorage.setItem("carrito", JSON.stringify(carrito));
      alert(`${producto} añadido al carrito ✅`);
    });
  });
}

// Llamamos a la carga al iniciar
cargarProductos();