const API_URL = "/api/perfil";

window.onload = () => {
    const usuario = localStorage.getItem("usuario") || "Usuario";
    const rol = (localStorage.getItem("rol") || "").toLowerCase();

    // ================= SEGURIDAD Y ROLES =================
    // Los alumnos (participantes) no tienen perfil, los expulsamos al menú.
    if (rol === "participante") {
        window.location.href = "/menu.html";
        return;
    }

    // Configurar nombre en la barra superior
    const nombreTop = document.getElementById("nombreUsuarioTop");
    if(nombreTop) nombreTop.textContent = usuario + " - " + rol;

    // Ocultar menús si es promotor
    if (rol === "promotor") {
        const itemPersonal = document.getElementById("menuPersonal");
        const itemEscuelas = document.getElementById("menuEscuelas");
        if (itemPersonal) itemPersonal.style.display = "none";
        if (itemEscuelas) itemEscuelas.style.display = "none";
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

    // Inicializar carga de datos
    cargarPerfil();
};

// ================= OBTENER PERFIL Y EVENTOS =================
async function cargarPerfil() {
    const token = localStorage.getItem("token");
    try {
        const res = await fetch(API_URL, { 
            headers: { Authorization: `Bearer ${token}` } 
        });
        const result = await res.json();

        if (result.success) {
            const data = result.data;
            const user = data.usuario;
            const eventos = data.eventos_asignados || [];

            // Actualizar fotos (usamos el fallback genérico si no tiene o no carga)
            const imagenUrl = user.imagen || "/img/responsables/sinFoto.jpg";
            
            const perfilImgPrincipal = document.getElementById("perfilImgPrincipal");
            if (perfilImgPrincipal) {
                perfilImgPrincipal.src = imagenUrl;
                perfilImgPrincipal.onerror = function() { this.src = "/img/responsables/sinFoto.jpg"; };
            }

            const previewFoto = document.getElementById("previewFoto");
            if (previewFoto) {
                previewFoto.src = imagenUrl;
            }

            // Actualizar textos principales
            document.getElementById("perfilNombre").textContent = user.nombre;
            document.getElementById("perfilCorreo").textContent = user.correo;
            document.getElementById("perfilRol").textContent = user.rol.charAt(0).toUpperCase() + user.rol.slice(1);

            // Rellenar inputs de los Modales
            document.getElementById("editInputNombre").value = user.nombre;
            document.getElementById("editInputCorreo").value = user.correo;

            // Actualizar memoria (por si se cambió el nombre recientemente)
            localStorage.setItem("usuario", user.nombre);
            const rolActual = localStorage.getItem("rol") || "";
            document.getElementById("nombreUsuarioTop").textContent = user.nombre + " - " + rolActual;

            dibujarMisEventos(eventos);
        } else {
            Swal.fire("Error", "No se pudo cargar el perfil", "error");
        }
    } catch (error) {
        console.error("Error al cargar perfil:", error);
    }
}

// ================= DIBUJAR EVENTOS ASIGNADOS =================
function dibujarMisEventos(eventos) {
    const contenedor = document.getElementById("contenedor-mis-eventos");
    if (!contenedor) return;

    contenedor.innerHTML = "";

    if (eventos.length === 0) {
        contenedor.innerHTML = `
            <div class="alert alert-light border shadow-sm text-center py-4 rounded-4 text-muted">
                <i class="fas fa-calendar-times fa-3x mb-3" style="color: #cbd5e1;"></i><br>
                <h6 class="fw-bold">No tienes eventos asignados</h6>
                <p class="small mb-0">Cuando un administrador te asigne a un evento, aparecerá aquí.</p>
            </div>
        `;
        return;
    }

    const hoyStr = new Date().toISOString().split("T")[0];

    eventos.forEach(ev => {
        const evFecha = ev.fecha ? ev.fecha.split("T")[0] : "";
        const esPasado = evFecha !== "" && evFecha < hoyStr;
        
        const fechaParts = evFecha.split("-");
        const fechaLatina = fechaParts.length === 3 ? `${fechaParts[2]}/${fechaParts[1]}/${fechaParts[0]}` : "-";

        let horaTexto = "Horario no definido";
        if (ev.hora_inicio && ev.hora_fin) {
            horaTexto = `${ev.hora_inicio} - ${ev.hora_fin}`;
        }

        const bordeColor = esPasado ? "border-left: 5px solid #6c757d; opacity: 0.8;" : "border-left: 5px solid #1cc88a;";
        const badgeHTML = esPasado
            ? '<span class="badge bg-secondary text-white">Finalizado</span>'
            : '<span class="badge bg-success text-white">Próximo</span>';

        contenedor.innerHTML += `
            <div class="evento-card p-3 bg-white mb-3 shadow-sm rounded-3 d-flex align-items-center" style="${bordeColor}">
                <img src="${ev.imagen || '/img/default.png'}" class="evento-img shadow-sm" style="width: 80px; height: 80px; object-fit: cover; border-radius: 10px; margin-right: 15px;" onerror="this.src='/img/default.png'">
                <div class="evento-info flex-grow-1">
                    <div class="d-flex justify-content-between align-items-center mb-1">
                        <h6 class="fw-bold mb-0 text-dark">${ev.nombre_evento}</h6>
                        ${badgeHTML}
                    </div>
                    <small class="text-muted d-block mt-2">
                        <i class="fas fa-calendar-day mr-1" style="color: #4e73df;"></i> ${fechaLatina} &nbsp;|&nbsp;
                        <i class="fas fa-clock mr-1" style="color: #4e73df;"></i> ${horaTexto}
                    </small>
                    <small class="text-muted d-block mt-1">
                        <i class="fas fa-map-marker-alt mr-1" style="color: #e74a3b;"></i> ${ev.lugar || 'Sin ubicación'}
                    </small>
                </div>
            </div>
        `;
    });
}

// ================= MANEJO DE FORMULARIOS =================
const formNombre = document.getElementById("formNombre");
if (formNombre) {
    formNombre.addEventListener("submit", async (e) => {
        e.preventDefault();
        const fd = new FormData();
        fd.append("nombre", document.getElementById("editInputNombre").value);
        enviarActualizacion(fd, "#modalNombre", "nombre");
    });
}

const formCorreo = document.getElementById("formCorreo");
if (formCorreo) {
    formCorreo.addEventListener("submit", async (e) => {
        e.preventDefault();
        const fd = new FormData();
        fd.append("correo", document.getElementById("editInputCorreo").value);
        enviarActualizacion(fd, "#modalCorreo", "correo");
    });
}

const formPass = document.getElementById("formPass");
if (formPass) {
    formPass.addEventListener("submit", async (e) => {
        e.preventDefault();
        const nueva = document.getElementById("newPass").value;
        const confirmar = document.getElementById("confirmPass").value;
        
        if (nueva !== confirmar) {
            return Swal.fire("Error", "Las contraseñas no coinciden", "error");
        }
        if (nueva.length < 6) {
            return Swal.fire("Muy corta", "La contraseña debe tener al menos 6 caracteres", "warning");
        }

        const fd = new FormData();
        fd.append("contrasena", nueva);
        enviarActualizacion(fd, "#modalPass", "pass");
    });
}

const formFoto = document.getElementById("formFoto");
if (formFoto) {
    formFoto.addEventListener("submit", async (e) => {
        e.preventDefault();
        const fd = new FormData();
        const archivo = document.getElementById("editInputFoto").files[0];
        
        if (archivo) {
            fd.append("imagen", archivo);
            enviarActualizacion(fd, "#modalFoto", "foto");
        } else {
            Swal.fire("Atención", "Por favor selecciona una imagen primero", "info");
        }
    });
}

// ================= FUNCIÓN REUTILIZABLE DE ACTUALIZACIÓN =================
async function enviarActualizacion(formData, modalId, tipo) {
    Swal.fire({ title: 'Actualizando...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
    
    const token = localStorage.getItem("token");

    try {
        const res = await fetch(`${API_URL}/actualizar`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` }, // Form Data NO lleva Content-Type en fetch
            body: formData
        });
        
        const result = await res.json();

        if (result.success) {
            $(modalId).modal("hide");
            
            if(modalId === '#modalPass') document.getElementById("formPass").reset();
            if(modalId === '#modalFoto') document.getElementById("formFoto").reset();

            // Actualizar interfaz instantáneamente si cambió su nombre
            if (tipo === "nombre") {
                const nuevoNombre = formData.get("nombre");
                localStorage.setItem("usuario", nuevoNombre);
                const rolActual = localStorage.getItem("rol") || "";
                document.getElementById("nombreUsuarioTop").textContent = nuevoNombre + " - " + rolActual;
            }

            Swal.fire("Éxito", result.message || "Perfil actualizado", "success").then(() => {
                // Si cambió su foto, lo mejor es recargar para que se actualice la sesión y el backend devuelva la nueva ruta
                if (tipo === "foto") {
                    window.location.reload(); 
                } else {
                    cargarPerfil();
                }
            });

        } else {
            Swal.fire("Error", result.error, "error");
        }
    } catch (err) {
        Swal.fire("Error", "Fallo de conexión al servidor", "error");
    }
}

// ================= UTILIDADES =================
function previewImagen(event) {
    const file = event.target.files[0];
    
    if (file && file.size > 2000000) { // Máximo 2MB
        Swal.fire('Error', 'La imagen es muy pesada (máx 2MB)', 'error');
        event.target.value = "";
        return;
    }
    
    if (file) {
        const reader = new FileReader();
        reader.onload = e => document.getElementById('previewFoto').src = e.target.result;
        reader.readAsDataURL(file);
    }
}

function togglePassword(id, btn) {
    let input = document.getElementById(id);
    let icon = btn.querySelector("i");
    
    if (input.type === "password") {
        input.type = "text";
        icon.classList.remove("fa-eye");
        icon.classList.add("fa-eye-slash");
    } else {
        input.type = "password";
        icon.classList.remove("fa-eye-slash");
        icon.classList.add("fa-eye");
    }
}

function cerrarSesion() {
    localStorage.clear();
    window.location.href = "/registroAdmin/login.html";
}