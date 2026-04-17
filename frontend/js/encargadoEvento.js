const API_URL = "/api/historial-eventos";

window.onload = cargarHistorial;

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
        '<tr><td colspan="5">No hay registros encontrados</td></tr>';
      return;
    }

    tabla.innerHTML = "";
    result.data.forEach((row) => {
      const fechaFormateada = row.fecha
        ? new Date(row.fecha).toLocaleDateString("es-MX")
        : "-";
      const responsable = row.nombre_responsable || "Sin asignar";

      // Aquí quitamos el recuadro azul para que salga el texto limpio
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
  } catch (error) {
    console.error("Error:", error);
    tabla.innerHTML =
      '<tr><td colspan="5" class="text-danger">Error de conexión con el servidor</td></tr>';
  }
}
