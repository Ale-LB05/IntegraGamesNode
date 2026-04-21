const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const path = require("path");

// ================= CONEXIÓN DB =================
const connection = require("./db");

const app = express();
const PORT = 3000;
const JWT_SECRET = "integraGames-clave-secreta"; // Clave para los tokens

// ================= MIDDLEWARES =================
app.use(cors());
app.use(express.json()); // Permite recibir JSON
app.use(express.urlencoded({ extended: true }));

// Archivos estáticos
app.use(express.static(path.join(__dirname, "frontend")));
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); // Para las fotos subidas

// ================= MIDDLEWARE DE AUTENTICACIÓN =================
function auth(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No autorizado. Inicia sesión." });
  }

  try {
    const token = header.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    return next();
  } catch (error) {
    return res.status(401).json({ error: "Token inválido o expirado" });
  }
}

// ================= RUTAS DE ACCESO (LOGIN) =================
app.post("/api/login", (req, res) => {
  const correo = req.body.correo ? req.body.correo.trim() : "";
  const password = req.body.password ? req.body.password.trim() : "";

  if (!correo || !password) {
    return res.status(400).json({ error: "Faltan datos" });
  }

  const sql = "SELECT * FROM responsable WHERE correo = ? AND contraseña = ?";

  connection.query(sql, [correo, password], (err, results) => {
    if (err) {
      console.error("Error BD:", err);
      return res.status(500).json({ error: "Error en el servidor" });
    }

    if (results.length === 0) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    const u = results[0];

    // Validar roles administrativos
    const rolesPermitidos = ["administrador", "promotor"];
    if (!rolesPermitidos.includes(u.rol)) {
      return res
        .status(403)
        .json({ error: "Rol no autorizado para ingresar al panel." });
    }

    // --- LÓGICA DE FOTOGRAFÍA (Manejo de JSON array 'imagen_urls') ---
    let nombreArchivo = null;
    if (u.imagen_urls && u.imagen_urls !== "[]" && u.imagen_urls !== "NULL") {
      try {
        // Intentamos parsear por si es un arreglo ["foto.jpg"]
        const parsedImages = JSON.parse(u.imagen_urls);
        if (Array.isArray(parsedImages) && parsedImages.length > 0) {
          nombreArchivo = parsedImages[0];
        }
      } catch (e) {
        // Si no es JSON, lo tomamos como texto plano
        nombreArchivo = u.imagen_urls;
      }
    }

    let fotoUsuario = "/img/responsables/sinFoto.jpg"; // Fallback por defecto
    if (nombreArchivo) {
      fotoUsuario = nombreArchivo.startsWith("/")
        ? nombreArchivo
        : `/uploads/responsables/${nombreArchivo}`;
    }

    // Crear Token
    const token = jwt.sign(
      { id: u.id_responsable, usuario: u.nombre, rol: u.rol },
      JWT_SECRET,
      { expiresIn: "2h" },
    );

    res.json({ token, usuario: u.nombre, rol: u.rol, foto: fotoUsuario });
    
  });
});

// ================= RUTAS PÚBLICAS (Alumnos) =================

// Obtener eventos del DÍA ACTUAL usando API Externa
app.get("/api/eventos_publicos", async (req, res) => {
  try {
    const respuestaAPI = await fetch(
      "http://worldtimeapi.org/api/timezone/America/Mexico_City",
    );
    const dataHora = await respuestaAPI.json();
    const fechaHoy = dataHora.datetime.split("T")[0];

    const sql =
      "SELECT id_evento, nombre_evento FROM evento WHERE DATE(fecha) = ?";
    connection.query(sql, [fechaHoy], (err, results) => {
      if (err) return res.status(500).json({ error: "Error en base de datos" });
      res.json(results);
    });
  } catch (error) {
    console.error("Error API externa, usando fallback local");
    const sqlFallback =
      "SELECT id_evento, nombre_evento FROM evento WHERE fecha = CURDATE()";
    connection.query(sqlFallback, (err, results) => {
      if (err) return res.status(500).json({ error: "Error local" });
      res.json(results);
    });
  }
});

// Registro de participante y entrega de Token
app.post("/api/guardar_alumno", (req, res) => {
  const { nombre, edad, id_evento, id_escuela } = req.body;

  if (!nombre || !edad || !id_evento || !id_escuela) {
    return res.status(400).json({ error: "Faltan datos" });
  }

  const sql =
    "INSERT INTO participante (nombre, edad, id_evento, id_escuela) VALUES (?, ?, ?, ?)";
  connection.query(
    sql,
    [nombre, edad, id_evento, id_escuela],
    (err, result) => {
      if (err)
        return res.status(500).json({ error: "Error al guardar participante" });

      const token = jwt.sign(
        { id: result.insertId, usuario: nombre, rol: "participante" },
        JWT_SECRET,
        { expiresIn: "4h" },
      );

      res.json({
        success: true,
        token,
        usuario: nombre,
        rol: "participante",
        foto: "/img/responsables/sinFoto.jpg",
      });
    },
  );
});

// ================= RUTAS DE LA API (CRUDs y Perfil) =================

// Rutas con acceso público o combobox
app.use("/api/escuelas", require("./routes/cruds/escuelas"));

// Rutas Protegidas por JWT
app.use("/api/menu", auth, require("./routes/menu"));
app.use("/api/perfil", auth, require("./routes/perfil"));
app.use("/api/personal", auth, require("./routes/cruds/personal"));
app.use("/api/eventos", auth, require("./routes/cruds/eventos"));
app.use(
  "/api/historial-eventos",
  auth,
  require("./routes/cruds/encargadoEvento"),
);
app.use("/api/historial-participantes", auth, require("./routes/cruds/lista"));

// Juegos y Encuestas
app.use("/api/juegos/codeRun", require("./routes/juegos/codeRun"));
app.use("/api/juegos/error404", require("./routes/juegos/error404"));
app.use("/api/juegos/desafioTech", require("./routes/juegos/desafioTech"));
app.use(
  "/api/guardar_encuesta",
  auth,
  require("./routes/juegos/guardar_encuesta"),
);

// ================= RUTAS GENERALES (VAN ESTRICTAMENTE AL FINAL) =================

// Index principal
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "index.html"));
});

// Cualquier sub-ruta definida en routes/index.js
app.use("/", require("./routes/index"));

// ================= INICIAR SERVIDOR =================
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
