const API_PERFIL = "/api/perfil";

// ================= SEGURIDAD Y CARGA INICIAL =================
window.onload = () => {
  // EL CANDADO: Si es un alumno (participante), lo sacamos de aquí.
  const rolActual = localStorage.getItem("rol");
  if (rolActual === "participante") {
    alert(
      "Acceso denegado. Los alumnos no pueden editar un perfil de sistema.",
    );
    window.location.href = "/menu.html";
    return;
  }

  cargarPerfil();
};

// ================= OBTENER DATOS DEL PERFIL =================
async function cargarPerfil() {
  const token = localStorage.getItem("token");

  try {
    const res = await fetch(API_PERFIL, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const result = await res.json();

    if (result.success) {
      const user = result.data;

      // Llenamos el formulario
      document.getElementById("inputNombre").value = user.nombre;
      document.getElementById("inputCorreo").value = user.correo;
      document.getElementById("inputContrasena").value = user.contrasena;
      document.getElementById("previewFoto").src = user.imagen;

      // Actualizamos la barra superior
      document.getElementById("nombreUsuarioTop").textContent =
        user.nombre + " - " + user.rol;
      document.getElementById("imgUsuarioTop").src = user.imagen;
    } else {
      alert("Error: No se pudo cargar la información de tu perfil.");
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

// ================= PREVISUALIZAR IMAGEN =================
document.getElementById("inputFoto").addEventListener("change", function (e) {
  if (e.target.files && e.target.files[0]) {
    let reader = new FileReader();
    reader.onload = function (ev) {
      document.getElementById("previewFoto").src = ev.target.result;
    };
    reader.readAsDataURL(e.target.files[0]);
  }
});

// ================= GUARDAR CAMBIOS =================
document.getElementById("formPerfil").addEventListener("submit", async (e) => {
  e.preventDefault();
  const token = localStorage.getItem("token");
  const formData = new FormData();

  formData.append("nombre", document.getElementById("inputNombre").value);
  formData.append("correo", document.getElementById("inputCorreo").value);
  formData.append(
    "contrasena",
    document.getElementById("inputContrasena").value,
  );

  const archivo = document.getElementById("inputFoto").files[0];
  if (archivo) formData.append("imagen", archivo);

  try {
    const res = await fetch(`${API_PERFIL}/actualizar`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    const result = await res.json();

    if (result.success) {
      alert("¡Tu perfil se ha actualizado correctamente!");
      // Actualizamos el nombre en la memoria del navegador
      localStorage.setItem("usuario", result.nuevoNombre);
      window.location.reload();
    } else {
      alert(result.error || "Ocurrió un error al guardar.");
    }
  } catch (error) {
    alert("Error de conexión con el servidor.");
  }
});
