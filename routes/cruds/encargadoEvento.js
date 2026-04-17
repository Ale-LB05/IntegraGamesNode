const express = require("express");
const router = express.Router();
const connection = require("../../db"); // Ruta corregida hacia la raíz

// ================= API: OBTENER HISTORIAL DE EVENTOS =================
router.get("/", (req, res) => {
  // Consulta SQL para traer eventos, sus representantes y el conteo de alumnos
  const sql = `
        SELECT 
            e.id_evento,
            e.nombre_evento,
            e.lugar,
            e.fecha,
            GROUP_CONCAT(DISTINCT r.nombre SEPARATOR ', ') AS nombre_responsable,
            COUNT(DISTINCT p.id_participante) AS total_personas
        FROM evento e
        LEFT JOIN evento_responsable er ON e.id_evento = er.id_evento
        LEFT JOIN responsable r ON er.id_responsable = r.id_responsable
        LEFT JOIN participante p ON e.id_evento = p.id_evento
        GROUP BY e.id_evento, e.nombre_evento, e.lugar, e.fecha
        ORDER BY e.fecha DESC
    `;

  connection.query(sql, (err, results) => {
    if (err) {
      console.error("Error BD:", err);
      return res
        .status(500)
        .json({ success: false, error: "Error al obtener el historial" });
    }
    res.json({ success: true, data: results });
  });
});

module.exports = router;
