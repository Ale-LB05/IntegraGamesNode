const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    
    const juego = {
        nombre: "Code Run",
        imagenes: [
            "/img/codeRun/runCode.2.png",
            "/img/codeRun/runCode.3.png",
            "/img/codeRun/runCode.png",
            "/img/codeRun/runCode.4.png"
        ],
        descripcion: [
            "El proyecto consiste en un videojuego de plataformas 2D desarrollado en Godot, en el cual el jugador controla un personaje que interactúa con distintos elementos del entorno, recolecta objetos y avanza a través de niveles.",
            "Esta versión incluye las bases del sistema jugable, como movimiento, interacción con objetos y control de la partida."
        ],
        // OJO AQUÍ: Asegúrate de que la carpeta se llame exactamente Code&Run en tu PC
        link: "/juegos/Code&Run/index.html" 
    };

    res.json({ success: true, data: juego });
});

module.exports = router;