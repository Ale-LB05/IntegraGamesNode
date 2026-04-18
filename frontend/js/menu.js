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

// ================= DIBUJAR TARJETAS DE EVENTOS (NUEVO DISEÑO) =================
function pintarTarjetas(lista) {
  const container = document.getElementById("contenedorTarjetas");
  if (!container) return;

  container.innerHTML = lista
    .map((t) => {
      // Intentamos formatear la fecha si viene de la base de datos
      let fechaLimpia = "";
      if (t.fecha) {
        const d = new Date(t.fecha);
        d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
        fechaLimpia = d.toLocaleDateString("es-MX", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });
      }

      let horaLimpia = t.hora ? t.hora.substring(0, 5) : "";

      // Botón de Google Maps automático si hay ubicación
      let btnMapa = "";
      if (t.ubicacion && t.ubicacion.trim() !== "") {
        let urlMaps = t.ubicacion.trim();
        if (/^-?\d+(\.\d+)?,\s*-?\d+(\.\d+)?$/.test(urlMaps)) {
          urlMaps = `https://www.google.com/maps/search/?api=1&query=$${urlMaps.replace(/\s/g, "")}`;
        } else if (!urlMaps.startsWith("http")) {
          urlMaps = `https://www.google.com/maps/search/?api=1&query=$${encodeURIComponent(urlMaps)}`;
        }
        btnMapa = `
          <div class="mt-3">
              <a href="${urlMaps}" target="_blank" class="btn btn-primary btn-sm btn-block font-weight-bold text-white shadow-sm" style="border-radius: 20px; background-color: #007bff; border: none;">
                  Ver en Google Maps
              </a>
          </div>`;
      }

      // Diseño de la tarjeta
      return `
      <div class="col-lg-3 col-md-4 col-sm-6 mb-4">
          <div class="card shadow-sm h-100" style="border-radius: 15px; overflow: hidden; border: none;">
              
              <div style="height: 160px; overflow: hidden;">
                  <img src="${t.imagen || "/img/default.png"}" class="card-img-top" style="object-fit: cover; height: 100%; width: 100%;">
              </div>
              
              <div class="card-body d-flex flex-column p-3">
                  <h6 class="font-weight-bold text-dark mb-2">${t.nombre_evento}</h6>
                  
                  <div class="text-dark small mb-2">
                      ${fechaLimpia ? `<p class="mb-1"><strong>Fecha:</strong> ${fechaLimpia}</p>` : ""}
                      ${horaLimpia ? `<p class="mb-1"><strong>Hora:</strong> ${horaLimpia}</p>` : ""}
                      ${t.lugar ? `<p class="mb-1"><strong>Lugar:</strong> ${t.lugar}</p>` : ""}
                  </div>

                  <p class="small text-muted mb-0" style="line-height: 1.3;">
                      ${t.observaciones || "Sin observaciones."}
                  </p>
                  
                  <div class="mt-auto">
                      ${btnMapa}
                  </div>
              </div>

          </div>
      </div>
      `;
    })
    .join("");
}

// ================= DIBUJAR TARJETAS DE JUEGOS (APILADOS Y ESTIRADOS) =================
function pintarJuegos(lista) {
  const container = document.getElementById("contenedorJuegos");
  if (!container) return;

  container.innerHTML = lista
    .map(
      (j) => `
      <div class="col-12 mb-3">
          <div class="card shadow-sm border-0" style="border-radius: 12px;">
              <div class="row no-gutters align-items-center">
                  
                  <div class="col-md-4 col-lg-3">
                      <img src="${j.imagen}" class="img-fluid" style="height: 130px; width: 100%; object-fit: cover; border-radius: 12px 0 0 12px;">
                  </div>
                  
                  <div class="col-md-8 col-lg-9">
                      <div class="card-body d-flex flex-column flex-md-row justify-content-between align-items-center py-3">
                          
                          <div class="text-center text-md-left mb-3 mb-md-0">
                              <h5 class="font-weight-bold text-dark mb-1">${j.nombre}</h5>
                              <p class="text-muted small mb-0">${j.descripcion}</p>
                          </div>
                          
                          <div class="ml-md-4">
                              <a href="${j.link}" class="btn btn-primary font-weight-bold text-white px-4 shadow-sm" style="border-radius: 20px; background-color: #007bff; border: none;">
                                  Jugar
                              </a>
                          </div>
                          
                      </div>
                  </div>

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
