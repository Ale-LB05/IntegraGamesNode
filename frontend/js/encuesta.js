const API_ENCUESTA = "/api/guardar_encuesta";

// Leemos el ID del juego desde la URL (ejemplo: ?id_juego=2)
const urlParams = new URLSearchParams(window.location.search);
const id_juego = urlParams.get("id_juego");

// Si por algún error no hay ID de juego, lo regresamos al menú
if (!id_juego) {
  alert("Error: No se detectó de qué juego vienes.");
  window.location.href = "/menu.html";
}

document
  .getElementById("formEncuesta")
  .addEventListener("submit", async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    // Preparamos los datos
    const bodyData = {
      id_juego: id_juego,
      calificacion: document.getElementById("inputCalificacion").value,
      comentario: document.getElementById("inputComentario").value,
    };

    try {
      const res = await fetch(API_ENCUESTA, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(bodyData),
      });

      const result = await res.json();

      if (result.success) {
        alert("¡Respuestas guardadas! Gracias por jugar.");
        // Lo regresamos al menú principal de alumnos
        window.location.href = "/menu.html";
      } else {
        alert(result.error || "Ocurrió un error.");
      }
    } catch (error) {
      alert("Error de red al enviar la encuesta.");
    }
  });
