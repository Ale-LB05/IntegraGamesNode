const express = require("express");
const router = express.Router();

// ================= API: DATOS DEL JUEGO =================
router.get("/", (req, res) => {
  // Datos simplificados con una sola imagen
  const juego = {
    nombre: "Run Code",
    imagen: "/img/codeRun/runCode.png", // Solo dejamos la imagen principal
    descripcion: [
      "El proyecto consiste en un videojuego de plataformas 2D desarrollado en Godot, en el cual el jugador controla un personaje que interactúa con distintos elementos del entorno, recolecta objetos y avanza a través de niveles. Esta versión incluye las bases del sistema jugable, como movimiento, interacción con objetos y control de la partida.",
    ],
    link: "/juegos/Code&Run/index.html",
  };

  res.json({ success: true, data: juego });
});

module.exports = router;
