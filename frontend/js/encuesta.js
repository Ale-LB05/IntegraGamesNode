let rating = 0;
let idJuego = 0;

window.onload = () => {
    // 1. Verificar si el usuario está logueado
    const token = localStorage.getItem("token");
    if (!token) {
        window.location.href = "/registroAdmin/login.html";
        return;
    }

    // 2. Extraer el ID del juego de la URL (ejemplo: encuesta.html?id_juego=1)
    const params = new URLSearchParams(window.location.search);
    idJuego = parseInt(params.get("id_juego"));

    if (!idJuego || isNaN(idJuego)) {
        Swal.fire({
            icon: 'error',
            title: 'Error de acceso',
            text: 'No se ha seleccionado un juego válido para calificar.',
            allowOutsideClick: false
        }).then(() => {
            window.location.href = "/menu.html";
        });
    }
};

// Función para pintar las estrellas
function calificar(num) {
    rating = num;
    const puntos = num * 2; // Convierte 1-5 estrellas a 2-10 puntos
    
    document.getElementById("label-puntos").innerText = puntos + " / 10 puntos";

    let stars = document.querySelectorAll(".stars i");
    stars.forEach((star, index) => {
        star.classList.toggle("active", index < num);
    });
}

// Función para enviar los datos al servidor Node.js
async function procesarEncuesta() {
    if (rating === 0) {
        Swal.fire({
            icon: 'warning',
            title: '¡Espera!',
            text: 'Por favor, selecciona una calificación con las estrellas.',
            confirmButtonColor: '#1cc88a'
        });
        return;
    }

    const token = localStorage.getItem("token");
    const comentario = document.getElementById("comentario").value.trim();
    const calificacionFinal = rating * 2;

    try {
        const response = await fetch("/api/guardar_encuesta", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                id_juego: idJuego,
                calificacion: calificacionFinal,
                comentario: comentario
            })
        });

        const data = await response.json();

        if (response.ok && data.success) {
            Swal.fire({
                icon: 'success',
                title: '¡Enviado con éxito!',
                text: 'Gracias por ayudarnos a mejorar IntegraGames.',
                showConfirmButton: false,
                timer: 2000,
                timerProgressBar: true
            }).then(() => {
                // Después de votar, regresamos al menú principal
                window.location.href = "/menu.html";
            });
        } else {
            Swal.fire('Error', data.error || 'Ocurrió un problema al guardar la encuesta', 'error');
        }
    } catch (error) {
        console.error("Error al enviar encuesta:", error);
        Swal.fire('Error de conexión', 'No se pudo conectar con el servidor.', 'error');
    }
}