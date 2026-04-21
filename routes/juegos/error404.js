const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  const juego = {
    nombre: "Error 404",
    // QUITA LA PALABRA "frontend" DE AQUÍ:
    imagenes: [
      "/img/uno/uno.png",
      "/img/uno/uno.2.png",
      "/img/uno/uno.3.png",
      "/img/uno/uno.4.png",
    ],
    parrafo:
      "Error404 transforma la diversión de UNO en una experiencia educativa sobre la carrera de Tecnologías de la Información. Cada partida te reta a pensar, adaptarte y aprender conceptos clave de programación, bases de datos, redes, ciberseguridad y soporte técnico mediante cartas temáticas, efectos especiales y mensajes contextuales. No solo juegas para ganar: juegas para descubrir cómo funciona el mundo de TI.",
    descripcion: [
      "Basado en las divertidas reglas clásicas de UNO.",
      "Cartas temáticas con conceptos clave de TI.",
      "Mecánicas con efectos especiales y mensajes contextuales.",
      "Pon a prueba tu lógica y capacidad de adaptación.",
    ],
    // QUITA LA PALABRA "frontend" DE AQUÍ TAMBIÉN:
    link: "/juegos/Error404/index.html",
  };

  res.json({ success: true, data: juego });
});

module.exports = router;
