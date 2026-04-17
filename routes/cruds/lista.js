const express = require("express");
const router = express.Router();
const connection = require("../../db"); // Asegúrate de que esta ruta apunte a tu db.js

// ================= API: OBTENER LISTA DE PARTICIPANTES =================
router.get("/", (req, res) => {
  // Consulta SQL limpia, sin puntaje y uniendo la tabla juego
  const sql = `
        SELECT 
            p.nombre,
            p.edad,
            e.nombre_evento,
            esc.nombre_escuela,
            j.nombre_juego AS juego,
            s.fecha,
            s.calificacion,
            s.comentario
        FROM participante p
        LEFT JOIN evento e ON p.id_evento = e.id_evento
        LEFT JOIN escuela esc ON p.id_escuela = esc.id_escuela
        LEFT JOIN satisfaccion s ON p.id_participante = s.id_participante
        LEFT JOIN juego j ON s.id_juego = j.id_juego
        ORDER BY s.fecha DESC
    `;

  connection.query(sql, (err, results) => {
    if (err) {
      console.error("Error BD:", err);
      return res
        .status(500)
        .json({ success: false, error: "Error al obtener los participantes" });
    }
    res.json({ success: true, data: results });
  });
});

module.exports = router;
