const API_EVENTOS = "/api/eventos";
const API_PERSONAL = "/api/personal";
let eventosOriginales = []; // Variable global para guardar y filtrar

window.onload = () => {
  cargarEventos();

  // Escuchamos el buscador en tiempo real
  const inputFiltro = document.getElementById("filtroEventos");
  if (inputFiltro) {
    inputFiltro.addEventListener("input", filtrarEventos);
  }
};

// ================= CARGAR =================
async function cargarEventos() {
  const token = localStorage.getItem("token");
  try {
    const res = await fetch(API_EVENTOS, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const result = await res.json();

    const contenedor = document.getElementById("contenedor-eventos");

    if (!result.success || result.data.length === 0) {
      contenedor.innerHTML =
        "<p class='text-center w-100'>No hay eventos registrados.</p>";
      return;
    }

    // Guardamos los datos recibidos en la variable global
    eventosOriginales = result.data;

    // Pintamos todos los eventos al iniciar
    renderizarEventos(eventosOriginales);
  } catch (error) {
    console.error("Error al cargar", error);
  }
}

// ================= DIBUJAR EVENTOS EN PANTALLA =================
function renderizarEventos(data) {
  const contenedor = document.getElementById("contenedor-eventos");
  contenedor.innerHTML = "";

  if (data.length === 0) {
    contenedor.innerHTML =
      "<p class='text-center w-100 text-muted mt-3'>No se encontraron coincidencias...</p>";
    return;
  }

  data.forEach((ev) => {
    const responsableTexto = ev.responsable_nombre
      ? `<span class="text-dark">${ev.responsable_nombre}</span>`
      : '<span class="text-secondary font-italic">Sin asignar</span>';

    // MAGIA PARA EL BOTÓN DE UBICACIÓN CIRCULAR
    let btnMapa = '<span class="text-muted">-</span>';
    if (ev.ubicacion && ev.ubicacion.trim() !== "") {
      let textoUbicacion = ev.ubicacion.trim();
      let urlMaps = textoUbicacion;

      // 1. Si son coordenadas del mapa, armamos el link a Google Maps
      if (/^-?\d+(\.\d+)?,\s*-?\d+(\.\d+)?$/.test(urlMaps)) {
        urlMaps = `https://www.google.com/maps/search/?api=1&query=${urlMaps.replace(/\s/g, "")}`;
      }
      // 2. Si es texto normal y no es un link web, lo mandamos como búsqueda
      else if (!urlMaps.startsWith("http")) {
        urlMaps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(urlMaps)}`;
      }

      // Imprimimos el texto original y a un lado el botón circular
      btnMapa = `
            <span>${textoUbicacion}</span>
            <a href="${urlMaps}" target="_blank" class="btn btn-sm btn-outline-danger btn-circle ml-2 shadow-sm" title="Abrir ubicación en Google Maps">
                <i class="fas fa-map-marker-alt"></i>
            </a>
        `;
    }

    contenedor.innerHTML += `
        <div class="col-12 mb-3">
            <div class="card shadow-sm p-3 d-flex flex-row justify-content-between align-items-center" style="border-radius:15px;">
                <div class="d-flex align-items-center">
                    <img src="${ev.imagen}" class="img-evento">
                    <div>
                        <h5 class="mb-1 text-primary font-weight-bold">${ev.nombre_evento}</h5>
                        <small class="text-muted">
                            <strong>Fecha:</strong> ${ev.fecha || "-"} | <strong>Hora:</strong> ${ev.hora || "-"}<br>
                            <strong>Lugar:</strong> ${ev.lugar || "-"}<br>
                            <strong>Ubicación:</strong> ${btnMapa}<br>
                            <strong>Observaciones:</strong> ${ev.observaciones || "-"}<br>
                            <strong class="d-block mt-2 text-dark" style="font-size: 14px;">Representante: ${responsableTexto}</strong>
                        </small>
                    </div>
                </div>
                <div>
                    <button class="btn btn-primary btn-sm" title="Asignar Responsable" onclick="abrirAsignar('${ev.id_evento}', '${ev.responsable_id || ""}')">
                        <i class="fas fa-user-plus"></i>
                    </button>
                    <button class="btn btn-info btn-sm" title="Editar" onclick="abrirEditar('${ev.id_evento}', '${ev.nombre_evento}', '${ev.fecha}', '${ev.hora || ""}', '${ev.lugar}', '${ev.ubicacion || ""}', '${ev.observaciones || ""}', '${ev.imagen}')">
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
}

// ================= FILTRAR =================
function filtrarEventos() {
  const texto = document.getElementById("filtroEventos").value.toLowerCase();

  const filtrados = eventosOriginales.filter((ev) => {
    const nombre = (ev.nombre_evento || "").toLowerCase();
    const fecha = (ev.fecha || "").toLowerCase();
    const lugar = (ev.lugar || "").toLowerCase();
    const ubicacion = (ev.ubicacion || "").toLowerCase();

    return (
      nombre.includes(texto) ||
      fecha.includes(texto) ||
      lugar.includes(texto) ||
      ubicacion.includes(texto)
    );
  });

  renderizarEventos(filtrados);
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

// ================= MAPA MODAL SECUNDARIO (SOBREPUESTO) =================
let mapaGlobal, markerGlobal;
let inputDestinoId = ""; // Guardará si estamos creando o editando

function abrirModalMapa(idInputPadre) {
  inputDestinoId = idInputPadre; // Recordamos a dónde mandar los datos
  $("#modalSelectorMapa").modal("show"); // Abrimos el modal de encima
}

// Configurar el mapa SOLO cuando el modal secundario ya está visible
$("#modalSelectorMapa").on("shown.bs.modal", function () {
  // 1. Truco para que el fondo gris no tape el segundo modal
  setTimeout(() => {
    const backdrops = document.querySelectorAll(".modal-backdrop");
    if (backdrops.length > 1) backdrops[1].style.zIndex = "1059";
  }, 10);

  // 2. Coordenadas por defecto (Morelia)
  let coordsIniciales = [19.7028, -101.1924];

  // 3. Si el input ya tenía algo escrito, intentamos abrir el mapa ahí
  const valorActual = document.getElementById(inputDestinoId).value;
  if (valorActual && valorActual.includes(",")) {
    const partes = valorActual.split(",");
    const lat = parseFloat(partes[0]);
    const lng = parseFloat(partes[1]);
    if (!isNaN(lat) && !isNaN(lng)) coordsIniciales = [lat, lng];
  }

  // 4. Inicializar o mover el mapa
  if (!mapaGlobal) {
    mapaGlobal = L.map("mapaSecundario").setView(coordsIniciales, 15);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(mapaGlobal);

    markerGlobal = L.marker(coordsIniciales, { draggable: true }).addTo(
      mapaGlobal,
    );

    // Al hacer clic, mover pin
    mapaGlobal.on("click", function (e) {
      markerGlobal.setLatLng(e.latlng);
      actualizarTexto(e.latlng.lat, e.latlng.lng);
    });

    // Al arrastrar pin
    markerGlobal.on("dragend", function () {
      const pos = markerGlobal.getLatLng();
      actualizarTexto(pos.lat, pos.lng);
    });
  } else {
    mapaGlobal.setView(coordsIniciales, 15);
    markerGlobal.setLatLng(coordsIniciales);
    mapaGlobal.invalidateSize();
  }

  actualizarTexto(coordsIniciales[0], coordsIniciales[1]);
});

// Función para actualizar los numeritos de abajo
function actualizarTexto(lat, lng) {
  document.getElementById("textoCoordenadas").innerText =
    `Coordenadas: ${lat.toFixed(5)}, ${lng.toFixed(5)}`;
}

// Buscador interno dentro del mapa secundario
async function buscarEnMapaSecundario() {
  const texto = document.getElementById("buscadorMapaSelector").value.trim();
  if (!texto) return alert("Escribe un lugar para buscar.");

  const btn = document.querySelector("#modalSelectorMapa .btn-primary");
  const htmlOriginal = btn.innerHTML;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(texto)}`,
    );
    const data = await response.json();

    if (data && data.length > 0) {
      const lat = parseFloat(data[0].lat);
      const lon = parseFloat(data[0].lon);
      mapaGlobal.setView([lat, lon], 16);
      markerGlobal.setLatLng([lat, lon]);
      actualizarTexto(lat, lon);
    } else {
      alert(
        "No se encontró el lugar. Intenta agregando la ciudad (ej: Catedral, Morelia).",
      );
    }
  } catch (error) {
    alert("Error de red.");
  } finally {
    btn.innerHTML = htmlOriginal;
  }
}

// Cuando el usuario le da clic en "Confirmar"
function confirmarUbicacion() {
  const pos = markerGlobal.getLatLng();

  // Pegamos el resultado en el formulario que está en el fondo
  document.getElementById(inputDestinoId).value = `${pos.lat}, ${pos.lng}`;

  // Cerramos el mapa
  $("#modalSelectorMapa").modal("hide");
}

// Truco vital de Bootstrap: Al cerrar el segundo modal, devolver el scroll al primer modal
$("#modalSelectorMapa").on("hidden.bs.modal", function () {
  if ($(".modal.show").length > 0) {
    $("body").addClass("modal-open");
  }
});
