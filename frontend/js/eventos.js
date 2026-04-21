const API_EVENTOS = "/api/eventos";
const API_PERSONAL = "/api/personal";

let eventosOriginales = [];
let personalOriginal = [];
let mapaGlobal = null;
let markerGlobal = null;
let inputDestinoId = "";

window.onload = () => {
    // 1. Configurar barra superior y roles
    const usuario = localStorage.getItem("usuario") || "Usuario";
    const rol = (localStorage.getItem("rol") || "").toLowerCase();

    const nombreTop = document.getElementById("nombreUsuarioTop");
    if (nombreTop) {
        nombreTop.textContent = usuario + " - " + rol;
    }

    // ================= SOLUCIÓN DE FOTOGRAFÍA =================
    let fotoPerfil = localStorage.getItem("foto");

    if (!fotoPerfil || fotoPerfil === "undefined" || fotoPerfil === "null") {
        fotoPerfil = "/img/responsables/sinFoto.jpg";
    }

    const imgTopBar = document.querySelector(".img-profile");
    if (imgTopBar) {
        imgTopBar.src = fotoPerfil;
        imgTopBar.onerror = function() {
            this.src = "/img/responsables/sinFoto.jpg";
        };
    }

    // ================= SEGURIDAD Y ROLES =================
    // Si es participante, no tiene nada que hacer en Gestión de Eventos
    if (rol === "participante") {
        window.location.href = "/menu.html";
        return;
    }

    // Si es promotor, ocultamos los accesos a Personal y Escuelas
    if (rol === "promotor") {
        const itemPersonal = document.getElementById("menuPersonal");
        const itemEscuelas = document.getElementById("menuEscuelas");
        if (itemPersonal) itemPersonal.style.display = "none";
        if (itemEscuelas) itemEscuelas.style.display = "none";
    }

    // 2. Inicializar carga de datos
    cargarEventos();
    cargarPersonal();

    const buscador = document.getElementById("buscador");
    if (buscador) {
        buscador.addEventListener("input", filtrarEventos);
    }
};

// ================= CARGAS PRINCIPALES =================
async function cargarEventos() {
    const token = localStorage.getItem("token");
    try {
        const res = await fetch(API_EVENTOS, { 
            headers: { Authorization: `Bearer ${token}` } 
        });
        const result = await res.json();
        
        let datosArray = [];
        if (Array.isArray(result)) datosArray = result;
        else if (result.data && Array.isArray(result.data)) datosArray = result.data;
        
        eventosOriginales = datosArray;
        procesarYRenderizar(eventosOriginales);
    } catch (error) {
        console.error("Error al cargar eventos:", error);
        const contActivos = document.getElementById("contenedor-activos");
        if(contActivos) contActivos.innerHTML = '<p class="text-danger text-center w-100">Hubo un error de conexión con el servidor.</p>';
    }
}

async function cargarPersonal() {
    const token = localStorage.getItem("token");
    try {
        const res = await fetch(API_PERSONAL, { 
            headers: { Authorization: `Bearer ${token}` } 
        });
        const result = await res.json();
        
        let datosArray = [];
        if (Array.isArray(result)) datosArray = result;
        else if (result.data && Array.isArray(result.data)) datosArray = result.data;
        
        personalOriginal = datosArray;
    } catch (error) {
        console.error("Error al cargar personal:", error);
    }
}

// ================= RENDERIZADO DE EVENTOS =================
function procesarYRenderizar(data) {
    const hoyStr = new Date().toISOString().split("T")[0];
    
    const activos = data.filter(ev => {
        const evFecha = ev.fecha ? ev.fecha.split("T")[0] : "";
        return evFecha >= hoyStr;
    });
    
    const pasados = data.filter(ev => {
        const evFecha = ev.fecha ? ev.fecha.split("T")[0] : "";
        return evFecha !== "" && evFecha < hoyStr;
    });

    renderizarLista(activos, "contenedor-activos", false);
    renderizarLista(pasados, "contenedor-pasados", true);
}

function renderizarLista(lista, containerId, esPasado) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = "";

    if (lista.length === 0) {
        const icono = esPasado ? 'fa-history' : 'fa-calendar-times';
        const texto = esPasado ? 'en el historial' : 'activos';
        container.innerHTML = `
            <div class="col-12">
                <div class="alert alert-light border text-center py-4 rounded-4">
                    <i class="fas ${icono} fa-3x text-muted mb-3"></i>
                    <h5 class="text-muted fw-bold">No hay eventos ${texto}</h5>
                </div>
            </div>`;
        return;
    }

    lista.forEach(ev => {
        const evFecha = ev.fecha ? ev.fecha.split("T")[0] : "";
        const fechaParts = evFecha.split("-");
        const fechaLatina = fechaParts.length === 3 ? `${fechaParts[2]}/${fechaParts[1]}/${fechaParts[0]}` : "-";
        
        const responsableNombre = ev.responsable_nombre || 'Sin asignar';
        
        let mapLink = "";
        if (ev.ubicacion && ev.ubicacion.trim() !== "") {
            let urlMaps = ev.ubicacion.trim();
            if (!urlMaps.startsWith("http")) {
                urlMaps = `http://maps.google.com/?q=${encodeURIComponent(urlMaps)}`;
            }
            mapLink = `
                <a href="${urlMaps}" target="_blank" class="btn btn-sm btn-outline-primary rounded-pill px-3 py-1">
                    <i class="fas fa-map mr-1"></i> Ver Mapa
                </a>`;
        }

        const claseCard = esPasado ? "evento-card pasado" : "evento-card";
        const badgeStatus = esPasado ? '<span class="badge bg-secondary text-white px-2 py-1 ml-3">Finalizado</span>' : "";
        
        let botonesAccion = "";
        if (esPasado) {
            botonesAccion = `
                <div class="d-flex align-items-center mt-2">
                    <span class="badge bg-white text-secondary border px-3 py-1 rounded-pill">
                        <i class="fas fa-user-check mr-1"></i> Asignado a: ${responsableNombre}
                    </span>
                    <button class="btn btn-outline-info btn-sm rounded-pill ml-3 shadow-sm" 
                        onclick="verInfoPasado('${ev.id_evento}', '${ev.nombre_evento.replace(/'/g, "\\'")}', '${fechaLatina}', '${(ev.observaciones || '').replace(/'/g, "\\'")}')">
                        <i class="fas fa-info-circle mr-1"></i> Ver detalles
                    </button>
                </div>`;
        } else {
            botonesAccion = `
                <div class="d-flex flex-wrap align-items-center" style="gap: 10px;">
                    <span class="badge bg-light text-dark border px-3 py-2 rounded-pill" style="font-weight: 500;">
                        <i class="fas fa-user-tie text-primary mr-1"></i> Responsable: ${responsableNombre}
                    </span>
                    ${mapLink}
                </div>`;
        }

        let sidebarAcciones = "";
        if (!esPasado) {
            sidebarAcciones = `
                <div class="acciones-evento">
                    <button class="btn btn-warning btn-sm text-dark font-weight-bold rounded-circle shadow-sm mb-2" title="Asignar Personal" 
                        onclick="abrirAsignacion('${ev.id_evento}', '${ev.nombre_evento.replace(/'/g, "\\'")}', '${ev.responsable_id || ""}', '${evFecha}')">
                        <i class="fas fa-user-cog"></i>
                    </button>
                    <button class="btn btn-info btn-sm text-white rounded-circle shadow-sm mb-2" title="Editar Evento" 
                        onclick="abrirEditar('${ev.id_evento}', '${ev.nombre_evento.replace(/'/g, "\\'")}', '${evFecha}', '${ev.hora_inicio || ""}', '${ev.hora_fin || ""}', '${(ev.lugar || "").replace(/'/g, "\\'")}', '${(ev.ubicacion || "").replace(/'/g, "\\'")}', '${(ev.observaciones || "").replace(/'/g, "\\'")}', '${ev.imagen || "/img/default.png"}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-danger btn-sm rounded-circle shadow-sm" title="Eliminar" 
                        onclick="eliminarEvento('${ev.id_evento}', '${ev.nombre_evento.replace(/'/g, "\\'")}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>`;
        }

        container.innerHTML += `
            <div class="col-12 evento-item" data-nombre="${(ev.nombre_evento || '').toLowerCase()}" data-lugar="${(ev.lugar || '').toLowerCase()}">
                <div class="${claseCard}">
                    <img src="${ev.imagen || '/img/default.png'}" class="img-evento shadow-sm" onerror="this.src='/img/default.png'">
                    <div class="flex-grow-1 mx-3 d-flex flex-column justify-content-center">
                        <div class="d-flex align-items-center mb-2">
                            <h5 class="fw-bold ${esPasado ? 'text-secondary' : 'text-dark'} mb-0">${ev.nombre_evento}</h5>
                            ${badgeStatus}
                        </div>
                        <div class="d-flex flex-wrap align-items-center mb-2" style="gap: 15px;">
                            <span class="text-muted small"><i class="fas fa-calendar-day mr-1" style="color: #4e73df;"></i> ${fechaLatina}</span>
                            <span class="text-muted small"><i class="fas fa-clock mr-1" style="color: #4e73df;"></i> ${ev.hora_inicio || '--:--'} - ${ev.hora_fin || '--:--'}</span>
                            <span class="text-muted small"><i class="fas fa-map-marker-alt mr-1" style="color: #e74a3b;"></i> ${ev.lugar || '-'}</span>
                        </div>
                        ${botonesAccion}
                    </div>
                    ${sidebarAcciones}
                </div>
            </div>`;
    });
}

// ================= BÚSQUEDA Y FILTROS =================
function filtrarEventos() {
    const texto = document.getElementById("buscador").value.toLowerCase();
    const filtrados = eventosOriginales.filter(ev => {
        const nombre = (ev.nombre_evento || "").toLowerCase();
        const lugar = (ev.lugar || "").toLowerCase();
        return nombre.includes(texto) || lugar.includes(texto);
    });
    procesarYRenderizar(filtrados);
}

function verInfoPasado(id, nombre, fecha, obs) {
    document.getElementById("contenidoInfoPasado").innerHTML = `
        <div class="text-center">
            <h4 class="fw-bold text-dark">${nombre}</h4>
            <p class="text-muted"><i class="fas fa-calendar-alt"></i> Realizado el ${fecha}</p>
            <hr>
            <h6 class="fw-bold text-primary text-left">Observaciones originales:</h6>
            <p class="text-left">${obs || "Sin observaciones registradas."}</p>
        </div>`;
    $("#modalInfoPasado").modal("show");
}

// ================= CRUD EVENTOS =================
const formCrearEvento = document.getElementById("formCrearEvento");
if (formCrearEvento) {
    formCrearEvento.addEventListener("submit", async (e) => {
        e.preventDefault();
        Swal.fire({ title: 'Guardando...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
        
        const token = localStorage.getItem("token");
        const formData = new FormData();
        
        formData.append("nombre_evento", document.getElementById("crearNombreEv").value);
        formData.append("fecha", document.getElementById("crearFechaEv").value);
        formData.append("hora_inicio", document.getElementById("crearHoraInicioEv").value);
        formData.append("hora_fin", document.getElementById("crearHoraFinEv").value);
        formData.append("lugar", document.getElementById("crearLugarEv").value);
        formData.append("ubicacion", document.getElementById("crearUbicacionEv").value);
        formData.append("observaciones", document.getElementById("crearObsEv").value);
        
        const archivo = document.getElementById("crearImagenEv").files[0];
        if (archivo) formData.append("imagen", archivo);

        try {
            const res = await fetch(`${API_EVENTOS}/crear`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
                body: formData
            });
            const data = await res.json();
            if (data.success) {
                Swal.fire("Éxito", "Evento creado", "success").then(() => window.location.reload());
            } else {
                Swal.fire("Error", data.error, "error");
            }
        } catch (err) {
            Swal.fire("Error", "Fallo de conexión", "error");
        }
    });
}

function abrirEditar(id, nombre, fecha, hora_inicio, hora_fin, lugar, ubicacion, obs, imagen) {
    document.getElementById("editIdEv").value = id;
    document.getElementById("editNombreEv").value = nombre;
    document.getElementById("editFechaEv").value = fecha;
    document.getElementById("editHoraInicioEv").value = hora_inicio;
    document.getElementById("editHoraFinEv").value = hora_fin;
    document.getElementById("editLugarEv").value = lugar;
    document.getElementById("editUbicacionEv").value = ubicacion;
    document.getElementById("editObsEv").value = obs;
    document.getElementById("previewImagenEv").src = imagen;
    $("#modalEditar").modal("show");
}

const formEditarEvento = document.getElementById("formEditarEvento");
if (formEditarEvento) {
    formEditarEvento.addEventListener("submit", async (e) => {
        e.preventDefault();
        Swal.fire({ title: 'Actualizando...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
        
        const token = localStorage.getItem("token");
        const formData = new FormData();
        
        formData.append("id_evento", document.getElementById("editIdEv").value);
        formData.append("nombre_evento", document.getElementById("editNombreEv").value);
        formData.append("fecha", document.getElementById("editFechaEv").value);
        formData.append("hora_inicio", document.getElementById("editHoraInicioEv").value);
        formData.append("hora_fin", document.getElementById("editHoraFinEv").value);
        formData.append("lugar", document.getElementById("editLugarEv").value);
        formData.append("ubicacion", document.getElementById("editUbicacionEv").value);
        formData.append("observaciones", document.getElementById("editObsEv").value);
        
        const archivo = document.getElementById("editImagenEv").files[0];
        if (archivo) formData.append("imagen", archivo);

        try {
            const res = await fetch(`${API_EVENTOS}/editar`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
                body: formData
            });
            const data = await res.json();
            if (data.success) {
                Swal.fire("Éxito", "Evento actualizado", "success").then(() => window.location.reload());
            } else {
                Swal.fire("Error", data.error, "error");
            }
        } catch (err) {
            Swal.fire("Error", "Fallo de conexión", "error");
        }
    });
}

function eliminarEvento(id, nombre) {
    Swal.fire({
        title: '¿Eliminar evento?',
        text: `Se borrará "${nombre}". Esta acción no se puede deshacer.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#858796',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    }).then(async (result) => {
        if (result.isConfirmed) {
            const token = localStorage.getItem("token");
            try {
                const res = await fetch(`${API_EVENTOS}/eliminar/${id}`, {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = await res.json();
                if (data.success) {
                    Swal.fire("Eliminado", "Evento borrado", "success").then(() => window.location.reload());
                } else {
                    Swal.fire("Error", data.error, "error");
                }
            } catch (err) {
                Swal.fire("Error", "Fallo de conexión", "error");
            }
        }
    });
}

// ================= ASIGNACIÓN DE PERSONAL =================
function abrirAsignacion(id_evento, nombre_evento, id_responsable_actual, fecha_evento) {
    document.getElementById("idEventoAsignar").value = id_evento;
    document.getElementById("asignarNombreEvento").innerText = nombre_evento;
    
    const parts = fecha_evento.split("-");
    document.getElementById("badgeFecha").innerHTML = `<i class="fas fa-calendar-day mr-1"></i> ${parts[2]}/${parts[1]}/${parts[0]}`;
    
    const select = document.getElementById("selectResponsable");
    select.innerHTML = '<option value="" style="color: #6c757d;">-- Dejar sin asignar --</option>';
    
    let optLibres = document.createElement("optgroup");
    optLibres.label = "DISPONIBLES";
    
    let optOcupados = document.createElement("optgroup");
    optOcupados.label = "OCUPADOS EN OTROS EVENTOS";

    personalOriginal.forEach(persona => {
        const eventoOcupado = eventosOriginales.find(ev => 
            ev.fecha && ev.fecha.split("T")[0] === fecha_evento && 
            ev.responsable_id === persona.id_responsable && 
            String(ev.id_evento) !== String(id_evento)
        );

        let option = document.createElement("option");
        option.value = persona.id_responsable;

        if (eventoOcupado) {
            option.text = `${persona.nombre} (Ocupado en: ${eventoOcupado.nombre_evento})`;
            option.dataset.eventoOcupado = eventoOcupado.nombre_evento;
            optOcupados.appendChild(option);
        } else {
            option.text = persona.nombre;
            optLibres.appendChild(option);
        }
    });

    if (optLibres.children.length > 0) select.appendChild(optLibres);
    if (optOcupados.children.length > 0) select.appendChild(optOcupados);
    
    select.value = id_responsable_actual || "";
    verificarAlertaOcupado();
    
    $("#modalAsignarResp").modal("show");
}

const selectResponsable = document.getElementById("selectResponsable");
if (selectResponsable) {
    selectResponsable.addEventListener("change", verificarAlertaOcupado);
}

function verificarAlertaOcupado() {
    const select = document.getElementById("selectResponsable");
    const warning = document.getElementById("warningOcupado");
    if (!select || !warning) return;

    const opcionSeleccionada = select.options[select.selectedIndex];
    
    if (opcionSeleccionada && opcionSeleccionada.dataset.eventoOcupado) {
        const nombreLimpio = opcionSeleccionada.text.split(" (")[0];
        warning.innerHTML = `<i class="fas fa-exclamation-triangle mr-1"></i> <b>${nombreLimpio}</b> ya tiene a su cargo el evento "<b>${opcionSeleccionada.dataset.eventoOcupado}</b>".`;
        warning.style.display = "block";
    } else {
        warning.style.display = "none";
    }
}

const formAsignarResp = document.getElementById("formAsignarResponsable");
if (formAsignarResp) {
    formAsignarResp.addEventListener("submit", async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token");
        const body = {
            id_evento: document.getElementById("idEventoAsignar").value,
            id_responsable: document.getElementById("selectResponsable").value
        };

        try {
            const res = await fetch(`${API_EVENTOS}/asignar`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(body)
            });
            const data = await res.json();
            if (data.success) {
                Swal.fire("Asignado", "Responsable actualizado", "success").then(() => window.location.reload());
            } else {
                Swal.fire("Error", data.error, "error");
            }
        } catch (err) {
            Swal.fire("Error", "Fallo de conexión", "error");
        }
    });
}

// ================= MANEJO DEL MAPA LEAFLET =================
function abrirModalMapa(idInputPadre) {
    inputDestinoId = idInputPadre;
    $("#modalSelectorMapa").modal("show");
}

$("#modalSelectorMapa").on("shown.bs.modal", function () {
    setTimeout(() => {
        const backdrops = document.querySelectorAll(".modal-backdrop");
        if (backdrops.length > 1) backdrops[1].style.zIndex = "1059";
    }, 10);

    let coordsIniciales = [19.7028, -101.1924]; // Morelia por defecto
    const valorActual = document.getElementById(inputDestinoId).value;
    
    if (valorActual && valorActual.includes(",")) {
        const [lat, lng] = valorActual.split(",");
        if (!isNaN(lat) && !isNaN(lng)) {
            coordsIniciales = [parseFloat(lat), parseFloat(lng)];
        }
    }

    if (!mapaGlobal) {
        mapaGlobal = L.map("mapaSecundario").setView(coordsIniciales, 15);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { 
            attribution: "© OpenStreetMap" 
        }).addTo(mapaGlobal);
        
        markerGlobal = L.marker(coordsIniciales, { draggable: true }).addTo(mapaGlobal);
        
        mapaGlobal.on("click", function (e) {
            markerGlobal.setLatLng(e.latlng);
            actualizarTexto(e.latlng.lat, e.latlng.lng);
        });
        
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

function actualizarTexto(lat, lng) {
    const textoCoord = document.getElementById("textoCoordenadas");
    if(textoCoord) textoCoord.innerText = `Coordenadas: ${lat.toFixed(5)}, ${lng.toFixed(5)}`;
}

async function buscarEnMapaSecundario(event) {
    const texto = document.getElementById("buscadorMapaSelector").value.trim();
    if (!texto) return Swal.fire("Atención", "Escribe un lugar para buscar", "warning");
    
    const btn = event.currentTarget;
    const htmlOriginal = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    
    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(texto)}`);
        const data = await response.json();
        
        if (data && data.length > 0) {
            const lat = parseFloat(data[0].lat);
            const lon = parseFloat(data[0].lon);
            mapaGlobal.setView([lat, lon], 16);
            markerGlobal.setLatLng([lat, lon]);
            actualizarTexto(lat, lon);
        } else {
            Swal.fire("Sin resultados", "No se encontró el lugar. Intenta agregando la ciudad.", "info");
        }
    } catch (error) {
        Swal.fire("Error", "Error de red al buscar el mapa.", "error");
    } finally {
        btn.innerHTML = htmlOriginal;
    }
}

function confirmarUbicacion() {
    if (markerGlobal) {
        const pos = markerGlobal.getLatLng();
        document.getElementById(inputDestinoId).value = `${pos.lat.toFixed(5)}, ${pos.lng.toFixed(5)}`;
    }
    $("#modalSelectorMapa").modal("hide");
}

$("#modalSelectorMapa").on("hidden.bs.modal", function () {
    if ($(".modal.show").length > 0) {
        $("body").addClass("modal-open");
    }
});

function cerrarSesion() {
    localStorage.clear();
    window.location.href = "/registroAdmin/login.html";
}