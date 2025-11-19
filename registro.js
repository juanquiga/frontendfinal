// registro.js
const API_BASE = "https://backendfinal-rkrx.onrender.com/api"; // tu backend

const registerForm = document.getElementById("registerForm");
if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
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
        alert(err?.message || "No se pudo crear el usuario");
        return;
      }

      alert("Usuario creado ✅. Inicia sesión.");
      window.location.href = "login.html";
    } catch (error) {
      console.error(error);
      alert("Error de conexión.");
    }
  });
}