const API_URL = "/api/escuelas";
let dataTableInstance = null;

window.onload = () => {
    // 1. Configurar barra superior y permisos
    const usuario = localStorage.getItem("usuario") || "Usuario";
    const rol = (localStorage.getItem("rol") || "").toLowerCase();
    
    const nombreTop = document.getElementById("nombreUsuarioTop");
    if(nombreTop) {
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
    // Redirigir si es participante (no deben entrar aquí)
    if (rol === "participante") {
        window.location.href = "/menu.html";
        return;
    }

    // Ocultar menús si es promotor
    if (rol === "promotor") {
        const itemPersonal = document.getElementById("menuPersonal");
        const itemEscuelas = document.getElementById("menuEscuelas");
        if (itemPersonal) itemPersonal.style.display = "none";
        if (itemEscuelas) itemEscuelas.style.display = "none";
    }

    // 2. Inicializar funciones de la página
    cargarEscuelas();
    aplicarMascaraTelefono();
};

// ================= CARGAR DATOS Y DIBUJAR DATATABLES =================
async function cargarEscuelas() {
    const token = localStorage.getItem("token");
    try {
        const res = await fetch(API_URL, { 
            headers: { Authorization: `Bearer ${token}` } 
        });
        const result = await res.json();
        
        let datos = [];
        if (Array.isArray(result)) {
            datos = result;
        } else if (result.data && Array.isArray(result.data)) {
            datos = result.data;
        }
        
        dibujarTabla(datos);
    } catch (error) {
        console.error("Error al cargar escuelas:", error);
        Swal.fire("Error", "No se pudo conectar al servidor", "error");
    }
}

function dibujarTabla(datos) {
    // Si la tabla ya existía, la destruimos para recargarla limpia
    if (dataTableInstance !== null) {
        dataTableInstance.destroy();
    }

    const tbody = document.getElementById("cuerpoTablaEscuelas");
    if (!tbody) return;
    tbody.innerHTML = "";

    datos.forEach(escuela => {
        // Escapamos comillas para evitar errores en los botones
        const nombreEscapado = escuela.nombre_escuela.replace(/'/g, "\\'");
        const contactoEscapado = (escuela.contacto || "").replace(/'/g, "\\'");
        const direccionEscapada = (escuela.direccion || "").replace(/'/g, "\\'");

        tbody.innerHTML += `
            <tr>
                <td class="align-middle fw-bold text-dark text-left pl-4">${escuela.nombre_escuela}</td>
                <td class="align-middle text-secondary">${escuela.contacto || '-'}</td>
                <td class="align-middle text-muted text-left"><small>${escuela.direccion || '-'}</small></td>
                <td class="align-middle">
                    <span class="badge bg-light text-dark border px-3 py-2 rounded-pill" style="font-weight: 500; font-size: 0.85rem;">
                        <i class="fas fa-phone-alt mr-1 text-success small"></i> ${escuela.telefono || '-'}
                    </span>
                </td>
                <td class="align-middle">
                    <button class="btn btn-info btn-sm shadow-sm rounded-circle" data-toggle="modal" data-target="#modalEditar" 
                        onclick="prepararEditar('${escuela.id_escuela}', '${nombreEscapado}', '${contactoEscapado}', '${direccionEscapada}', '${escuela.telefono}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-danger btn-sm shadow-sm rounded-circle ml-1" 
                        onclick="eliminarEscuela('${escuela.id_escuela}', '${nombreEscapado}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    });

    // Inicializar DataTables
    dataTableInstance = $('#tablaEscuelas').DataTable({
        "pageLength": 10,
        "lengthMenu": [[5, 10, 25, 50, -1], [5, 10, 25, 50, "Todas"]],
        "language": {
            "lengthMenu": "Mostrar _MENU_ escuelas",
            "zeroRecords": "No se encontraron escuelas registradas",
            "info": "Mostrando página _PAGE_ de _PAGES_",
            "infoEmpty": "No hay datos disponibles",
            "infoFiltered": "(filtrado de _MAX_ totales)",
            "paginate": {
                "first": "Primera",
                "last": "Última",
                "next": "Siguiente >",
                "previous": "< Anterior"
            }
        }
    });

    // Enlazar buscador personalizado
    $('#buscadorPersonalizado').off('keyup').on('keyup', function() {
        dataTableInstance.search(this.value).draw();
    });
}

// ================= AGREGAR ESCUELA =================
const formAgregar = document.getElementById("formAgregarEscuela");
if (formAgregar) {
    formAgregar.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        let telefonoLimpio = document.getElementById("addTelefono").value.replace(/\D/g, '');
        if (telefonoLimpio.length !== 10) {
            return Swal.fire("Atención", "El teléfono debe tener exactamente 10 números", "warning");
        }

        Swal.fire({ title: 'Guardando...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

        const body = {
            nombre: document.getElementById("addNombre").value,
            contacto: document.getElementById("addContacto").value,
            direccion: document.getElementById("addDireccion").value,
            telefono: document.getElementById("addTelefono").value
        };

        const token = localStorage.getItem("token");
        try {
            const res = await fetch(`${API_URL}/crear`, {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}` 
                },
                body: JSON.stringify(body)
            });
            const data = await res.json();
            if (data.success) {
                $("#modalAgregar").modal("hide");
                formAgregar.reset();
                Swal.fire("Éxito", "Escuela agregada con éxito", "success");
                cargarEscuelas();
            } else {
                Swal.fire("Error", data.error, "error");
            }
        } catch (err) {
            Swal.fire("Error", "Problema de conexión", "error");
        }
    });
}

// ================= EDITAR ESCUELA =================
function prepararEditar(id, nombre, contacto, direccion, telefono) {
    document.getElementById("editId").value = id;
    document.getElementById("editNombre").value = nombre;
    document.getElementById("editContacto").value = contacto;
    document.getElementById("editDireccion").value = direccion;
    document.getElementById("editTelefono").value = telefono;
}

const formEditar = document.getElementById("formEditarEscuela");
if (formEditar) {
    formEditar.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        let telefonoLimpio = document.getElementById("editTelefono").value.replace(/\D/g, '');
        if (telefonoLimpio.length !== 10) {
            return Swal.fire("Atención", "El teléfono debe tener exactamente 10 números", "warning");
        }

        Swal.fire({ title: 'Actualizando...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

        const body = {
            id: document.getElementById("editId").value,
            nombre: document.getElementById("editNombre").value,
            contacto: document.getElementById("editContacto").value,
            direccion: document.getElementById("editDireccion").value,
            telefono: document.getElementById("editTelefono").value
        };

        const token = localStorage.getItem("token");
        try {
            const res = await fetch(`${API_URL}/editar`, {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}` 
                },
                body: JSON.stringify(body)
            });
            const data = await res.json();
            if (data.success) {
                $("#modalEditar").modal("hide");
                Swal.fire("Éxito", "Escuela actualizada", "success");
                cargarEscuelas();
            } else {
                Swal.fire("Error", data.error, "error");
            }
        } catch (err) {
            Swal.fire("Error", "Problema de conexión", "error");
        }
    });
}

// ================= ELIMINAR ESCUELA =================
function eliminarEscuela(id, nombre) {
    Swal.fire({
        title: '¿Estás seguro?',
        text: `Estás a punto de eliminar a ${nombre}. Si la escuela tiene historial en eventos, se bloqueará la acción.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#e74a3b',
        cancelButtonColor: '#858796',
        confirmButtonText: '<i class="fas fa-trash"></i> Sí, eliminar',
        cancelButtonText: 'Cancelar',
        reverseButtons: true
    }).then(async (result) => {
        if (result.isConfirmed) {
            const token = localStorage.getItem("token");
            try {
                const res = await fetch(`${API_URL}/eliminar/${id}`, {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = await res.json();
                if (data.success) {
                    Swal.fire("Eliminado", "Escuela eliminada", "success");
                    cargarEscuelas();
                } else {
                    Swal.fire("Error", data.error, "error");
                }
            } catch (err) {
                Swal.fire("Error", "Problema de conexión", "error");
            }
        }
    });
}

// ================= UTILIDADES =================
function aplicarMascaraTelefono() {
    document.querySelectorAll('.input-telefono').forEach(input => {
        input.addEventListener('input', function(e) {
            let x = e.target.value.replace(/\D/g, '').match(/(\d{0,3})(\d{0,3})(\d{0,4})/);
            e.target.value = !x[2] ? x[1] : '(' + x[1] + ') ' + x[2] + (x[3] ? '-' + x[3] : '');
        });
    });
}

function cerrarSesion() {
    localStorage.clear();
    window.location.href = "/registroAdmin/login.html";
}