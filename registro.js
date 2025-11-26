// registro.js
const API_BASE = "https://backendfinal-rkrx.onrender.com/api";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("registerForm");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;

    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });

      if (!res.ok) {
        const err = await res.json().catch(()=>null);
        alert(err?.error || err?.message || `Error al registrar (status ${res.status})`);
        return;
      }

      alert("Usuario creado ✅. Ahora inicia sesión.");
      window.location.href = "Login.html";
    } catch (error) {
      console.error("register error:", error);
      alert("Error de conexión al backend.");
    }
  });
});