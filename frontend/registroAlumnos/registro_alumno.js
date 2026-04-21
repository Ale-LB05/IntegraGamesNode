// ==========================================
// CONFIGURACIÓN DE RUTAS API
// ==========================================
const API_EVENTOS = "/api/eventos_publicos";
const API_ESCUELAS = "/api/escuelas";
const API_REGISTRO = "/api/guardar_alumno";

// Iniciar carga de datos cuando la página esté lista
window.onload = () => {
  cargarEscuelas();
  cargarEventos();
};

// 1. CARGAR ESCUELAS Y ACTIVAR SELECT2
async function cargarEscuelas() {
  const select = document.getElementById("selectEscuela");

  try {
    const res = await fetch(API_ESCUELAS);
    const result = await res.json(); // Le llamamos 'result' a la respuesta cruda

    // SOLUCIÓN: Desempacamos el arreglo. Si viene dentro de result.data, lo sacamos.
    let escuelas = [];
    if (Array.isArray(result)) {
        escuelas = result; // Por si algún día devuelve el arreglo directo
    } else if (result.success && Array.isArray(result.data)) {
        escuelas = result.data; // Aquí saca los datos de { success: true, data: [...] }
    }

    select.innerHTML = '<option value="">Buscar escuela...</option>';

    // Llenar el select con los datos correctos
    escuelas.forEach((e) => {
      select.innerHTML += `<option value="${e.id_escuela}">${e.nombre_escuela}</option>`;
    });

    // Inicializar Select2 con el tema de Bootstrap 5
    $("#selectEscuela")
      .select2({
        theme: "bootstrap-5",
        placeholder: "Buscar escuela...",
        width: "100%",
        language: {
          noResults: function () {
            return "No se encontró ninguna escuela";
          },
        },
      })
      .on("select2:open", function () {
        // Poner el placeholder en la barra de búsqueda de Select2
        document.querySelector(".select2-search__field").placeholder =
          "Escribe para buscar...";
      });
  } catch (error) {
    console.error("Error cargando escuelas:", error);
    select.innerHTML = '<option value="">Error al cargar escuelas</option>';
  }
}

// 2. CARGAR EVENTOS DEL DÍA (Desde el Backend)
async function cargarEventos() {
  const select = document.getElementById("id_evento");

  try {
    const res = await fetch(API_EVENTOS);
    const data = await res.json();

    // Si el backend no devuelve eventos para el día de hoy
    if (data.length === 0) {
      select.innerHTML =
        '<option value="">No hay eventos programados para hoy</option>';
      select.disabled = true; // Deshabilitar el select si no hay eventos
      return;
    }

    // Si hay eventos, habilitar y mostrar
    select.disabled = false;
    select.innerHTML = '<option value="">Selecciona un evento</option>';
    data.forEach((e) => {
      select.innerHTML += `<option value="${e.id_evento}">${e.nombre_evento}</option>`;
    });
  } catch (error) {
    console.error("Error cargando eventos:", error);
    select.innerHTML = '<option value="">Error al cargar eventos</option>';
  }
}

// 3. ENVIAR FORMULARIO DE REGISTRO
document
  .getElementById("formRegistro")
  .addEventListener("submit", async (e) => {
    e.preventDefault(); // Evitar que la página se recargue

    const idEscuela = document.getElementById("selectEscuela").value;
    const idEvento = document.getElementById("id_evento").value;

    // Validación extra de seguridad
    if (!idEscuela || !idEvento) {
      alert("Por favor, selecciona una escuela y un evento válido.");
      return;
    }

    // Cambiar estado del botón para que el usuario sepa que está cargando
    const btnSubmit = document.getElementById("btnSubmit");
    const originalText = btnSubmit.innerHTML;
    btnSubmit.innerHTML =
      '<i class="fa-solid fa-spinner fa-spin me-2"></i> Ingresando...';
    btnSubmit.disabled = true;

    // Preparar los datos para enviar al servidor
    const body = {
      nombre: document.getElementById("nombre").value.trim(),
      edad: document.getElementById("edad").value,
      id_escuela: idEscuela,
      id_evento: idEvento,
    };

    try {
      const resp = await fetch(API_REGISTRO, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await resp.json();

      // Si el servidor responde con error (Ej. Faltan datos)
      if (!resp.ok) {
        alert(data.error || "Hubo un problema al registrarte.");
        btnSubmit.innerHTML = originalText;
        btnSubmit.disabled = false;
        return;
      }

      // ÉXITO: Guardar credenciales en el navegador
      localStorage.setItem("usuario", data.usuario);
      localStorage.setItem("rol", data.rol);
      localStorage.setItem("token", data.token);

      // Redirigir al panel principal
      window.location.href = "/menu.html";
    } catch (error) {
      console.error("Error en la petición POST:", error);
      alert("Error de conexión con el servidor. Intenta de nuevo.");

      // Restaurar el botón si hay error
      btnSubmit.innerHTML = originalText;
      btnSubmit.disabled = false;
    }
  });
