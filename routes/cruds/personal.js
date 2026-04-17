const express = require("express");
const router = express.Router();
const connection = require("../../db"); // Tu conexión a la base de datos
const multer = require("multer");
const fs = require("fs");

// ================= CONFIGURAR MULTER =================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Usamos la nueva carpeta uploads
    cb(null, "./uploads/responsables/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "_" + file.originalname);
  },
});
const upload = multer({ storage });

// ================= API: OBTENER TODOS =================
router.get("/", (req, res) => {
  const sql = "SELECT * FROM responsable";

  connection.query(sql, (err, result) => {
    if (err) {
      console.error("Error BD:", err);
      return res
        .status(500)
        .json({ success: false, error: "Error en el servidor" });
    }

    // Procesamos las imágenes de JSON a texto normal para el frontend
    const personalProcesado = result.map((row) => {
      let imagenPerfil = "/img/responsables/sinFoto.jpg";

      if (row.imagen_urls) {
        try {
          const imagenes = JSON.parse(row.imagen_urls);
          if (imagenes.length > 0) {
            imagenPerfil = "/uploads/responsables/" + imagenes[0];
          }
        } catch (e) {
          console.error("Error leyendo JSON");
        }
      }

      return {
        id_responsable: row.id_responsable,
        nombre: row.nombre,
        correo: row.correo,
        contrasena: row.contraseña,
        rol: row.rol,
        imagen: imagenPerfil,
      };
    });

    res.json({ success: true, data: personalProcesado });
  });
});

// ================= API: CREAR =================
router.post("/crear", upload.single("imagen"), (req, res) => {
  const { nombre, correo, contrasena, rol } = req.body;

  let imagenesArray = req.file ? [req.file.filename] : [];
  let fotosJSON = JSON.stringify(imagenesArray);

  const sql = `INSERT INTO responsable (nombre, correo, contraseña, rol, imagen_urls) VALUES (?, ?, ?, ?, ?)`;

  connection.query(sql, [nombre, correo, contrasena, rol, fotosJSON], (err) => {
    if (err)
      return res
        .status(500)
        .json({ success: false, error: "Error al crear empleado" });
    res.json({ success: true, message: "Empleado creado exitosamente" });
  });
});

// ================= API: EDITAR =================
router.post("/editar", upload.single("imagen"), (req, res) => {
  const { id, nombre, correo, contrasena, rol } = req.body;

  // Primero buscamos la imagen actual
  connection.query(
    "SELECT imagen_urls FROM responsable WHERE id_responsable = ?",
    [id],
    (err, result) => {
      if (err)
        return res.status(500).json({ success: false, error: "Error en BD" });

      let imagenesArray = [];
      if (result.length > 0 && result[0].imagen_urls) {
        imagenesArray = JSON.parse(result[0].imagen_urls);
      }

      // Si subieron una foto nueva, la reemplazamos
      if (req.file) {
        imagenesArray = [req.file.filename];
      }

      let fotosJSON = JSON.stringify(imagenesArray);

      const sqlUpdate = `
            UPDATE responsable SET nombre = ?, correo = ?, contraseña = ?, rol = ?, imagen_urls = ?
            WHERE id_responsable = ?
        `;

      connection.query(
        sqlUpdate,
        [nombre, correo, contrasena, rol, fotosJSON, id],
        (err2) => {
          if (err2)
            return res
              .status(500)
              .json({ success: false, error: "Error al actualizar" });
          res.json({ success: true, message: "Empleado actualizado" });
        },
      );
    },
  );
});

// ================= API: ELIMINAR =================
router.delete("/eliminar/:id", (req, res) => {
  const id = req.params.id;

  connection.query(
    "DELETE FROM responsable WHERE id_responsable = ?",
    [id],
    (err) => {
      if (err)
        return res
          .status(500)
          .json({ success: false, error: "Error al eliminar" });
      res.json({ success: true, message: "Empleado eliminado" });
    },
  );
});

module.exports = router;
