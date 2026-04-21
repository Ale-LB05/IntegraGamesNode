const formLogin = document.getElementById("loginForm");
const msg = document.getElementById("msg");
const btnSubmit = document.getElementById("btnSubmit");

formLogin.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Estado de carga UX
  const originalText = btnSubmit.innerHTML;
  btnSubmit.innerHTML =
    '<i class="fa-solid fa-spinner fa-spin me-1"></i> Validando...';
  btnSubmit.disabled = true;

  // Limpiar mensajes previos
  msg.textContent = "";
  msg.style.color = "";

  const body = {
    correo: document.getElementById("correo").value.trim(),
    password: document.getElementById("password").value.trim(),
  };

  try {
    const resp = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await resp.json();

    // Si la respuesta del servidor no es OK (Ej. 401 Unauthorized)
    if (!resp.ok) {
      msg.textContent = data.error || "Credenciales incorrectas";
      msg.style.color = "#ff6b6b"; // Rojo claro que resalta en fondo oscuro

      // Restaurar el botón
      btnSubmit.innerHTML = originalText;
      btnSubmit.disabled = false;

      // Limpiar la contraseña para intentar de nuevo
      document.getElementById("password").value = "";
      return;
    }

    // ÉXITO: Guardar sesión (JWT)
    localStorage.setItem("token", data.token);
    localStorage.setItem("usuario", data.usuario);
    localStorage.setItem("rol", data.rol);

    // Mensaje de éxito
    msg.textContent = `¡Bienvenido, ${data.usuario}!`;
    msg.style.color = "#00d2ff"; // Azul cyan
    btnSubmit.innerHTML =
      '<i class="fa-solid fa-check me-1"></i> Accediendo...';

    // Redirigir al panel principal
    setTimeout(() => {
      window.location.href = "/menu.html";
    }, 1200);
  } catch (error) {
    msg.textContent = "Error de conexión con el servidor.";
    msg.style.color = "#ff6b6b";

    btnSubmit.innerHTML = originalText;
    btnSubmit.disabled = false;
  }
});
