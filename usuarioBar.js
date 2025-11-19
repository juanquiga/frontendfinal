// usuarioBar.js
const API_BASE = "https://backendfinal-rkrx.onrender.com/api";

function escapeHtml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

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

    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("token");
        localStorage.removeItem("usuario");
        window.location.reload();
      });
    }
  }

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

document.addEventListener("DOMContentLoaded", renderUsuarioBar);