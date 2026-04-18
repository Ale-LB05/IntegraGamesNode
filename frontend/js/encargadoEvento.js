const API_URL = "/api/historial-eventos";
let historialOriginal = []; // Variable global para guardar los datos originales

window.onload = () => {
  cargarHistorial();

  // Escuchamos lo que el usuario escribe en la barra de búsqueda
  const inputFiltro = document.getElementById("filtroHistorial");
  if (inputFiltro) {
    inputFiltro.addEventListener("input", filtrarTabla);
  }
};

async function cargarHistorial() {
  const token = localStorage.getItem("token");
  const tabla = document.querySelector("#tablaHistorial tbody");

  try {
    const res = await fetch(API_URL, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const result = await res.json();

    if (!result.success || result.data.length === 0) {
      tabla.innerHTML =
        '<tr><td colspan="5" class="text-center">No hay registros encontrados</td></tr>';
      return;
    }

    // Guardamos los datos recibidos en nuestra variable global
    historialOriginal = result.data;

    // Dibujamos la tabla por primera vez con todos los datos
    renderizarTabla(historialOriginal);
  } catch (error) {
    console.error("Error:", error);
    tabla.innerHTML =
      '<tr><td colspan="5" class="text-center text-danger">Error de conexión con el servidor</td></tr>';
  }
}

// ================= DIBUJAR LA TABLA =================
function renderizarTabla(data) {
  const tabla = document.querySelector("#tablaHistorial tbody");
  tabla.innerHTML = ""; // Limpiamos la tabla antes de dibujar

  // Si la búsqueda no encontró nada
  if (data.length === 0) {
    tabla.innerHTML =
      '<tr><td colspan="5" class="text-center text-muted">No se encontraron coincidencias...</td></tr>';
    return;
  }

  // Dibujamos las filas
  data.forEach((row) => {
    // Formateamos la fecha si existe (y le ajustamos la zona horaria para que sea exacta)
    let fechaFormateada = "-";
    if (row.fecha) {
      const d = new Date(row.fecha);
      d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
      fechaFormateada = d.toLocaleDateString("es-MX");
    }

    const responsable = row.nombre_responsable || "Sin asignar";

    tabla.innerHTML += `
        <tr>
            <td class="font-weight-bold">${row.nombre_evento}</td>
            <td>${row.lugar}</td>
            <td>${fechaFormateada}</td>
            <td>${responsable}</td>
            <td>${row.total_personas}</td>
        </tr>
    `;
  });
}

// ================= FILTRAR LA TABLA (BUSCADOR) =================
function filtrarTabla() {
  // Obtenemos lo que el usuario escribió, en minúsculas
  const texto = document.getElementById("filtroHistorial").value.toLowerCase();

  // Filtramos nuestro arreglo original
  const filtrados = historialOriginal.filter((row) => {
    const nombre = (row.nombre_evento || "").toLowerCase();
    const lugar = (row.lugar || "").toLowerCase();
    const responsable = (row.nombre_responsable || "Sin asignar").toLowerCase();

    // Comprobamos si el texto escrito coincide con alguno de los campos
    return (
      nombre.includes(texto) ||
      lugar.includes(texto) ||
      responsable.includes(texto)
    );
  });

  // Volvemos a dibujar la tabla, pero solo con los que pasaron el filtro
  renderizarTabla(filtrados);
}
