const API_MENU = "/api/menu";

window.onload = () => {
  // 1. Limpieza inmediata del menú según el rol guardado en el login
  aplicarFiltroSeguridad();
  // 2. Pedir datos al servidor
  cargarContenido();
};

function aplicarFiltroSeguridad() {
  const rol = (localStorage.getItem("rol") || "participante").toLowerCase();
  const nombre = localStorage.getItem("usuario") || "Usuario";

  // Poner nombre y foto provisional
  document.getElementById("nombreUsuarioTop").textContent =
    `${nombre} - ${rol}`;
  document.getElementById("imgUsuarioTop").src =
    "/img/responsables/sinFoto.jpg";

  // SI ES PARTICIPANTE, OCULTAMOS LA ADMIN AL INSTANTE
  if (rol === "participante") {
    const divAdmin = document.getElementById("seccionAdministracion");
    if (divAdmin) divAdmin.style.display = "none";

    const btnPerfil = document.getElementById("btnPerfilSuperior");
    if (btnPerfil) btnPerfil.style.display = "none";
  }
}

async function cargarContenido() {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "/registroAdmin/login.html";
    return;
  }

  try {
    const response = await fetch(API_MENU, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.status === 401) {
      localStorage.clear();
      window.location.href = "/registroAdmin/login.html";
      return;
    }

    const res = await response.json();
    if (res.success) {
      // Actualizar a la foto real si el servidor la mandó
      document.getElementById("imgUsuarioTop").src = res.data.usuario.imagen;

      // Dibujar tarjetas y juegos
      pintarTarjetas(res.data.tarjetas);
      pintarJuegos(res.data.juegos);
    }
  } catch (error) {
    console.error("Error al conectar con la API:", error);
  }
}

function pintarTarjetas(lista) {
  const container = document.getElementById("contenedorTarjetas");
  if (!container) return;
  container.innerHTML = lista
    .map(
      (t) => `
        <div class="col-xl-3 col-md-6 mb-4">
            <div class="card shadow h-100 py-2">
                <div class="card-body text-center">
                    <div class="font-weight-bold text-dark text-uppercase mb-2">${t.nombre_evento}</div>
                    <img src="${t.imagen}" class="img-fluid mb-3" style="height: 100px; object-fit: contain;">
                    <p class="small text-muted mb-0">${t.observaciones}</p>
                </div>
            </div>
        </div>
    `,
    )
    .join("");
}

function pintarJuegos(lista) {
  const container = document.getElementById("contenedorJuegos");
  if (!container) return;
  container.innerHTML = lista
    .map(
      (j) => `
        <div class="col-lg-4 col-md-6 mb-4">
            <div class="card shadow h-100">
                <img src="${j.imagen}" class="card-img-top" style="height: 180px; object-fit: contain; background: #222;">
                <div class="card-body text-center d-flex flex-column">
                    <h5 class="font-weight-bold">${j.nombre}</h5>
                    <p class="small text-muted">${j.descripcion}</p>
                    <a href="${j.link}" class="btn btn-primary mt-auto">Jugar</a>
                </div>
            </div>
        </div>
    `,
    )
    .join("");
}

function cerrarSesion() {
  localStorage.clear();
  window.location.href = "/registroAdmin/login.html";
}
