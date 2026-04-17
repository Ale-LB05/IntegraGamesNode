const express = require("express");
const router = express.Router();
const connection = require("../db");
const multer = require("multer");

// ================= MULTER =================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads/responsables/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "_" + file.originalname);
  },
});
const upload = multer({ storage });

// ================= API: OBTENER PERFIL =================
router.get("/", (req, res) => {
  // Sacamos el ID del usuario directamente del Token de seguridad
  const idUsuario = req.user.id;

  const sql =
    "SELECT nombre, correo, contraseña, rol, imagen_urls FROM responsable WHERE id_responsable = ?";

  connection.query(sql, [idUsuario], (err, result) => {
    if (err)
      return res
        .status(500)
        .json({ success: false, error: "Error en servidor" });
    if (result.length === 0)
      return res
        .status(404)
        .json({ success: false, error: "Usuario no encontrado" });

    const user = result[0];
    let imagenPerfil = "/img/user.jpg"; // Imagen por defecto

    if (user.imagen_urls) {
      try {
        const imagenes = JSON.parse(user.imagen_urls);
        if (imagenes.length > 0)
          imagenPerfil = "/uploads/responsables/" + imagenes[0];
      } catch (e) {
        console.error("Error al leer JSON de imagen");
      }
    }

    res.json({
      success: true,
      data: {
        nombre: user.nombre,
        correo: user.correo,
        contrasena: user.contraseña,
        rol: user.rol,
        imagen: imagenPerfil,
      },
    });
  });
});

// ================= API: ACTUALIZAR PERFIL =================
router.post("/actualizar", upload.single("imagen"), (req, res) => {
  const idUsuario = req.user.id;
  const { nombre, correo, contrasena } = req.body; // Ahora recibimos también el correo

  const sqlBuscar =
    "SELECT imagen_urls FROM responsable WHERE id_responsable = ?";

  connection.query(sqlBuscar, [idUsuario], (err, result) => {
    if (err)
      return res
        .status(500)
        .json({ success: false, error: "Error en servidor" });

    let imagenesArray = [];
    if (result[0] && result[0].imagen_urls) {
      try {
        imagenesArray = JSON.parse(result[0].imagen_urls);
      } catch (e) {}
    }

    // Si subió nueva foto, la reemplazamos
    if (req.file) imagenesArray = [req.file.filename];
    const imagenesJson = JSON.stringify(imagenesArray);

    // Actualizamos nombre, correo, contraseña e imagen
    const sqlUpdate = `UPDATE responsable SET nombre=?, correo=?, contraseña=?, imagen_urls=? WHERE id_responsable=?`;

    connection.query(
      sqlUpdate,
      [nombre, correo, contrasena, imagenesJson, idUsuario],
      (err2) => {
        if (err2)
          return res
            .status(500)
            .json({
              success: false,
              error: "Error al actualizar la base de datos",
            });

        res.json({
          success: true,
          message: "Perfil actualizado correctamente",
          nuevoNombre: nombre,
        });
      },
    );
  });
});

module.exports = router;
