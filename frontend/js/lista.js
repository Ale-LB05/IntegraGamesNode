const API_URL = "/api/historial-participantes";

window.onload = cargarLista;

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

    tabla.innerHTML = "";
    result.data.forEach((row) => {
      const fechaFormateada = row.fecha
        ? new Date(row.fecha).toLocaleDateString("es-MX")
        : "-";
      const calificacion = row.calificacion !== null ? row.calificacion : "-";

      tabla.innerHTML += `
                <tr>
                    <td class="font-weight-bold text-dark">${row.nombre}</td>
                    <td>${row.edad}</td>
                    <td>${row.nombre_evento || "-"}</td>
                    <td>${row.nombre_escuela || "-"}</td>
                    <td>${row.juego || "-"}</td>
                    <td>${fechaFormateada}</td>
                    <td>${calificacion}</td>
                    <td class="text-muted font-italic">${row.comentario || "-"}</td>
                </tr>
            `;
    });
  } catch (error) {
    console.error("Error:", error);
    tabla.innerHTML =
      '<tr><td colspan="8" class="text-danger">Error de conexión con el servidor</td></tr>';
  }
}
