const API_URL = "/api/juegos/codeRun";

window.onload = () => {
    // 1. Configurar barra superior y permisos
    const usuario = localStorage.getItem("usuario") || "Usuario";
    const rol = (localStorage.getItem("rol") || "").toLowerCase();
    
    // Asignar nombre y rol en el topbar
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
    }

    // 2. Control de Acceso Visual (Menú Lateral)
    if (rol === "promotor") {
        const itemPersonal = document.getElementById("menuPersonal");
        const itemEscuelas = document.getElementById("menuEscuelas");
        if (itemPersonal) itemPersonal.style.display = "none";
        if (itemEscuelas) itemEscuelas.style.display = "none";
    } else if (rol === "participante") {
        document.querySelectorAll('.item-admin').forEach(item => item.style.display = 'none');
    }

    // 3. Cargar la información del juego
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

            // Título y Link
            const titulo = document.getElementById("tituloJuego");
            if (titulo) titulo.textContent = juego.nombre;
            
            const btnJugar = document.getElementById("btnJugarInfo");
            if (btnJugar) {
                btnJugar.href = juego.link;
                btnJugar.classList.remove("disabled");
            }

            // Descripción (Párrafos)
            const descContainer = document.getElementById("descripcionJuego");
            if (descContainer) {
                descContainer.innerHTML = "";
                juego.descripcion.forEach(linea => {
                    descContainer.innerHTML += `
                        <p class="text-muted" style="line-height: 1.7; font-size: 1.05rem;">
                            ${linea}
                        </p>
                    `;
                });
            }

            // Carrusel de Imágenes
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
                            <img src="${img}" alt="Captura del juego Code Run" onerror="this.src='/img/default.png'">
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