const API = "/api/escuelas";
window.onload = cargar;

// CARGAR
async function cargar() {
  const tabla = document.querySelector("#tablaEscuelas tbody");
  if (!tabla) return;

  try {
    const res = await fetch(API);
    const data = await res.json();
    tabla.innerHTML = "";

    if (data.length === 0) {
      tabla.innerHTML = `<tr><td colspan="6">No hay escuelas registradas</td></tr>`;
      return;
    }

    data.forEach((e) => {
      const contactoTexto = e.contacto ? e.contacto : "N/A";

      tabla.innerHTML += `
            <tr>
                <td>${e.id_escuela}</td>
                <td class="font-weight-bold">${e.nombre_escuela}</td>
                <td>${contactoTexto}</td>
                <td>${e.direccion}</td>
                <td>${e.telefono}</td>
                <td>
                    <button class="btn btn-info btn-sm"
                        onclick="editar(${e.id_escuela}, '${e.nombre_escuela}', '${e.contacto || ""}', '${e.direccion}', '${e.telefono}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="eliminar(${e.id_escuela})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>`;
    });
  } catch (error) {
    console.error("Error cargando:", error);
  }
}

// GUARDAR / ACTUALIZAR
async function guardar() {
  const token = localStorage.getItem("token");
  const id = document.getElementById("id").value;

  const body = {
    nombre: document.getElementById("nombre").value,
    contacto: document.getElementById("contacto").value,
    direccion: document.getElementById("direccion").value,
    telefono: document.getElementById("telefono").value,
  };

  let url = API;
  let method = "POST";

  if (id) {
    url += "/" + id;
    method = "PUT";
  }

  try {
    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });
    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Error al procesar");
      return;
    }
    $("#modalEscuela").modal("hide");
    location.reload();
  } catch (error) {
    console.error("Error guardando:", error);
  }
}

// ELIMINAR 
async function eliminar(id) {
  if (confirm("¿Estás seguro de que deseas eliminar esta escuela?")) {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(API + "/" + id, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (!res.ok) {
        // Muestra la alerta si está siendo utilizada
        alert(data.error);
      } else {
        location.reload();
      }
    } catch (error) {
      console.error("Error al eliminar:", error);
    }
  }
}

// EDITAR Y ABRIR MODAL
function editar(id, nombre, contacto, direccion, telefono) {
  document.getElementById("id").value = id;
  document.getElementById("nombre").value = nombre;
  document.getElementById("contacto").value = contacto;
  document.getElementById("direccion").value = direccion;
  document.getElementById("telefono").value = telefono;
  $("#modalEscuela").modal("show");
}

function abrirModal() {
  document.getElementById("id").value = "";
  document.getElementById("nombre").value = "";
  document.getElementById("contacto").value = "";
  document.getElementById("direccion").value = "";
  document.getElementById("telefono").value = "";
  $("#modalEscuela").modal("show");
}
