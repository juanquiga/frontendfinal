// login.js
const API_BASE = "https://backendfinal-rkrx.onrender.com/api";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });

      if (!res.ok) {
        const err = await res.json().catch(()=>null);
        alert(err?.error || err?.message || `Usuario/contraseña incorrectos (status ${res.status})`);
        return;
      }

      const data = await res.json();
      if (!data.token) { alert("Respuesta no tiene token"); return; }

      localStorage.setItem("token", data.token);
      localStorage.setItem("usuario", username);
      alert("Sesión iniciada ✅");
      window.location.href = "index.html";
    } catch (error) {
      console.error("login error:", error);
      alert("Error de conexión al backend.");
    }
  });
});