const API_URL = "/api/juegos/error404";

window.onload = () => {
    // 1. Configurar barra superior y permisos
    const usuario = localStorage.getItem("usuario") || "Usuario";
    const rol = (localStorage.getItem("rol") || "").toLowerCase();
    
    // Nombres y roles en la barra superior
    const nombreTop = document.getElementById("nombreUsuarioTop");
    if (nombreTop) {
        nombreTop.textContent = usuario + " - " + rol;
    }

    // ================= SOLUCIÓN DE FOTOGRAFÍA =================
    let fotoPerfil = localStorage.getItem("foto");

    // Si por alguna razón el localStorage está sucio, forzamos la imagen por defecto
    if (!fotoPerfil || fotoPerfil === "undefined" || fotoPerfil === "null") {
        fotoPerfil = "/img/responsables/sinFoto.jpg";
    }

    const imgTopBar = document.querySelector(".img-profile");
    if (imgTopBar) {
        imgTopBar.src = fotoPerfil;

        // TRUCO MAESTRO: Si la imagen en la base de datos existe pero el archivo
        // físico fue borrado de tu PC, se activa este error y pone la de por defecto.
        imgTopBar.onerror = function() {
            this.src = "/img/responsables/sinFoto.jpg";
        };
    }

    // ================= BLOQUEAR PERFIL A PARTICIPANTES =================
    if (rol === "participante") {
        // Busca cualquier enlace en el menú desplegable que vaya a perfil.html y lo oculta
        const enlacesPerfil = document.querySelectorAll('a[href="/perfil.html"], a[href="perfil.html"]');
        enlacesPerfil.forEach(enlace => enlace.style.display = "none");
        
        // Ocultar todo lo administrativo
        document.querySelectorAll('.item-admin').forEach(item => item.style.display = 'none');
    }

    // ================= BLOQUEAR MENÚS A PROMOTORES =================
    if (rol === "promotor") {
        const itemPersonal = document.getElementById("menuPersonal");
        const itemEscuelas = document.getElementById("menuEscuelas");
        if (itemPersonal) itemPersonal.style.display = "none";
        if (itemEscuelas) itemEscuelas.style.display = "none";
    }

    // 2. Cargar la información del juego
    cargarInfoJuego();
};

async function cargarInfoJuego() {
    const token = localStorage.getItem("token");

    try {
        const res = await fetch(API_URL, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const result = await res.json();

        if (result.success) {
            const juego = result.data;

            // 1. Textos Principales y Botón
            const titulo = document.getElementById("tituloJuego");
            if (titulo) titulo.textContent = juego.nombre;
            
            const parrafo = document.getElementById("parrafoJuego");
            if (parrafo) parrafo.textContent = juego.parrafo;
            
            const btnJugar = document.getElementById("btnJugarInfo");
            if (btnJugar) {
                btnJugar.href = juego.link;
                btnJugar.classList.remove("disabled");
            }

            // 2. Viñetas con icono verde
            const lista = document.getElementById("listaCaracteristicas");
            if (lista) {
                lista.innerHTML = "";
                juego.descripcion.forEach(linea => {
                    lista.innerHTML += `
                        <p class="text-muted mb-2" style="line-height: 1.7; font-size: 1.05rem;">
                            <i class="fas fa-check-circle text-success mr-2" style="font-size: 0.9rem;"></i> ${linea}
                        </p>
                    `;
                });
            }

            // 3. Carrusel
            const indicadores = document.getElementById("carruselIndicadores");
            const imagenesContainer = document.getElementById("carruselImagenes");
            
            if (indicadores && imagenesContainer) {
                indicadores.innerHTML = "";
                imagenesContainer.innerHTML = "";

                juego.imagenes.forEach((img, index) => {
                    const activoClase = index === 0 ? "active" : "";
                    
                    indicadores.innerHTML += `
                        <li data-target="#carouselJuego" data-slide-to="${index}" class="${activoClase}"></li>
                    `;
                    
                    imagenesContainer.innerHTML += `
                        <div class="carousel-item ${activoClase}">
                            <img src="${img}" alt="Captura del juego UNO" onerror="this.src='/img/default.png'">
                        </div>
                    `;
                });
            }

        } else {
            console.error("Error del servidor:", result.error);
            const titulo = document.getElementById("tituloJuego");
            if (titulo) titulo.textContent = "Juego no encontrado";
        }
    } catch (error) {
        console.error("Fallo de conexión:", error);
        const titulo = document.getElementById("tituloJuego");
        if (titulo) titulo.textContent = "Error de conexión";
    }
}

function cerrarSesion() {
    localStorage.clear();
    window.location.href = "/registroAdmin/login.html";
}