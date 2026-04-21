const express = require("express");
const router = express.Router();
const connection = require("../db"); // Verifica que la ruta a db.js sea la correcta
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

// ================= API: OBTENER PERFIL Y EVENTOS =================
router.get("/", (req, res) => {
  const idUsuario = req.user.id;

  const sqlUser = "SELECT nombre, correo, contraseña, rol, imagen_urls FROM responsable WHERE id_responsable = ?";

  connection.query(sqlUser, [idUsuario], (err, resultUser) => {
    if (err) return res.status(500).json({ success: false, error: "Error en servidor" });
    if (resultUser.length === 0) return res.status(404).json({ success: false, error: "Usuario no encontrado" });

    const user = resultUser[0];
    let nombreArchivo = null;

    // --- LÓGICA DE LIMPIEZA DE IMAGEN DEL USUARIO ---
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

    const imagenPerfil = nombreArchivo 
      ? "/uploads/responsables/" + nombreArchivo 
      : "/img/responsables/sinFoto.jpg";

    // 2da Consulta: Obtener los eventos asignados a ESTE usuario
    const sqlEventos = `
      SELECT e.* FROM evento e
      INNER JOIN evento_responsable er ON e.id_evento = er.id_evento
      WHERE er.id_responsable = ?
      ORDER BY e.fecha ASC
    `;

    connection.query(sqlEventos, [idUsuario], (err2, resultEventos) => {
      if (err2) return res.status(500).json({ success: false, error: "Error al cargar eventos" });

      // Procesamos las imágenes de los eventos
      const eventosProcesados = resultEventos.map(ev => {
        let imgEventoNombre = null;
        if (ev.imagen_urls && ev.imagen_urls !== "[]") {
          try {
            const imgs = JSON.parse(ev.imagen_urls);
            if (Array.isArray(imgs) && imgs.length > 0) imgEventoNombre = imgs[0];
          } catch(e) {
            imgEventoNombre = ev.imagen_urls;
          }
        }
        
        const imgFinal = imgEventoNombre 
          ? "/uploads/eventos/" + imgEventoNombre 
          : "/img/default.png";

        return { ...ev, imagen: imgFinal };
      });

      // Devolvemos el usuario + sus eventos
      res.json({
        success: true,
        data: {
          usuario: {
            nombre: user.nombre,
            correo: user.correo,
            contrasena: user.contraseña,
            rol: user.rol,
            imagen: imagenPerfil,
          },
          eventos_asignados: eventosProcesados
        },
      });
    });
  });
});

// ================= API: ACTUALIZAR PERFIL =================
router.post("/actualizar", upload.single("imagen"), (req, res) => {
  const idUsuario = req.user.id;
  const { nombre, correo, contrasena } = req.body; 

  const sqlBuscar = "SELECT nombre, correo, contraseña, imagen_urls FROM responsable WHERE id_responsable = ?";

  connection.query(sqlBuscar, [idUsuario], (err, result) => {
    if (err) return res.status(500).json({ success: false, error: "Error en servidor" });
    if (result.length === 0) return res.status(404).json({ success: false, error: "Usuario no encontrado" });
    
    const currentUser = result[0];

    const nuevoNombre = nombre || currentUser.nombre;
    const nuevoCorreo = correo || currentUser.correo;
    const nuevaContrasena = contrasena || currentUser.contraseña;

    let imagenesJson = currentUser.imagen_urls;
    if (req.file) {
      // Guardamos como arreglo JSON para mantener consistencia
      imagenesJson = JSON.stringify([req.file.filename]);
    }

    const sqlUpdate = `UPDATE responsable SET nombre=?, correo=?, contraseña=?, imagen_urls=? WHERE id_responsable=?`;

    connection.query(
      sqlUpdate,
      [nuevoNombre, nuevoCorreo, nuevaContrasena, imagenesJson, idUsuario],
      (err2) => {
        if (err2) return res.status(500).json({ success: false, error: "Error al actualizar la base de datos" });

        // Determinamos la nueva ruta para enviarla al frontend
        let nombreArchivoNuevo = null;
        try {
          const parsed = JSON.parse(imagenesJson);
          if (Array.isArray(parsed) && parsed.length > 0) nombreArchivoNuevo = parsed[0];
        } catch(e) {
          nombreArchivoNuevo = imagenesJson;
        }

        const nuevaRutaImagen = nombreArchivoNuevo 
          ? "/uploads/responsables/" + nombreArchivoNuevo 
          : "/img/responsables/sinFoto.jpg";

        res.json({
          success: true,
          message: "Perfil actualizado correctamente",
          nuevoNombre: nuevoNombre,
          nuevaFoto: nuevaRutaImagen
        });
      }
    );
  });
});

module.exports = router;