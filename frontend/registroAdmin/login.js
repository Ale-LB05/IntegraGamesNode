const formLogin = document.getElementById("loginForm");
const msg = document.getElementById("msg");

formLogin.addEventListener("submit", async (e) => {
  // Evita que la página intente cambiar de URL por su cuenta
  e.preventDefault();

  msg.textContent = "Validando...";
  msg.style.color = "blue";

  // Ahora enviamos "correo" porque así lo espera tu server.js
  const body = {
    correo: document.getElementById("correo").value.trim(),
    password: document.getElementById("password").value.trim(),
  };

  try {
    // Usamos ruta relativa porque el frontend y el backend viven en el mismo localhost
    const resp = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await resp.json();

    if (!resp.ok) {
      msg.textContent = data.error || "Credenciales incorrectas";
      msg.style.color = "red";
      return;
    }

    // Guardar sesión (JWT)
    localStorage.setItem("token", data.token);
    localStorage.setItem("usuario", data.usuario);
    localStorage.setItem("rol", data.rol);

    msg.textContent = "Bienvenido " + data.usuario;
    msg.style.color = "green";

    // Redirigir al panel principal
    setTimeout(() => {
      window.location.href = "/menu.html";
    }, 1000);
  } catch (error) {
    msg.textContent = "Error de conexión con el servidor";
    msg.style.color = "red";
  }
});
