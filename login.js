// login.js
const API_BASE = "https://backendfinal-rkrx.onrender.com/api";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  if (!form) {
    console.warn("loginForm not found in DOM");
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
      console.log("POST", `${API_BASE}/auth/login`, { username });
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });

      console.log("login response status:", res.status);
      if (!res.ok) {
        const err = await res.json().catch(()=>null);
        alert(err?.error || err?.message || "Usuario/contraseña incorrectos o error 404");
        return;
      }

      const data = await res.json();
      if (!data.token) {
        console.error("no token in response", data);
        alert("Login: respuesta inesperada del servidor");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("usuario", username);
      alert("Sesión iniciada ✅");
      window.location.href = "index.html";
    } catch (error) {
      console.error("login error:", error);
      alert("Error de conexión al backend. Revisa consola y network.");
    }
  });
});