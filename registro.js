// registro.js
const API_BASE = "https://backendfinal-rkrx.onrender.com/api";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("registerForm");
  if (!form) {
    console.warn("registerForm not found in DOM");
    return;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const usernameEl = document.getElementById("username");
    const passwordEl = document.getElementById("password");
    if (!usernameEl || !passwordEl) {
      alert("Faltan campos de username/password en el HTML");
      return;
    }

    const username = usernameEl.value.trim();
    const password = passwordEl.value;

    try {
      console.log("POST", `${API_BASE}/auth/register`, { username });
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });

      console.log("register response status:", res.status);
      if (!res.ok) {
        const err = await res.json().catch(()=>null);
        alert(err?.error || err?.message || `Error al registrar (status ${res.status})`);
        return;
      }

      alert("Usuario creado ✅. Ahora inicia sesión.");
      window.location.href = "login.html";
    } catch (error) {
      console.error("register error:", error);
      alert("Error de conexión al backend.");
    }
  });
});