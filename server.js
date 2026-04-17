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

// Archivos estáticos apuntando a tu nueva carpeta frontend
app.use(express.static(path.join(__dirname, "frontend")));
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); // Para las fotos

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
    return next(); // Si todo está bien, pasamos a la siguiente ruta
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

    // Validamos que el rol sea uno de los permitidos (opcional, pero buena práctica)
    const rolesPermitidos = ["administrador", "promotor"];
    if (!rolesPermitidos.includes(u.rol)) {
      return res
        .status(403)
        .json({ error: "Rol no autorizado para ingresar al panel." });
    }

    // Creamos el token
    const token = jwt.sign(
      { id: u.id_responsable, usuario: u.nombre, rol: u.rol },
      JWT_SECRET,
      { expiresIn: "2h" },
    );

    res.json({ token, usuario: u.nombre, rol: u.rol });
  });
});

// ================= RUTAS PÚBLICAS (Alumnos) =================

// Obtener eventos vigentes para el combo de registro
app.get("/api/eventos_publicos", (req, res) => {
  const sql =
    "SELECT id_evento, nombre_evento FROM evento WHERE fecha >= CURDATE() ORDER BY fecha ASC";
  connection.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: "Error en servidor" });
    res.json(results);
  });
});

// Guardar alumno y darle un Token para entrar al menú
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
        return res.status(500).json({ error: "Error al guardar el alumno" });

      // Creamos el token para que el alumno pueda navegar
      const token = jwt.sign(
        { id: result.insertId, usuario: nombre, rol: "participante" },
        JWT_SECRET,
        { expiresIn: "4h" }, // 4 horas para jugar
      );

      res.json({
        success: true,
        token,
        usuario: nombre,
        rol: "participante",
      });
    },
  );
});

// ================= RUTAS IMPORTADAS =================

// Escuelas es público para el combobox
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
app.use("/api/juegos/codeRun", auth, require("./routes/juegos/codeRun"));
app.use("/api/juegos/error404", auth, require("./routes/juegos/error404"));
app.use(
  "/api/juegos/desafioTech",
  auth,
  require("./routes/juegos/desafioTech"),
);
app.use(
  "/api/guardar_encuesta",
  auth,
  require("./routes/juegos/guardar_encuesta"),
);

// ================= OTRAS RUTAS PROTEGIDAS =================

// Guardar encuesta
app.post("/api/guardar_encuesta", auth, (req, res) => {
  const usuario = req.user.usuario;
  const { calificacion, comentario, id_juego } = req.body;

  const sqlUser = "SELECT id_participante FROM participante WHERE nombre=?";

  connection.query(sqlUser, [usuario], (err, resultUser) => {
    if (err || resultUser.length === 0) {
      return res
        .status(404)
        .json({ error: "Usuario participante no encontrado" });
    }

    const id_participante = resultUser[0].id_participante;
    const sql =
      "INSERT INTO satisfaccion (calificacion, comentario, id_participante, id_juego) VALUES (?, ?, ?, ?)";

    connection.query(
      sql,
      [calificacion, comentario, id_participante, id_juego],
      (err) => {
        if (err)
          return res
            .status(500)
            .json({ error: "Error al guardar la encuesta" });
        res.json({ success: true, message: "Gracias por tu opinión" });
      },
    );
  });
});

// ================= RUTA POR DEFECTO (Index) =================
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "index.html"));
});

// ================= INICIAR SERVIDOR =================
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
