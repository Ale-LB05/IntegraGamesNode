const API_URL = "/api/personal";
let nombreAnteriorUsuario = ""; // Para rastrear si el usuario se edita a sí mismo

window.onload = () => {
    // 1. Configurar barra superior y permisos
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
    // Si un alumno intenta entrar aquí, lo expulsamos
    if (rol === "participante") {
        window.location.href = "/menu.html";
        return;
    }

    // El promotor no puede gestionar personal, lo mandamos al menú
    if (rol === "promotor") {
        window.location.href = "/menu.html";
        return;
    }

    // 2. Inicializar funciones
    cargarPersonal();

    // Buscador en tiempo real
    const inputBuscador = document.getElementById("buscador");
    if (inputBuscador) {
        inputBuscador.addEventListener("input", function() {
            let value = this.value.toLowerCase();
            let items = document.querySelectorAll(".empleado-item");
            items.forEach(item => {
                let nombre = item.getAttribute("data-nombre") || "";
                let rolItem = item.getAttribute("data-rol") || "";
                if (nombre.includes(value) || rolItem.includes(value)) {
                    item.style.display = "";
                } else {
                    item.style.display = "none";
                }
            });
        });
    }
};

// ================= CARGAR PERSONAL =================
async function cargarPersonal() {
    const token = localStorage.getItem("token");
    const contenedor = document.getElementById("contenedor-personal");
    if (!contenedor) return;

    try {
        const res = await fetch(API_URL, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const result = await res.json();

        if (!result.success || result.data.length === 0) {
            contenedor.innerHTML = "<p class='text-center w-100'>No hay empleados registrados.</p>";
            return;
        }

        renderizarPersonal(result.data);
    } catch (error) {
        console.error("Error al cargar personal", error);
        contenedor.innerHTML = "<p class='text-center text-danger w-100'>Error de conexión con el servidor.</p>";
    }
}

function renderizarPersonal(datos) {
    const contenedor = document.getElementById("contenedor-personal");
    contenedor.innerHTML = "";

    datos.forEach(empleado => {
        let rutaFinal = "/img/responsables/sinFoto.jpg";

        // Limpiar el formato ["foto.jpg"] que viene de la base de datos
        if (empleado.imagen_urls && empleado.imagen_urls !== "[]") {
            try {
                const imgs = JSON.parse(empleado.imagen_urls);
                if (Array.isArray(imgs) && imgs.length > 0) {
                    rutaFinal = `/uploads/responsables/${imgs[0]}`;
                }
            } catch (e) {
                rutaFinal = `/uploads/responsables/${empleado.imagen_urls}`;
            }
        }

        contenedor.innerHTML += `
            <div class="col-12 mb-3 empleado-item" data-nombre="${empleado.nombre.toLowerCase()}">
                <div class="card shadow-sm p-3 d-flex flex-row justify-content-between align-items-center">
                    <div class="d-flex align-items-center">
                        <img src="${rutaFinal}" style="width:60px; height:60px; object-fit:cover; border-radius:50%;" 
                             onerror="this.src='/img/responsables/sinFoto.jpg'">
                        <div class="ml-3">
                            <h6 class="mb-0 fw-bold">${empleado.nombre}</h6>
                            <small class="text-muted">${empleado.correo}</small>
                        </div>
                    </div>
                    </div>
            </div>`;
    });
}

// ================= CREAR EMPLEADO =================
const formCrear = document.getElementById("formCrear");
if (formCrear) {
    formCrear.addEventListener("submit", async (e) => {
        e.preventDefault();
        Swal.fire({ title: 'Guardando...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

        const token = localStorage.getItem("token");
        const formData = new FormData(formCrear);

        try {
            const res = await fetch(`${API_URL}/crear`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
                body: formData
            });
            const result = await res.json();

            if (result.success) {
                $("#modalCrear").modal("hide");
                formCrear.reset();
                document.getElementById('previewNuevo').src = "/img/responsables/sinFoto.jpg";
                Swal.fire({ icon: 'success', title: '¡Éxito!', text: result.message, showConfirmButton: false, timer: 2000 });
                cargarPersonal();
            } else {
                Swal.fire('Error', result.error, 'error');
            }
        } catch (error) {
            Swal.fire('Error', 'Problema de conexión', 'error');
        }
    });
}

// ================= EDITAR EMPLEADO =================
function prepararEditar(id, nombre, correo, rol, imagen) {
    nombreAnteriorUsuario = nombre; // Guardamos para ver si se edita a sí mismo
    document.getElementById('editId').value = id;
    document.getElementById('editNombre').value = nombre;
    document.getElementById('editCorreo').value = correo;
    document.getElementById('editRol').value = rol;
    document.getElementById('previewEditar').src = imagen;
    document.getElementById('editContrasena').value = ""; // Limpiar campo pass
}

const formEditar = document.getElementById("formEditar");
if (formEditar) {
    formEditar.addEventListener("submit", async (e) => {
        e.preventDefault();
        Swal.fire({ title: 'Actualizando...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

        const token = localStorage.getItem("token");
        const formData = new FormData(formEditar);

        try {
            const res = await fetch(`${API_URL}/editar`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
                body: formData
            });
            const result = await res.json();

            if (result.success) {
                $("#modalEditar").modal("hide");
                Swal.fire({ icon: 'success', title: 'Actualizado', text: result.message, showConfirmButton: false, timer: 2000 });
                
                // LÓGICA CLAVE: Si te editaste a ti mismo, actualiza la sesión
                const usuarioLogueado = localStorage.getItem("usuario");
                if (nombreAnteriorUsuario === usuarioLogueado) {
                    const nuevoNombre = document.getElementById("editNombre").value;
                    const nuevoRol = document.getElementById("editRol").value;
                    localStorage.setItem("usuario", nuevoNombre);
                    localStorage.setItem("rol", nuevoRol);
                    
                    const nombreTop = document.getElementById("nombreUsuarioTop");
                    if(nombreTop) nombreTop.textContent = nuevoNombre + " - " + nuevoRol;
                }
                
                cargarPersonal();
            } else {
                Swal.fire('Error', result.error, 'error');
            }
        } catch (error) {
            Swal.fire('Error', 'Problema de conexión', 'error');
        }
    });
}

// ================= ELIMINAR EMPLEADO =================
function borraRegistro(id, nombre) {
    Swal.fire({
        title: `¿Eliminar a ${nombre}?`,
        text: "Esta acción también quitará al empleado de los eventos asignados.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#858796',
        confirmButtonText: 'Sí, eliminar',
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
                    Swal.fire({ icon: 'success', title: 'Eliminado', showConfirmButton: false, timer: 2000 });
                    
                    // Si el usuario se elimina a sí mismo por error, cerrar sesión
                    if (nombre === localStorage.getItem("usuario")) {
                        cerrarSesion();
                    } else {
                        cargarPersonal();
                    }
                } else {
                    Swal.fire('Error', data.error, 'error');
                }
            } catch (error) {
                Swal.fire('Error', 'Problema de conexión', 'error');
            }
        }
    });
}

// ================= UTILIDADES =================
function togglePassword(id, btn) {
    let input = document.getElementById(id);
    let icon = btn.querySelector("i");
    if (input.type === "password") {
        input.type = "text";
        icon.classList.replace("fa-eye", "fa-eye-slash");
    } else {
        input.type = "password";
        icon.classList.replace("fa-eye-slash", "fa-eye");
    }
}

function cerrarSesion() {
    localStorage.clear();
    window.location.href = "/registroAdmin/login.html";
}