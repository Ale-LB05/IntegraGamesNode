const API_EVENTOS = "/api/eventos";
const API_PERSONAL = "/api/personal";

window.onload = cargarEventos;

// ================= CARGAR =================
async function cargarEventos() {
  const token = localStorage.getItem("token");
  try {
    const res = await fetch(API_EVENTOS, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const result = await res.json();
    const contenedor = document.getElementById("contenedor-eventos");
    contenedor.innerHTML = "";

    if (!result.success || result.data.length === 0) {
      contenedor.innerHTML =
        "<p class='text-center w-100'>No hay eventos registrados.</p>";
      return;
    }

    result.data.forEach((ev) => {
      // CORRECCIÓN AQUÍ: Usamos ev.responsable_nombre que es lo que manda el backend ahora
      const responsableTexto = ev.responsable_nombre
        ? `<span class="text-dark">${ev.responsable_nombre}</span>`
        : '<span class="text-secondary font-italic">Sin asignar</span>';

      contenedor.innerHTML += `
            <div class="col-12 mb-3">
                <div class="card shadow-sm p-3 d-flex flex-row justify-content-between align-items-center" style="border-radius:15px;">
                    <div class="d-flex align-items-center">
                        <img src="${ev.imagen}" class="img-evento">
                        <div>
                            <h5 class="mb-1 text-primary font-weight-bold">${ev.nombre_evento}</h5>
                            <small class="text-muted">
                                <strong>Fecha:</strong> ${ev.fecha} | <strong>Hora:</strong> ${ev.hora}<br>
                                <strong>Lugar:</strong> ${ev.lugar}<br>
                                <strong>Ubicación/Link:</strong> ${ev.ubicacion}<br>
                                <strong>Observaciones:</strong> ${ev.observaciones}<br>
                                <strong class="d-block mt-2 text-dark" style="font-size: 14px;">Representante: ${responsableTexto}</strong>
                            </small>
                        </div>
                    </div>
                    <div>
                        <button class="btn btn-primary btn-sm" title="Asignar Responsable" onclick="abrirAsignar('${ev.id_evento}', '${ev.responsable_id || ""}')">
                            <i class="fas fa-user-plus"></i>
                        </button>
                        <button class="btn btn-info btn-sm" title="Editar" onclick="abrirEditar('${ev.id_evento}', '${ev.nombre_evento}', '${ev.fecha}', '${ev.hora}', '${ev.lugar}', '${ev.ubicacion}', '${ev.observaciones}', '${ev.imagen}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-danger btn-sm" title="Eliminar" onclick="eliminarEvento('${ev.id_evento}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
            `;
    });
  } catch (error) {
    console.error("Error al cargar", error);
  }
}

// ================= CREAR =================
document
  .getElementById("formCrearEvento")
  .addEventListener("submit", async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const formData = new FormData();

    formData.append(
      "nombre_evento",
      document.getElementById("crearNombreEv").value,
    );
    formData.append("fecha", document.getElementById("crearFechaEv").value);
    formData.append("hora", document.getElementById("crearHoraEv").value);
    formData.append("lugar", document.getElementById("crearLugarEv").value);
    formData.append(
      "ubicacion",
      document.getElementById("crearUbicacionEv").value,
    );
    formData.append(
      "observaciones",
      document.getElementById("crearObsEv").value,
    );
    const archivo = document.getElementById("crearImagenEv").files[0];
    if (archivo) formData.append("imagen", archivo);

    try {
      const res = await fetch(`${API_EVENTOS}/crear`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error);
        return;
      }
      window.location.reload();
    } catch (err) {
      alert("Error de red.");
    }
  });

// ================= EDITAR =================
function abrirEditar(id, nombre, fecha, hora, lugar, ubicacion, obs, imagen) {
  document.getElementById("editIdEv").value = id;
  document.getElementById("editNombreEv").value = nombre;
  document.getElementById("editFechaEv").value = fecha;
  document.getElementById("editHoraEv").value = hora;
  document.getElementById("editLugarEv").value = lugar;
  document.getElementById("editUbicacionEv").value = ubicacion;
  document.getElementById("editObsEv").value = obs;
  document.getElementById("previewImagenEv").src = imagen;
  $("#modalEditarEvento").modal("show");
}

document
  .getElementById("formEditarEvento")
  .addEventListener("submit", async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const formData = new FormData();

    formData.append("id_evento", document.getElementById("editIdEv").value);
    formData.append(
      "nombre_evento",
      document.getElementById("editNombreEv").value,
    );
    formData.append("fecha", document.getElementById("editFechaEv").value);
    formData.append("hora", document.getElementById("editHoraEv").value);
    formData.append("lugar", document.getElementById("editLugarEv").value);
    formData.append(
      "ubicacion",
      document.getElementById("editUbicacionEv").value,
    );
    formData.append(
      "observaciones",
      document.getElementById("editObsEv").value,
    );
    const archivo = document.getElementById("editImagenEv").files[0];
    if (archivo) formData.append("imagen", archivo);

    try {
      const res = await fetch(`${API_EVENTOS}/editar`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error);
        return;
      }
      window.location.reload();
    } catch (err) {
      alert("Error de red.");
    }
  });

// ================= ELIMINAR =================
async function eliminarEvento(id) {
  if (confirm("¿Seguro que deseas eliminar este evento?")) {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_EVENTOS}/eliminar/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error);
        return;
      }
      window.location.reload();
    } catch (err) {
      alert("Error de red.");
    }
  }
}

// ================= ASIGNAR RESPONSABLE =================
// Recibimos el id_responsable_actual para cargarlo en el Modal
async function abrirAsignar(id_evento, id_responsable_actual) {
  document.getElementById("idEventoAsignar").value = id_evento;
  const token = localStorage.getItem("token");

  try {
    const res = await fetch(API_PERSONAL, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const result = await res.json();

    const select = document.getElementById("selectResponsable");
    select.innerHTML =
      '<option value="">Seleccione un representante...</option>';

    if (result.success && result.data) {
      result.data.forEach((emp) => {
        select.innerHTML += `<option value="${emp.id_responsable}">${emp.nombre} (${emp.rol})</option>`;
      });
    }

    // MAGIA: Si el evento ya tiene representante, lo seleccionamos automáticamente en la lista
    if (id_responsable_actual) {
      select.value = id_responsable_actual;
    }

    $("#modalAsignarResponsable").modal("show");
  } catch (error) {
    console.error("Error al cargar personal", error);
  }
}

document
  .getElementById("formAsignarResponsable")
  .addEventListener("submit", async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    const body = {
      id_evento: document.getElementById("idEventoAsignar").value,
      id_responsable: document.getElementById("selectResponsable").value,
    };

    try {
      const res = await fetch(`${API_EVENTOS}/asignar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error);
        return;
      }

      $("#modalAsignarResponsable").modal("hide");
      window.location.reload();
    } catch (err) {
      alert("Error de red.");
    }
  });
