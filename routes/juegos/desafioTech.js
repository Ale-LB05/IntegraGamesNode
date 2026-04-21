const express = require('express');
const router = express.Router();

// ================= API: OBTENER INFO DEL JUEGO DESAFÍO TECH =================
router.get('/', (req, res) => {
    
    const juego = {
        nombre: "Desafío Tech",
        imagenes: [
            "/img/desafioTech/desafioTech.png",
            "/img/desafioTech/desafioTech.2.png",
            "/img/desafioTech/desafioTech.3.png",
            "/img/desafioTech/desafioTech.4.png"
        ],
        parrafo: "Desafío Tech es una experiencia interactiva que convierte el conocimiento en tecnología en un reto emocionante. A través de una dinámica llena de ritmo, los jugadores ponen a prueba sus habilidades en temas clave de TI mientras se divierten. ¡Descubre todo el potencial que existe en el mundo tecnológico!",
        descripcion: [
            "Preguntas de distintos niveles, comodines y potenciadores.",
            "Compite y aprende con la guía de Maestro Byte.",
            "Acércate a la carrera de TI de forma entretenida.",
            "Despierta tu interés por la innovación."
        ],
        // Asegúrate de que la carpeta se llame exactamente DesafioTech o desafioTech
        link: "/juegos/DesafioTech/index.html" 
    };

    res.json({ success: true, data: juego });
});

module.exports = router;