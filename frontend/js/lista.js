const API_URL = "/api/historial-participantes";
let datosOriginales = []; // Variable global para guardar los datos y poder filtrarlos

window.onload = () => {
  cargarLista();

  // Escuchamos los cambios en el buscador en tiempo real
  const inputFiltro = document.getElementById("filtro");
  if (inputFiltro) {
    inputFiltro.addEventListener("input", filtrarDatos);
  }
};

// ================= CARGAR DATOS DESDE LA API =================
async function cargarLista() {
  const token = localStorage.getItem("token");
  const tabla = document.querySelector("#tablaParticipantes tbody");

  try {
    const res = await fetch(API_URL, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const result = await res.json();

    if (!result.success || result.data.length === 0) {
      tabla.innerHTML =
        '<tr><td colspan="8">No hay registros encontrados</td></tr>';
      return;
    }

    // Guardamos los datos recibidos en la variable global
    datosOriginales = result.data;

    // Mostramos todos los datos por defecto al entrar
    mostrarDatos(datosOriginales);
  } catch (error) {
    console.error("Error:", error);
    tabla.innerHTML =
      '<tr><td colspan="8" class="text-danger">Error de conexión con el servidor</td></tr>';
  }
}

// ================= DIBUJAR DATOS EN LA TABLA =================
function mostrarDatos(data) {
  const tabla = document.querySelector("#tablaParticipantes tbody");
  tabla.innerHTML = "";

  // Si después de filtrar no hay nada, mostramos el mensaje
  if (data.length === 0) {
    tabla.innerHTML =
      '<tr><td colspan="8" class="text-muted py-3">No se encontraron coincidencias...</td></tr>';
    return;
  }

  // Recorremos los datos y creamos las filas
  data.forEach((row) => {
    const fechaFormateada = row.fecha
      ? new Date(row.fecha).toLocaleDateString("es-MX")
      : "-";
    const calificacion = row.calificacion !== null ? row.calificacion : "-";

    tabla.innerHTML += `
      <tr>
          <td class="font-weight-bold text-dark">${row.nombre || "-"}</td>
          <td>${row.edad || "-"}</td>
          <td>${row.nombre_evento || "-"}</td>
          <td>${row.nombre_escuela || "-"}</td>
          <td>${row.juego || "-"}</td>
          <td>${fechaFormateada}</td>
          <td>${calificacion}</td>
          <td class="text-muted font-italic">${row.comentario || "-"}</td>
      </tr>
    `;
  });
}

// ================= LÓGICA DEL BUSCADOR =================
function filtrarDatos() {
  const input = document.getElementById("filtro");
  const texto = input.value.toLowerCase();

  // Filtramos verificando que la propiedad exista (para que no rompa si viene null de la BD)
  const filtrados = datosOriginales.filter((p) => {
    return (
      (p.nombre && p.nombre.toLowerCase().includes(texto)) ||
      (p.edad && p.edad.toString().includes(texto)) ||
      (p.nombre_evento && p.nombre_evento.toLowerCase().includes(texto)) ||
      (p.nombre_escuela && p.nombre_escuela.toLowerCase().includes(texto)) ||
      (p.juego && p.juego.toLowerCase().includes(texto)) ||
      (p.fecha && p.fecha.toLowerCase().includes(texto)) ||
      (p.calificacion && p.calificacion.toString().includes(texto)) ||
      (p.comentario && p.comentario.toLowerCase().includes(texto))
    );
  });

  // Volvemos a dibujar la tabla pero solo con los que pasaron el filtro
  mostrarDatos(filtrados);
}
