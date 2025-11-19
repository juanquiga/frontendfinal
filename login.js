// login.js
const API_BASE = "https://backendfinal-rkrx.onrender.com/api"; // tu backend

const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
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
        alert(err?.message || "Usuario/contraseña incorrectos");
        return;
      }

      const data = await res.json();
      // asumo que el backend devuelve { token: "..." }
      localStorage.setItem("token", data.token);
      localStorage.setItem("usuario", username);

      alert("Sesión iniciada ✅");
      window.location.href = "index.html";
    } catch (error) {
      console.error(error);
      alert("Error de conexión.");
    }
  });
}