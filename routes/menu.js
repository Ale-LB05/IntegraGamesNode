const express = require("express");
const router = express.Router();
const connection = require("../db");

router.get("/", (req, res) => {
  // 1. Extraer datos del Token (Cargados por el middleware auth)
  const idUsuario = req.user?.id;
  const rol = (req.user?.rol || "participante").toLowerCase();
  const nombreUsuario = req.user?.usuario || "Invitado";

  // Ya no existe el programador
  const rolesStaff = ["administrador", "promotor"];
  const esStaff = rolesStaff.includes(rol);

  // 2. Respuesta base (Lo que ven los alumnos por defecto)
  let dataRespuesta = {
    usuario: {
      nombre: nombreUsuario,
      rol: rol,
      imagen: "/img/responsables/sinFoto.jpg", // Foto por defecto
    },
    tarjetas: [
      {
        nombre_evento: "Tecnología de la Información",
        imagen: "/img/utm2.png",
        observaciones: "Carrera con gran futuro profesional.",
      },
      {
        nombre_evento: "Vida Universitaria",
        imagen: "/img/imagen3.jpeg",
        observaciones: "Conoce las instalaciones de tu nueva casa.",
      },
    ],
    juegos: [
      {
        nombre: "Error 404",
        imagen: "/img/uno/uno.png",
        descripcion: "Juego de cartas competitivo.",
        link: "/error404.html",
      },
      {
        nombre: "Code Run",
        imagen: "/img/codeRun/runCode.png",
        descripcion: "Plataformero 2D de superación.",
        link: "/codeRun.html",
      },
      {
        nombre: "Desafío Tech",
        imagen: "/img/codeRun/runCode.3.png",
        descripcion: "Pon a prueba tus conocimientos.",
        link: "/desafioTech.html",
      },
    ],
  };

  // 3. SI ES STAFF: Buscamos foto real y eventos de la BD
  if (esStaff) {
    const sqlFoto =
      "SELECT imagen_urls FROM responsable WHERE id_responsable = ?";

    connection.query(sqlFoto, [idUsuario], (err, result) => {
      if (!err && result.length > 0 && result[0].imagen_urls) {
        try {
          const imgs = JSON.parse(result[0].imagen_urls);
          if (imgs.length > 0)
            dataRespuesta.usuario.imagen = `/uploads/responsables/${imgs[0]}`;
        } catch (e) {}
      }

      const hoy = new Date().toISOString().split("T")[0];

      // NUEVO: Agregamos hora, lugar y ubicacion a la consulta SQL
      const sqlEv =
        "SELECT nombre_evento, imagen_urls, observaciones, fecha, hora, lugar, ubicacion FROM evento WHERE fecha >= ? ORDER BY fecha ASC";

      connection.query(sqlEv, [hoy], (errEv, resEv) => {
        if (!errEv) {
          dataRespuesta.tarjetas = resEv.map((e) => {
            let img = "/img/default.png";
            try {
              const a = JSON.parse(e.imagen_urls);
              if (a.length > 0) img = `/uploads/eventos/${a[0]}`;
            } catch (errJ) {}

            return {
              nombre_evento: e.nombre_evento,
              observaciones: e.observaciones,
              fecha: e.fecha,
              hora: e.hora, // Añadido
              lugar: e.lugar, // Añadido
              ubicacion: e.ubicacion, // Añadido
              imagen: img,
            };
          });
        }
        return res.json({ success: true, data: dataRespuesta });
      });
    });
  }
  // 4. SI ES ALUMNO: Enviamos la respuesta estática de inmediato
  else {
    return res.json({ success: true, data: dataRespuesta });
  }
});

module.exports = router;
