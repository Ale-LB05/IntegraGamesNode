const API_URL = "/api/juegos/codeRun";

window.onload = cargarJuego;

async function cargarJuego() {
  const token = localStorage.getItem("token");

  try {
    const res = await fetch(API_URL, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const result = await res.json();

    if (result.success) {
      const juego = result.data;

      // Llenar Textos, Imagen y Botón
      document.getElementById("tituloJuego").textContent = juego.nombre;
      document.getElementById("btnJugar").href = juego.link;
      document.getElementById("imagenJuego").src = juego.imagen;

      // Armar los párrafos de la descripción
      let descHTML = "";
      juego.descripcion.forEach((linea) => (descHTML += `<p>${linea}</p>`));
      document.getElementById("descripcionJuego").innerHTML = descHTML;
    }
  } catch (error) {
    console.error("Error cargando el juego:", error);
    document.getElementById("tituloJuego").textContent =
      "Error al cargar los datos del juego";
  }
}
