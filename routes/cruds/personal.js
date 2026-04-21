const express = require("express");
const router = express.Router();
const connection = require("../../db"); // Ajusta los ../ según la profundidad de tu carpeta
const multer = require("multer");

// ================= MULTER (Misma lógica que perfil.js) =================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads/responsables/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "_" + file.originalname);
  },
});
const upload = multer({ storage });

// ================= API: OBTENER TODOS LOS EMPLEADOS =================
router.get("/", (req, res) => {
  const sql = "SELECT * FROM responsable";

  connection.query(sql, (err, results) => {
    if (err) return res.status(500).json({ success: false, error: "Error en servidor" });

    // Aplicamos la MISMA lógica de extracción que en perfil.js para cada usuario
    const personalProcesado = results.map(user => {
      let nombreArchivo = null;

      if (user.imagen_urls && user.imagen_urls !== "[]" && user.imagen_urls !== "NULL") {
        try {
          const imagenes = JSON.parse(user.imagen_urls);
          if (Array.isArray(imagenes) && imagenes.length > 0) {
            nombreArchivo = imagenes[0];
          }
        } catch (e) {
          nombreArchivo = user.imagen_urls;
        }
      }

      // Generamos la ruta completa desde el backend
      const rutaFoto = nombreArchivo 
        ? "/uploads/responsables/" + nombreArchivo.trim() 
        : "/img/responsables/sinFoto.jpg";

      // Retornamos el usuario con un nuevo campo llamado "rutaFotoFinal"
      return { ...user, rutaFotoFinal: rutaFoto };
    });

    res.json({ success: true, data: personalProcesado });
  });
});

// ================= API: CREAR EMPLEADO =================
router.post("/crear", upload.single("imagen"), (req, res) => {
  const { nombre, correo, contrasena, rol } = req.body;
  
  let imagenesJson = null;
  if (req.file) {
    // Guardamos como arreglo JSON para mantener consistencia
    imagenesJson = JSON.stringify([req.file.filename]);
  }

  const sql = "INSERT INTO responsable (nombre, correo, contraseña, rol, imagen_urls) VALUES (?, ?, ?, ?, ?)";
  connection.query(sql, [nombre, correo, contrasena, rol, imagenesJson], (err, result) => {
    if (err) return res.status(500).json({ success: false, error: "Error al crear" });
    res.json({ success: true, message: "Empleado registrado correctamente" });
  });
});

// ================= API: EDITAR EMPLEADO =================
router.post("/editar", upload.single("imagen"), (req, res) => {
  const { id, nombre, correo, contrasena, rol } = req.body; // Asegúrate de mandar el 'id' en el FormData

  const sqlBuscar = "SELECT * FROM responsable WHERE id_responsable = ?";
  connection.query(sqlBuscar, [id], (err, result) => {
    if (err || result.length === 0) return res.status(404).json({ success: false, error: "Usuario no encontrado" });

    const currentUser = result[0];
    const nuevoNombre = nombre || currentUser.nombre;
    const nuevoCorreo = correo || currentUser.correo;
    const nuevaContrasena = contrasena || currentUser.contraseña;
    const nuevoRol = rol || currentUser.rol;

    let imagenesJson = currentUser.imagen_urls;
    if (req.file) {
      imagenesJson = JSON.stringify([req.file.filename]);
    }

    const sqlUpdate = "UPDATE responsable SET nombre=?, correo=?, contraseña=?, rol=?, imagen_urls=? WHERE id_responsable=?";
    connection.query(sqlUpdate, [nuevoNombre, nuevoCorreo, nuevaContrasena, nuevoRol, imagenesJson, id], (err2) => {
      if (err2) return res.status(500).json({ success: false, error: "Error al actualizar" });
      res.json({ success: true, message: "Empleado actualizado" });
    });
  });
});

// ================= API: ELIMINAR EMPLEADO =================
router.delete("/eliminar/:id", (req, res) => {
  const sql = "DELETE FROM responsable WHERE id_responsable = ?";
  connection.query(sql, [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ success: false, error: "Error al eliminar" });
    res.json({ success: true, message: "Empleado eliminado" });
  });
});

module.exports = router;