const API_URL = "/api/juegos/desafioTech";

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

    // Si el localStorage no tiene foto o es inválido, usamos la de por defecto
    if (!fotoPerfil || fotoPerfil === "undefined" || fotoPerfil === "null") {
        fotoPerfil = "/img/responsables/sinFoto.jpg";
    }

    const imgTopBar = document.querySelector(".img-profile");
    if (imgTopBar) {
        imgTopBar.src = fotoPerfil;

        // Si la imagen falla al cargar (no existe en la carpeta), ponemos la genérica
        imgTopBar.onerror = function() {
            this.src = "/img/responsables/sinFoto.jpg";
        };
    }

    // ================= SEGURIDAD Y ROLES =================
    if (rol === "participante") {
        // Ocultar enlace al perfil para participantes
        const enlacesPerfil = document.querySelectorAll('a[href="/perfil.html"], a[href="perfil.html"]');
        enlacesPerfil.forEach(enlace => enlace.style.display = "none");
        
        // Ocultar todo lo administrativo
        document.querySelectorAll('.item-admin').forEach(item => item.style.display = 'none');
    }

    if (rol === "promotor") {
        // Ocultar gestión de personal y escuelas
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

            // Título, Párrafo y Link
            document.getElementById("tituloJuego").textContent = juego.nombre;
            document.getElementById("parrafoJuego").textContent = juego.parrafo;
            
            const btnJugar = document.getElementById("btnJugarInfo");
            if (btnJugar) {
                btnJugar.href = juego.link;
                btnJugar.classList.remove("disabled");
            }

            // Características (Viñetas verdes)
            const lista = document.getElementById("listaCaracteristicas");
            if (lista) {
                lista.innerHTML = "";
                juego.descripcion.forEach(linea => {
                    lista.innerHTML += `
                        <p class="text-muted mb-2" style="line-height: 1.7; font-size: 1.0rem;">
                            <i class="fas fa-check-circle text-success mr-2" style="font-size: 0.9rem;"></i> ${linea}
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
                            <img src="${img}" alt="Captura de Desafío Tech" onerror="this.src='/img/default.png'">
                        </div>
                    `;
                });
            }

        } else {
            console.error("Error del servidor:", result.error);
            document.getElementById("tituloJuego").textContent = "Juego no encontrado";
        }
    } catch (error) {
        console.error("Fallo de conexión:", error);
    }
}

function cerrarSesion() {
    localStorage.clear();
    window.location.href = "/registroAdmin/login.html";
}