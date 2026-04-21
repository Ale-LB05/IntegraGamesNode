const express = require("express");
const router = express.Router();
const connection = require("../../db");
const multer = require("multer");

// ================= CONFIGURAR MULTER =================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads/eventos/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "_" + file.originalname);
  },
});
const upload = multer({ storage });

// ================= API: OBTENER TODOS =================
router.get("/", (req, res) => {
  const sql = `
        SELECT 
            e.id_evento, e.nombre_evento, e.fecha, e.hora_inicio, e.hora_fin, e.lugar, 
            e.ubicacion, e.observaciones, e.imagen_urls,
            MAX(r.nombre) AS responsable_nombre,
            MAX(er.id_responsable) AS responsable_id
        FROM evento e
        LEFT JOIN evento_responsable er ON e.id_evento = er.id_evento
        LEFT JOIN responsable r ON er.id_responsable = r.id_responsable
        GROUP BY 
            e.id_evento, e.nombre_evento, e.fecha, e.hora_inicio, e.hora_fin, e.lugar, 
            e.ubicacion, e.observaciones, e.imagen_urls
        ORDER BY e.fecha DESC
    `;

  connection.query(sql, (err, result) => {
    if (err)
      return res
        .status(500)
        .json({ success: false, error: "Error BD: " + err.sqlMessage });

    const eventosProcesados = result.map((row) => {
      let imagenEvento = "/img/default.png";
      if (row.imagen_urls) {
        try {
          const imagenes = JSON.parse(row.imagen_urls);
          if (imagenes.length > 0)
            imagenEvento = "/uploads/eventos/" + imagenes[0];
        } catch (e) {
          console.error("Error leyendo JSON");
        }
      }

      const fechaLimpia = row.fecha
        ? new Date(row.fecha).toISOString().split("T")[0]
        : "";

      return {
        id_evento: row.id_evento,
        nombre_evento: row.nombre_evento,
        fecha: fechaLimpia,
        hora_inicio: row.hora_inicio || "",
        hora_fin: row.hora_fin || "",
        lugar: row.lugar,
        ubicacion: row.ubicacion || "",
        observaciones: row.observaciones || "",
        imagen: imagenEvento,
        responsable_nombre: row.responsable_nombre,
        responsable_id: row.responsable_id,
      };
    });

    res.json({ success: true, data: eventosProcesados });
  });
});

// ================= API: CREAR =================
router.post("/crear", upload.single("imagen"), (req, res) => {
  const { nombre_evento, fecha, hora_inicio, hora_fin, lugar, ubicacion, observaciones } =
    req.body;
  const horaInicioFinal = hora_inicio && hora_inicio.trim() !== "" ? hora_inicio : null;
  const horaFinFinal = hora_fin && hora_fin.trim() !== "" ? hora_fin : null;
  let imagenesArray = req.file ? [req.file.filename] : [];
  let fotosJSON = JSON.stringify(imagenesArray);

  const sql = `INSERT INTO evento (nombre_evento, fecha, hora_inicio, hora_fin, lugar, ubicacion, observaciones, imagen_urls) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

  connection.query(
    sql,
    [
      nombre_evento,
      fecha,
      horaInicioFinal,
      horaFinFinal,
      lugar,
      ubicacion,
      observaciones,
      fotosJSON,
    ],
    (err) => {
      if (err)
        return res
          .status(500)
          .json({ success: false, error: "Error BD: " + err.sqlMessage });
      res.json({ success: true, message: "Evento creado" });
    },
  );
});

// ================= API: EDITAR =================
router.post("/editar", upload.single("imagen"), (req, res) => {
  const {
    id_evento,
    nombre_evento,
    fecha,
    hora_inicio,
    hora_fin,
    lugar,
    ubicacion,
    observaciones,
  } = req.body;
  const horaInicioFinal = hora_inicio && hora_inicio.trim() !== "" ? hora_inicio : null;
  const horaFinFinal = hora_fin && hora_fin.trim() !== "" ? hora_fin : null;

  connection.query(
    "SELECT imagen_urls FROM evento WHERE id_evento = ?",
    [id_evento],
    (err, result) => {
      if (err)
        return res
          .status(500)
          .json({ success: false, error: "Error BD: " + err.sqlMessage });

      let imagenesArray = [];
      if (result.length > 0 && result[0].imagen_urls)
        imagenesArray = JSON.parse(result[0].imagen_urls);
      if (req.file) imagenesArray = [req.file.filename];
      let fotosJSON = JSON.stringify(imagenesArray);

      const sqlUpdate = `UPDATE evento SET nombre_evento = ?, fecha = ?, hora_inicio = ?, hora_fin = ?, lugar = ?, ubicacion = ?, observaciones = ?, imagen_urls = ? WHERE id_evento = ?`;

      connection.query(
        sqlUpdate,
        [
          nombre_evento,
          fecha,
          horaInicioFinal,
          horaFinFinal,
          lugar,
          ubicacion,
          observaciones,
          fotosJSON,
          id_evento,
        ],
        (err2) => {
          if (err2)
            return res
              .status(500)
              .json({ success: false, error: "Error BD: " + err2.sqlMessage });
          res.json({ success: true, message: "Evento actualizado" });
        },
      );
    },
  );
});

// ================= API: ELIMINAR =================
router.delete("/eliminar/:id", (req, res) => {
  const id = req.params.id;
  connection.query("DELETE FROM evento WHERE id_evento = ?", [id], (err) => {
    if (err) {
      if (err.code === "ER_ROW_IS_REFERENCED_2")
        return res
          .status(400)
          .json({
            success: false,
            error:
              "No se puede eliminar: El evento tiene alumnos o encargados asignados.",
          });
      return res
        .status(500)
        .json({ success: false, error: "Error BD: " + err.sqlMessage });
    }
    res.json({ success: true, message: "Evento eliminado" });
  });
});

// ================= API: ASIGNAR RESPONSABLE =================
router.post("/asignar", (req, res) => {
  const { id_evento, id_responsable } = req.body;

  const deleteSql = "DELETE FROM evento_responsable WHERE id_evento = ?";

  connection.query(deleteSql, [id_evento], (errDelete) => {
    if (errDelete)
      return res
        .status(500)
        .json({ success: false, error: "Error BD: " + errDelete.sqlMessage });

    if (id_responsable && id_responsable !== "") {
        const sql = "INSERT INTO evento_responsable (id_evento, id_responsable) VALUES (?, ?)";
        connection.query(sql, [id_evento, id_responsable], (err) => {
        if (err)
            return res
            .status(500)
            .json({ success: false, error: "Error BD: " + err.sqlMessage });
        res.json({
            success: true,
            message: "Responsable asignado correctamente",
        });
        });
    } else {
        res.json({ success: true, message: "Se ha quitado al responsable del evento" });
    }
  });
});

module.exports = router;