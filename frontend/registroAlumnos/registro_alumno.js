// 1. Corregimos las rutas (apuntando al público y agregando /api/)
const API_EVENTOS = "/api/eventos_publicos";
const API_ESCUELAS = "/api/escuelas";
const API_REGISTRO = "/api/guardar_alumno";

window.onload = () => {
  cargarEscuelas();
  cargarEventos();
};

// =====================
// CARGAR ESCUELAS
// =====================
async function cargarEscuelas() {
  try {
    const res = await fetch(API_ESCUELAS);
    const data = await res.json();
    const select = document.getElementById("id_escuela");
    select.innerHTML = '<option value="">Selecciona una escuela</option>';

    data.forEach((e) => {
      select.innerHTML += `<option value="${e.id_escuela}">${e.nombre_escuela}</option>`;
    });
  } catch (error) {
    console.error("Error cargando escuelas:", error);
  }
}

// =====================
// CARGAR EVENTOS
// =====================
async function cargarEventos() {
  try {
    // Ahora usamos la nueva ruta pública
    const res = await fetch(API_EVENTOS);
    const data = await res.json();
    const select = document.getElementById("id_evento");
    select.innerHTML = '<option value="">Selecciona un evento</option>';

    data.forEach((e) => {
      select.innerHTML += `<option value="${e.id_evento}">${e.nombre_evento}</option>`;
    });
  } catch (error) {
    console.error("Error cargando eventos:", error);
  }
}

// =====================
// REGISTRAR
// =====================
document
  .getElementById("formRegistro")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const body = {
      nombre: document.getElementById("nombre").value,
      edad: document.getElementById("edad").value,
      id_evento: document.getElementById("id_evento").value,
      id_escuela: document.getElementById("id_escuela").value,
    };

    try {
      const resp = await fetch(API_REGISTRO, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await resp.json();

      if (!resp.ok) {
        alert(data.error || "Error al registrar");
        return;
      }

      alert("¡Registro exitoso! Bienvenido a IntegraGames.");

      // ===========================================================
      // TRUCO DE MAGIA: Guardamos al alumno en la sesión del navegador
      // para que el menú principal cargue como 'participante'.
      // ===========================================================
      localStorage.setItem("usuario", body.nombre);
      localStorage.setItem("rol", "participante");
      localStorage.setItem("token", "alumno_sin_token"); // Relleno para que no marque null

      // Redirigimos al HTML del menú
      window.location.href = "/menu.html";
    } catch (error) {
      console.error("Error:", error);
      alert("Error de conexión con el servidor");
    }
  });
