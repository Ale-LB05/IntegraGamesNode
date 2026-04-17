const express = require("express");
const router = express.Router();

// ================= API: DATOS DEL JUEGO DESAFÍO TECH =================
router.get("/", (req, res) => {
  // Datos de tu tercer juego
  const juego = {
    nombre: "Desafío Tech",
    // Asegúrate de que esta imagen exista en tu carpeta public/img
    imagen: "/img/codeRun/runCode.3.png",
    descripcion: [
      "Reglas básicas y mecánicas del tercer desafío.",
      "Pon a prueba todo lo que has aprendido.",
      "Supera los obstáculos y demuestra tus habilidades técnicas.",
    ],
    // Ajusta este link a la carpeta real donde tienes el HTML de este juego
    link: "/juegos/DesafioTech/index.html",
  };

  res.json({ success: true, data: juego });
});

module.exports = router;
