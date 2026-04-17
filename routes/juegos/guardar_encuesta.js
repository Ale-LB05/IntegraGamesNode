const express = require("express");
const router = express.Router();
const connection = require("../../db");

// ================= API: GUARDAR ENCUESTA DE SATISFACCIÓN =================
router.post("/", (req, res) => {
  // Sacamos el ID del alumno directamente del Token de seguridad
  const id_participante = req.user.id;

  // Recibimos los datos que manda el formulario
  const { id_juego, calificacion, comentario } = req.body;

  // Generamos la fecha actual (YYYY-MM-DD)
  const fecha = new Date().toISOString().split("T")[0];

  // Consulta para insertar en la tabla satisfaccion
  const sql = `
        INSERT INTO satisfaccion (calificacion, comentario, fecha, id_participante, id_juego) 
        VALUES (?, ?, ?, ?, ?)
    `;

  connection.query(
    sql,
    [calificacion, comentario, fecha, id_participante, id_juego],
    (err, result) => {
      if (err) {
        console.error("Error BD:", err);
        return res
          .status(500)
          .json({ success: false, error: "Error al guardar la encuesta" });
      }
      res.json({ success: true, message: "¡Gracias por tu opinión!" });
    },
  );
});

module.exports = router;
