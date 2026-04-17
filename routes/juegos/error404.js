const express = require("express");
const router = express.Router();

// ================= API: DATOS DEL JUEGO ERROR 404 =================
router.get("/", (req, res) => {
  // Datos simplificados con una sola imagen principal
  const juego = {
    nombre: "Error 404",
    imagen: "/img/uno/uno.png", // Dejamos solo la foto principal
    descripcion: [
      "Error 404 es un juego de cartas.",
      "Debes ganar cada partida.",
      "Pon a prueba tu lógica.",
      "Ideal para aprender jugando.",
    ],
    // Ajusta este link a la carpeta real donde tienes guardado el HTML del juego
    link: "/juegos/Error404/index.html",
  };

  res.json({ success: true, data: juego });
});

module.exports = router;
