const express = require("express");
const router = express.Router();
const connection = require("../../db"); // Verifica que la ruta a db.js sea correcta

// ================= OBTENER TODAS LAS ESCUELAS =================
router.get("/", (req, res) => {
    const sql = "SELECT * FROM escuela ORDER BY id_escuela DESC";
    connection.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({ success: false, error: "Error al obtener escuelas" });
        }
        res.json({ success: true, data: results });
    });
});

// ================= CREAR ESCUELA =================
router.post("/crear", (req, res) => {
    const { nombre, contacto, direccion, telefono } = req.body;

    if (!nombre) {
        return res.status(400).json({ success: false, error: "El nombre de la escuela es obligatorio" });
    }

    const sql = "INSERT INTO escuela (nombre_escuela, contacto, direccion, telefono) VALUES (?, ?, ?, ?)";
    
    connection.query(sql, [nombre, contacto, direccion, telefono], (err, result) => {
        if (err) {
            console.error("Error BD Crear:", err);
            return res.status(500).json({ success: false, error: "Error de formato en la base de datos." });
        }
        res.json({ success: true, message: "Escuela creada correctamente" });
    });
});

// ================= EDITAR ESCUELA =================
router.post("/editar", (req, res) => {
    // Buscamos el ID por ambos nombres posibles por seguridad
    const id = req.body.id || req.body.id_escuela;
    const { nombre, contacto, direccion, telefono } = req.body;

    if (!id || !nombre) {
        return res.status(400).json({ success: false, error: "Faltan datos obligatorios para editar" });
    }

    const sql = "UPDATE escuela SET nombre_escuela = ?, contacto = ?, direccion = ?, telefono = ? WHERE id_escuela = ?";
    
    connection.query(sql, [nombre, contacto, direccion, telefono, id], (err, result) => {
        if (err) {
            console.error("Error BD Editar:", err);
            return res.status(500).json({ success: false, error: "Error al actualizar en la base de datos" });
        }
        res.json({ success: true, message: "Escuela actualizada correctamente" });
    });
});

// ================= ELIMINAR ESCUELA =================
router.delete("/eliminar/:id", (req, res) => {
    const idEscuela = req.params.id;

    const sql = "DELETE FROM escuela WHERE id_escuela = ?";
    
    connection.query(sql, [idEscuela], (err, result) => {
        if (err) {
            return res.status(500).json({ 
                success: false, 
                error: "No se puede eliminar la escuela porque hay participantes registrados en ella." 
            });
        }
        res.json({ success: true, message: "Escuela eliminada correctamente" });
    });
});

module.exports = router;