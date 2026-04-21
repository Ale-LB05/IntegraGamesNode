const API_EVENTOS = "/api/eventos";

window.onload = () => {
    const usuario = localStorage.getItem("usuario") || "Usuario";
    const rol = (localStorage.getItem("rol") || "").toLowerCase();
    
    // Nombres y roles en la barra superior y mensaje principal
    const nombreTop = document.getElementById("nombreUsuarioTop");
    if(nombreTop) nombreTop.textContent = usuario + " - " + rol;
    
    const heroNombre = document.getElementById("heroNombreUsuario");
    if(heroNombre) heroNombre.textContent = usuario;

    // ================= SOLUCIÓN DE FOTOGRAFÍA =================
    let fotoPerfil = localStorage.getItem("foto");

    // Si por alguna razón el localStorage está sucio, forzamos la imagen por defecto
    if (!fotoPerfil || fotoPerfil === "undefined" || fotoPerfil === "null") {
        fotoPerfil = "/img/responsables/sinFoto.jpg";
    }

    const imgTopBar = document.querySelector(".img-profile");
    if (imgTopBar) {
        imgTopBar.src = fotoPerfil;

        // TRUCO MAESTRO: Si la imagen física fue borrada, se activa este error y pone la genérica.
        imgTopBar.onerror = function() {
            this.src = "/img/responsables/sinFoto.jpg";
        };
    }

    // ================= BLOQUEAR PERFIL A PARTICIPANTES =================
    if (rol === "participante") {
        const enlacesPerfil = document.querySelectorAll('a[href="/perfil.html"], a[href="perfil.html"]');
        enlacesPerfil.forEach(enlace => enlace.style.display = "none");
    }

    // ================= LÓGICA DE VISUALIZACIÓN (STAFF vs PARTICIPANTE) =================
    const rolesStaff = ["administrador", "programador", "promotor"];
    
    if (rolesStaff.includes(rol)) {
        // --- VISTA PARA STAFF (ADMIN/PROMOTOR) ---
        const tituloDinamico = document.getElementById("titulo-seccion-dinamica");
        if (tituloDinamico) {
            tituloDinamico.innerHTML = `<i class="fas fa-calendar-alt mr-2" style="color: #4e73df;"></i> Próximos Eventos`;
        }

        // Si es promotor, ocultamos Personal y Escuelas del menú lateral
        if (rol === "promotor") {
            const itemPersonal = document.getElementById("menuPersonal");
            const itemEscuelas = document.getElementById("menuEscuelas");
            if (itemPersonal) itemPersonal.style.display = "none";
            if (itemEscuelas) itemEscuelas.style.display = "none";
        }
        
        cargarYRenderizarEventos();
    } else {
        // --- VISTA PARA PARTICIPANTE (ALUMNO) ---
        // Se esconde TODO lo de administración
        document.querySelectorAll(".item-admin").forEach((item) => (item.style.display = "none"));
        
        const tituloDinamico = document.getElementById("titulo-seccion-dinamica");
        if (tituloDinamico) {
            tituloDinamico.innerHTML = `<i class="fas fa-rocket mr-2" style="color: #4e73df;"></i> Descubre la Carrera`;
        }
        
        renderizarTarjetasUTM();
    }
};

// ================= RENDERIZAR PRÓXIMOS EVENTOS (Para Staff) =================
async function cargarYRenderizarEventos() {
    const token = localStorage.getItem("token");
    const contenedor = document.getElementById("contenedor-seccion-dinamica");
    if(!contenedor) return;

    try {
        const res = await fetch(API_EVENTOS, {
            headers: { Authorization: `Bearer ${token}` },
        });
        const result = await res.json();
        
        let eventos = [];
        if (Array.isArray(result)) eventos = result;
        else if (result.data && Array.isArray(result.data)) eventos = result.data;
        
        // Filtrar solo los eventos futuros o del día de hoy
        const hoyStr = new Date().toISOString().split("T")[0];
        const futuros = eventos.filter((ev) => {
            const evFecha = ev.fecha ? ev.fecha.split("T")[0] : "";
            return evFecha >= hoyStr;
        });

        if (futuros.length === 0) {
            contenedor.innerHTML = `
                <div class='col-12'>
                    <div class='alert alert-light border text-center py-5 rounded-4 shadow-sm'>
                        <i class='fas fa-calendar-times fa-3x text-muted mb-3'></i>
                        <h5 class='text-muted fw-bold'>No hay eventos programados por el momento.</h5>
                    </div>
                </div>`;
            return;
        }

        contenedor.innerHTML = "";
        futuros.forEach((evento) => {
            const evFecha = evento.fecha ? evento.fecha.split("T")[0] : "";
            const fechaParts = evFecha.split("-");
            const fechaLatina = fechaParts.length === 3 ? `${fechaParts[2]}/${fechaParts[1]}/${fechaParts[0]}` : "-";
            
            const horaTexto = evento.hora_inicio && evento.hora_fin ? `${evento.hora_inicio} - ${evento.hora_fin}` : (evento.hora || "--:--");
            const lugar = evento.lugar || "Ubicación no disponible";
            const imgSrc = evento.imagen || "/img/default.png";
            
            let btnMapa = "";
            if (evento.ubicacion && evento.ubicacion.trim() !== "") {
                let urlMaps = evento.ubicacion.trim();
                if (!urlMaps.startsWith("http")) {
                    urlMaps = `http://googleusercontent.com/maps.google.com/?q=${encodeURIComponent(urlMaps)}`;
                }
                btnMapa = `
                    <a href="${urlMaps}" target="_blank" class="btn btn-sm btn-outline-primary rounded-pill w-100">
                        <i class="fas fa-map-marked-alt mr-1"></i> Ver en Google Maps
                    </a>`;
            } else {
                const obs = evento.observaciones || "Sin observaciones";
                btnMapa = `<p class="text-muted small mb-0 text-center"><i class="fas fa-info-circle"></i> ${obs}</p>`;
            }

            contenedor.innerHTML += `
                <div class="col-lg-4 col-md-6 mb-4">
                    <div class="card hover-lift h-100">
                        <img src="${imgSrc}" class="card-img-top img-uniforme" alt="Imagen del evento" onerror="this.src='/img/default.png'">
                        <div class="card-body d-flex flex-column p-4">
                            <div class="d-flex justify-content-between align-items-start mb-2">
                                <h5 class="font-weight-bold text-dark mb-0">${evento.nombre_evento}</h5>
                                <span class="badge badge-soft-primary px-2 py-1 rounded-pill">Próximo</span>
                            </div>
                            <div class="mt-3">
                                <p class="text-muted small mb-2">
                                    <i class="fas fa-calendar-day fa-fw mr-2" style="color: #4e73df;"></i>
                                    <strong>Fecha:</strong> ${fechaLatina}
                                </p>
                                <p class="text-muted small mb-2">
                                    <i class="fas fa-clock fa-fw mr-2" style="color: #4e73df;"></i>
                                    <strong>Hora:</strong> ${horaTexto}
                                </p>
                                <p class="text-muted small mb-2">
                                    <i class="fas fa-map-marker-alt fa-fw mr-2" style="color: #e74a3b;"></i>
                                    <strong>Lugar:</strong> ${lugar}
                                </p>
                            </div>
                            <div class="mt-auto pt-3 border-top">
                                ${btnMapa}
                            </div>
                        </div>
                    </div>
                </div>`;
        });

    } catch (error) {
        console.error(error);
        contenedor.innerHTML = '<p class="text-danger text-center w-100">Hubo un error al cargar los eventos.</p>';
    }
}

// ================= RENDERIZAR TARJETAS INFORMATIVAS (Para Participantes) =================
function renderizarTarjetasUTM() {
    const contenedor = document.getElementById("contenedor-seccion-dinamica");
    if(!contenedor) return;

    const tarjetasInfo = [
        {
            nombre: "Domina el Futuro Digital",
            imagen: "/img/utm2.png", 
            descripcion: "Convierte tu pasión por la tecnología en soluciones reales. En TI, no solo usas el futuro, ¡tú lo programas!",
        },
        {
            nombre: "Experiencia UTM",
            imagen: "/img/imagen3.jpeg",
            descripcion: "Aprende con proyectos prácticos y laboratorios de vanguardia. Formamos los líderes tecnológicos que el mundo necesita.",
        },
        {
            nombre: "De Gamer a Desarrollador",
            imagen: "/img/imagen3.jpeg",
            descripcion: "Lleva tu nivel al siguiente paso. Aprende lógica de programación creando mundos y mecánicas de juego increíbles.",
        },
        {
            nombre: "¡Únete a la Comunidad!",
            imagen: "/img/imagen4.jpeg",
            descripcion: "Participa en eventos, torneos y desafíos. IntegraGames es solo el inicio de tu viaje en las Tecnologías de la Información.",
        }
    ];

    contenedor.innerHTML = "";
    tarjetasInfo.forEach((info) => {
        contenedor.innerHTML += `
            <div class="col-lg-3 col-md-6 mb-4">
                <div class="card hover-lift h-100">
                    <img src="${info.imagen}" class="card-img-top img-uniforme" onerror="this.src='/img/default.png'">
                    <div class="card-body text-center p-4">
                        <h6 class="font-weight-bold text-dark mb-3">${info.nombre}</h6>
                        <p class="text-muted small mb-0">${info.descripcion}</p>
                    </div>
                </div>
            </div>`;
    });
}

function cerrarSesion() {
    localStorage.clear();
    window.location.href = "/registroAdmin/login.html";
}