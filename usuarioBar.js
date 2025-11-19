// usuarioBar.js
const API_BASE = "https://backendfinal-rkrx.onrender.com/api"; // tu backend

function renderUsuarioBar() {
  const barra = document.getElementById("usuarioBar");
  const usuario = localStorage.getItem("usuario");
  const token = localStorage.getItem("token");

  if (!barra) return;

  if (!usuario || !token) {
    barra.innerHTML = `
      <div style="display:flex;gap:12px;justify-content:flex-end;padding:12px;">
        <a href="login.html" class="btn">Iniciar Sesión</a>
        <a href="registro.html" class="btn">Registrarse</a>
      </div>
    `;
  } else {
    barra.innerHTML = `
      <div style="display:flex;gap:12px;justify-content:flex-end;align-items:center;padding:12px;">
        <span style="font-weight:600;">Hola, ${escapeHtml(usuario)}</span>
        <button id="logoutBtn" class="btn">Cerrar sesión</button>
      </div>
    `;

    document.getElementById("logoutBtn").addEventListener("click", async () => {
      // opcional: notificar al backend (si tienes endpoint de logout)
      localStorage.removeItem("token");
      localStorage.removeItem("usuario");
      window.location.reload();
    });
  }

  // proteger enlaces a carrito (si existen)
  document.querySelectorAll('a[href*="Carrito.html"], a[href*="carrito"]').forEach(a => {
    a.addEventListener("click", (e) => {
      const tk = localStorage.getItem("token");
      if (!tk) {
        e.preventDefault();
        alert("Debes iniciar sesión para ver el carrito.");
        window.location.href = "login.html";
      }
    });
  });
}

// pequeña función para prevenir XSS en la inserción del nombre
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

document.addEventListener("DOMContentLoaded", renderUsuarioBar);