const express = require("express");
const router = express.Router();
const connection = require("../../db");

// ================= OBTENER TODAS =================
router.get("/", (req, res) => {
  const sql = "SELECT * FROM escuela";
  connection.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: "Error en servidor" });
    res.json(results);
  });
});

// ================= CREAR =================
router.post("/", (req, res) => {
  const { nombre, contacto, direccion, telefono } = req.body;
  const sql =
    "INSERT INTO escuela (nombre_escuela, contacto, direccion, telefono) VALUES (?, ?, ?, ?)";

  connection.query(sql, [nombre, contacto, direccion, telefono], (err) => {
    if (err) return res.status(500).json({ error: "Error al crear escuela" });
    res.json({ success: true, message: "Escuela creada correctamente" });
  });
});

// ================= EDITAR =================
router.put("/:id", (req, res) => {
  const id = req.params.id;
  const { nombre, contacto, direccion, telefono } = req.body;
  const sql =
    "UPDATE escuela SET nombre_escuela = ?, contacto = ?, direccion = ?, telefono = ? WHERE id_escuela = ?";

  connection.query(sql, [nombre, contacto, direccion, telefono, id], (err) => {
    if (err)
      return res.status(500).json({ error: "Error al actualizar escuela" });
    res.json({ success: true, message: "Escuela actualizada correctamente" });
  });
});

// ================= ELIMINAR =================
router.delete("/:id", (req, res) => {
  const id = req.params.id;

  // 1. Verificamos si la escuela tiene participantes en algún evento
  const checkSql =
    "SELECT COUNT(*) AS total FROM participante WHERE id_escuela = ?";

  connection.query(checkSql, [id], (err, results) => {
    if (err)
      return res.status(500).json({ error: "Error al verificar la escuela" });

    // Si el total es mayor a 0, detenemos la eliminación
    if (results[0].total > 0) {
      return res
        .status(400)
        .json({
          error:
            " No se puede eliminar: Esta escuela ya tiene participantes vinculados a un evento.",
        });
    }

    // Si está limpia (0 participantes), la eliminamos
    const deleteSql = "DELETE FROM escuela WHERE id_escuela = ?";
    connection.query(deleteSql, [id], (err2) => {
      if (err2) {
        // Por si hay otra restricción en la base de datos
        if (err2.code === "ER_ROW_IS_REFERENCED_2") {
          return res
            .status(400)
            .json({
              error:
                " No se puede eliminar porque está en uso en el sistema.",
            });
        }
        return res.status(500).json({ error: "Error al eliminar escuela" });
      }
      res.json({ success: true, message: "Escuela eliminada correctamente" });
    });
  });
});

module.exports = router;
