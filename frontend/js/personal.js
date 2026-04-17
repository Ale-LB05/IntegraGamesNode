const API_URL = "/api/personal";

window.onload = cargarPersonal;

// ================= CARGAR PERSONAL =================
async function cargarPersonal() {
  const token = localStorage.getItem("token");

  try {
    const res = await fetch(API_URL, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const result = await res.json();

    const contenedor = document.getElementById("contenedor-personal");
    contenedor.innerHTML = ""; // Limpiar

    if (!result.success || result.data.length === 0) {
      contenedor.innerHTML =
        "<p class='text-center w-100'>No hay empleados registrados.</p>";
      return;
    }

    result.data.forEach((empleado) => {
      contenedor.innerHTML += `
            <div class="col-12 mb-3">
                <div class="card shadow-sm p-3 d-flex flex-row justify-content-between align-items-center" style="border-radius:15px;">
                    <div class="d-flex align-items-center">
                        <img src="${empleado.imagen}" style="width:60px; height:60px; object-fit:cover; border-radius:50%; margin-right:15px;">
                        <div>
                            <h6 class="mb-1">${empleado.nombre}</h6>
                            <small class="text-muted">
                                Correo: ${empleado.correo}<br>
                                Contraseña: ${empleado.contrasena}<br>
                                Rol: ${empleado.rol}
                            </small>
                        </div>
                    </div>
                    <div>
                        <button class="btn btn-info btn-sm" onclick="abrirEditar('${empleado.id_responsable}', '${empleado.nombre}', '${empleado.correo}', '${empleado.contrasena}', '${empleado.rol}', '${empleado.imagen}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="abrirEliminar('${empleado.id_responsable}', '${empleado.nombre}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
            `;
    });
  } catch (error) {
    console.error("Error al cargar personal", error);
  }
}

// ================= CREAR =================
document.getElementById("formCrear").addEventListener("submit", async (e) => {
  e.preventDefault();
  const token = localStorage.getItem("token");

  const formData = new FormData();
  formData.append("nombre", document.getElementById("crearNombre").value);
  formData.append("correo", document.getElementById("crearCorreo").value);
  formData.append(
    "contrasena",
    document.getElementById("crearContrasena").value,
  );
  formData.append("rol", document.getElementById("crearRol").value);

  const archivo = document.getElementById("crearImagen").files[0];
  if (archivo) formData.append("imagen", archivo);

  await fetch(`${API_URL}/crear`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  window.location.reload();
});

// ================= EDITAR =================
function abrirEditar(id, nombre, correo, contrasena, rol, imagen) {
  document.getElementById("editId").value = id;
  document.getElementById("editNombre").value = nombre;
  document.getElementById("editCorreo").value = correo;
  document.getElementById("editContrasena").value = contrasena;
  document.getElementById("editRol").value = rol;
  document.getElementById("previewImagen").src = imagen;

  $("#modalEditar").modal("show"); // Usar jQuery para abrir el modal de Bootstrap
}

document.getElementById("formEditar").addEventListener("submit", async (e) => {
  e.preventDefault();
  const token = localStorage.getItem("token");

  const formData = new FormData();
  formData.append("id", document.getElementById("editId").value);
  formData.append("nombre", document.getElementById("editNombre").value);
  formData.append("correo", document.getElementById("editCorreo").value);
  formData.append(
    "contrasena",
    document.getElementById("editContrasena").value,
  );
  formData.append("rol", document.getElementById("editRol").value);

  const archivo = document.getElementById("editImagen").files[0];
  if (archivo) formData.append("imagen", archivo);

  await fetch(`${API_URL}/editar`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  window.location.reload();
});

// ================= ELIMINAR =================
function abrirEliminar(id, nombre) {
  document.getElementById("deleteIdusuario").value = id;
  document.getElementById("nombreEmpleado").textContent = nombre;

  $("#modalEliminar").modal("show");
}

document
  .getElementById("formEliminar")
  .addEventListener("submit", async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const id = document.getElementById("deleteIdusuario").value;

    await fetch(`${API_URL}/eliminar/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    window.location.reload();
  });
