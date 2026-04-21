const API_URL = "/api/escuelas";
let dataTableInstance = null;

window.onload = () => {
    const usuario = localStorage.getItem("usuario") || "Usuario";
    const rol = (localStorage.getItem("rol") || "").toLowerCase();
    
    const nombreTop = document.getElementById("nombreUsuarioTop");
    if(nombreTop) nombreTop.textContent = usuario + " - " + rol;

    // SOLUCIÓN FOTO PERFIL GLOBAL
    const fotoGuardada = localStorage.getItem("foto");
    const imgTopBar = document.getElementById("imgUsuarioTop") || document.querySelector(".img-profile");

    if (imgTopBar) {
        if (!fotoGuardada || fotoGuardada.includes("user.jpg") || fotoGuardada === "undefined") {
            imgTopBar.src = "/img/responsables/sinFoto.jpg";
        } else {
            imgTopBar.src = fotoGuardada;
        }
        
        imgTopBar.onerror = function() {
            this.src = "/img/responsables/sinFoto.jpg";
        };
    }

    if (rol === "participante") {
        window.location.href = "/menu.html";
        return;
    }

    if (rol === "promotor") {
        const itemPersonal = document.getElementById("menuPersonal");
        const itemEscuelas = document.getElementById("menuEscuelas");
        if (itemPersonal) itemPersonal.style.display = "none";
        if (itemEscuelas) itemEscuelas.style.display = "none";
    }

    cargarEscuelas();
};

async function cargarEscuelas() {
    const token = localStorage.getItem("token");
    try {
        const res = await fetch(API_URL, { 
            headers: { Authorization: `Bearer ${token}` } 
        });
        const result = await res.json();
        
        let datos = [];
        if (Array.isArray(result)) datos = result;
        else if (result.data && Array.isArray(result.data)) datos = result.data;
        
        dibujarTabla(datos);
    } catch (error) {
        console.error("Error cargando escuelas:", error);
        Swal.fire("Error", "No se pudo cargar la lista de escuelas", "error");
    }
}

function dibujarTabla(datos) {
    if (dataTableInstance !== null) {
        dataTableInstance.destroy();
    }

    const tbody = document.getElementById("cuerpoTablaEscuelas");
    if (!tbody) return;
    tbody.innerHTML = "";

    datos.forEach(escuela => {
        // Empaquetamos TODOS los datos de forma segura para que no se rompan con comillas
        const dataSegura = JSON.stringify(escuela).replace(/'/g, "&apos;").replace(/"/g, "&quot;");
        const telefonoStr = escuela.telefono ? String(escuela.telefono) : "-";
        const nombreMostrar = escuela.nombre_escuela || escuela.nombre || "Sin nombre";

        tbody.innerHTML += `
            <tr>
                <td class="align-middle fw-bold text-dark text-left pl-4">${nombreMostrar}</td>
                <td class="align-middle text-secondary">${escuela.contacto || '-'}</td>
                <td class="align-middle text-muted text-left"><small>${escuela.direccion || '-'}</small></td>
                <td class="align-middle">
                    <span class="badge bg-light text-dark border px-3 py-2 rounded-pill" style="font-weight: 500; font-size: 0.85rem;">
                        <i class="fas fa-phone-alt mr-1 text-success small"></i> ${telefonoStr}
                    </span>
                </td>
                <td class="align-middle">
                    <button class="btn btn-info btn-sm shadow-sm rounded-circle btn-editar" data-info="${dataSegura}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-danger btn-sm shadow-sm rounded-circle btn-eliminar" data-info="${dataSegura}">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    });

    dataTableInstance = $('#tablaEscuelas').DataTable({
        "pageLength": 10,
        "lengthMenu": [[5, 10, 25, 50, -1], [5, 10, 25, 50, "Todas"]],
        "language": {
            "lengthMenu": "Mostrar _MENU_ escuelas",
            "zeroRecords": "No se encontraron escuelas",
            "info": "Página _PAGE_ de _PAGES_",
            "infoEmpty": "No hay datos",
            "infoFiltered": "(filtrado de _MAX_ totales)",
            "paginate": { "first": "Primera", "last": "Última", "next": "Siguiente >", "previous": "< Anterior" }
        }
    });

    $('#buscadorPersonalizado').off('keyup').on('keyup', function() {
        dataTableInstance.search(this.value).draw();
    });
}

// ================= BOTONES EDITAR Y ELIMINAR (Delegaicón Segura) =================
document.addEventListener("click", (e) => {
    // Escuchar botón Editar
    const btnEditar = e.target.closest(".btn-editar");
    if (btnEditar) {
        const data = JSON.parse(btnEditar.getAttribute("data-info"));
        
        // Asignamos asegurándonos de encontrar el ID sea cual sea su nombre en la base de datos
        document.getElementById("editId").value = data.id_escuela || data.id || "";
        document.getElementById("editNombre").value = data.nombre_escuela || data.nombre || "";
        document.getElementById("editContacto").value = data.contacto || "";
        document.getElementById("editDireccion").value = data.direccion || "";
        document.getElementById("editTelefono").value = String(data.telefono || "").replace(/\D/g, '');
        
        $("#modalEditar").modal("show");
    }

    // Escuchar botón Eliminar
    const btnEliminar = e.target.closest(".btn-eliminar");
    if (btnEliminar) {
        const data = JSON.parse(btnEliminar.getAttribute("data-info"));
        const id = data.id_escuela || data.id || "";
        const nombre = data.nombre_escuela || data.nombre || "";
        eliminarEscuela(id, nombre);
    }
});

// ================= CREAR ESCUELA =================
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
            telefono: parseInt(telefonoLimpio, 10) || 0 // Si falla, manda 0 para que no crashee la BD
        };

        const token = localStorage.getItem("token");
        try {
            const res = await fetch(`${API_URL}/crear`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify(body)
            });
            const data = await res.json();
            
            if (res.ok && data.success) {
                $("#modalAgregar").modal("hide");
                formAgregar.reset();
                Swal.fire("Éxito", "Escuela agregada con éxito", "success");
                cargarEscuelas();
            } else {
                Swal.fire("Error", data.error || "No se pudo agregar", "error");
            }
        } catch (err) { 
            Swal.fire("Error", "Error al conectar con el servidor", "error"); 
        }
    });
}

// ================= EDITAR ESCUELA =================
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
            telefono: parseInt(telefonoLimpio, 10) || 0
        };

        const token = localStorage.getItem("token");
        try {
            const res = await fetch(`${API_URL}/editar`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify(body)
            });
            const data = await res.json();
            
            if (res.ok && data.success) {
                $("#modalEditar").modal("hide");
                Swal.fire("Éxito", "Escuela actualizada", "success");
                cargarEscuelas();
            } else {
                Swal.fire("Error", data.error || "No se pudo actualizar", "error");
            }
        } catch (err) { 
            Swal.fire("Error", "Error al conectar con el servidor", "error"); 
        }
    });
}

// ================= ELIMINAR ESCUELA =================
function eliminarEscuela(id, nombre) {
    Swal.fire({
        title: '¿Estás seguro?',
        text: `Estás a punto de eliminar a ${nombre}.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#e74a3b',
        cancelButtonColor: '#858796',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    }).then(async (result) => {
        if (result.isConfirmed) {
            const token = localStorage.getItem("token");
            try {
                const res = await fetch(`${API_URL}/eliminar/${id}`, {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = await res.json();
                
                if (res.ok && data.success) {
                    Swal.fire("Eliminado", "Escuela eliminada", "success");
                    cargarEscuelas();
                } else {
                    Swal.fire("Error", data.error || "No se pudo eliminar", "error");
                }
            } catch (err) { 
                Swal.fire("Error", "Error al conectar con el servidor", "error"); 
            }
        }
    });
}

function cerrarSesion() {
    localStorage.clear();
    window.location.href = "/registroAdmin/login.html";
}