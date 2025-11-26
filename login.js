// login.js
// Sistema de autenticación con backend Spring Boot

const API_URL = "https://backendfinal-rkrx.onrender.com";
// Cambiar a URL de producción: "https://your-backend-domain.com/api/public"

// Elementos del DOM
const loginForm = document.getElementById("login-form");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const btnSubmit = document.getElementById("btn-submit");
const alertContainer = document.getElementById("alert-container");
const togglePasswordBtn = document.getElementById("toggle-password");

// Toggle mostrar/ocultar contraseña
togglePasswordBtn.addEventListener("click", () => {
  const type = passwordInput.type === "password" ? "text" : "password";
  passwordInput.type = type;
  togglePasswordBtn.textContent = type === "password" ? "👁️" : "🙈";
});

// Mostrar alerta
function mostrarAlerta(mensaje, tipo = "error") {
  alertContainer.innerHTML = `
    <div class="alert alert-${tipo}">
      ${mensaje}
    </div>
  `;
  setTimeout(() => {
    alertContainer.innerHTML = "";
  }, 5000);
}

// Validar credenciales localmente (opcional - puedes quitarlo si prefieres validar solo en backend)
function validarCredenciales(username, password) {
  // Credenciales hardcoded para prueba rápida
  if (username === "admin" && password === "123456789") {
    return true;
  }
  return false;
}

// Guardar datos de sesión
function guardarSesion(userData) {
  localStorage.setItem("token", userData.token);
  localStorage.setItem("username", userData.username);
  localStorage.setItem("role", userData.role);
  localStorage.setItem("isLoggedIn", "true");
}

// Login con el backend
async function loginBackend(username, password) {
  try {
    const response = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (!response.ok || !data.ok) {
      throw new Error(data.error || "Error en el inicio de sesión");
    }

    return data.data; // { username, role, token }
  } catch (error) {
    console.error("Error en login:", error);
    throw error;
  }
}

// Manejar submit del formulario
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = usernameInput.value.trim();
  const password = passwordInput.value.trim();

  // Validación básica
  if (!username || !password) {
    mostrarAlerta("Por favor completa todos los campos", "error");
    return;
  }

  // Deshabilitar botón durante el proceso
  btnSubmit.disabled = true;
  btnSubmit.innerHTML = '<span class="loading"></span>Iniciando sesión...';

  try {
    // Opción 1: Validar contra backend
    const userData = await loginBackend(username, password);
    
    // Guardar sesión
    guardarSesion(userData);
    
    // Mostrar éxito
    mostrarAlerta("✅ Inicio de sesión exitoso. Redirigiendo...", "success");
    
    // Redirigir después de 1 segundo
    setTimeout(() => {
      // Redirigir según el rol
      if (userData.role === "ROLE_ADMIN") {
        window.location.href = "admin.html"; // Panel de administración
      } else {
        window.location.href = "Menu.html"; // Menú principal para usuarios
      }
    }, 1000);

  } catch (error) {
    // Si falla el backend, intentar validación local (fallback)
    if (validarCredenciales(username, password)) {
      // Crear token simulado para sesión local
      const mockUserData = {
        username: username,
        role: "ROLE_ADMIN",
        token: "mock_token_" + Date.now()
      };
      
      guardarSesion(mockUserData);
      mostrarAlerta("✅ Inicio de sesión exitoso (modo local). Redirigiendo...", "success");
      
      setTimeout(() => {
        window.location.href = "admin.html";
      }, 1000);
    } else {
      mostrarAlerta("❌ Usuario o contraseña incorrectos", "error");
      btnSubmit.disabled = false;
      btnSubmit.textContent = "Iniciar Sesión";
    }
  }
});

// Auto-completar credenciales de prueba (solo para desarrollo)
// Comentar o eliminar en producción
window.addEventListener("load", () => {
  // Si presionas Ctrl+Shift+D, llena credenciales de admin
  document.addEventListener("keydown", (e) => {
    if (e.ctrlKey && e.shiftKey && e.key === "D") {
      usernameInput.value = "admin";
      passwordInput.value = "123456789";
      mostrarAlerta("ℹ️ Credenciales de prueba cargadas", "success");
    }
  });
});

// Verificar si ya está logueado
if (localStorage.getItem("isLoggedIn") === "true") {
  const confirmacion = confirm("Ya tienes una sesión activa. ¿Deseas cerrarla e iniciar sesión nuevamente?");
  if (!confirmacion) {
    // Redirigir a la página principal
    const role = localStorage.getItem("role");
    if (role === "ROLE_ADMIN") {
      window.location.href = "admin.html";
    } else {
      window.location.href = "Menu.html";
    }
  } else {
    // Cerrar sesión actual
    localStorage.clear();
  }
}
