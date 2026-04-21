// routes/index.js
const express = require('express');
const router = express.Router();
const path = require('path');

// Esta ruta sirve el archivo index.html que está en la raíz de frontend
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

module.exports = router;