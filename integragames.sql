-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 15-04-2026 a las 20:43:49
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `integragames1`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `escuela`
--

CREATE TABLE `escuela` (
  `id_escuela` int(11) NOT NULL,
  `nombre_escuela` varchar(150) NOT NULL,
  `contacto` varchar(150) DEFAULT NULL,
  `direccion` varchar(200) DEFAULT NULL,
  `telefono` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `escuela`
--

INSERT INTO `escuela` (`id_escuela`, `nombre_escuela`, `contacto`, `direccion`, `telefono`) VALUES
(1, 'Conalep 2', 'Rihanna', 'Juan A. Gutiérrez 800, Jardines de Guadalupe, 58140 Morelia, Mich.', '443 327 3168');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `evento`
--

CREATE TABLE `evento` (
  `id_evento` int(11) NOT NULL,
  `nombre_evento` varchar(100) NOT NULL,
  `fecha` date NOT NULL,
  `hora` time DEFAULT NULL,
  `lugar` varchar(100) NOT NULL,
  `ubicacion` varchar(255) NOT NULL,
  `observaciones` text DEFAULT NULL,
  `imagen_urls` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`imagen_urls`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `evento`
--

INSERT INTO `evento` (`id_evento`, `nombre_evento`, `fecha`, `hora`, `lugar`, `ubicacion`, `observaciones`, `imagen_urls`) VALUES
(1, 'Morelia Brilla', '2026-04-20', '09:30:00', 'UTM', 'Av, Vicepresidente Pino Suárez 750, Cd Industrial, 58200 Morelia, Mich.', 'pues brilla', ''),
(2, 'Entrega de chips D4TA', '2026-04-06', '12:58:00', 'UTM', 'Av, Vicepresidente Pino Suárez 750, Cd Industrial, 58200 Morelia, Mich.', 'aaaaa', ''),
(3, 'Entrega de chips D4TA 2.0', '2026-04-07', '08:30:00', 'UTM', 'Av, Vicepresidente Pino Suárez 750, Cd Industrial, 58200 Morelia, Mich.', 'lol', ''),
(5, 'FestUTM', '2026-04-20', '09:00:00', 'Morelia Michoacan ', 'Av, Calz. Ventura Puente s/n, Félix Ireta, 58070 Morelia, Mich.', 'lol', ''),
(6, 'Acuatlon', '2026-04-13', '09:00:00', 'Morelia Michoacan ', 'Av, Vicepresidente Pino Suárez 750, Cd Industrial, 58200 Morelia, Mich.', 'holis', '');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `evento_responsable`
--

CREATE TABLE `evento_responsable` (
  `id_evento` int(11) NOT NULL,
  `id_responsable` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `evento_responsable`
--

INSERT INTO `evento_responsable` (`id_evento`, `id_responsable`) VALUES
(1, 1),
(5, 2),
(6, 4);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `juego`
--

CREATE TABLE `juego` (
  `id_juego` int(11) NOT NULL,
  `nombre_juego` varchar(100) NOT NULL,
  `categoria` varchar(50) DEFAULT NULL,
  `descripcion` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `juego`
--

INSERT INTO `juego` (`id_juego`, `nombre_juego`, `categoria`, `descripcion`) VALUES
(1, 'Error 404', 'cartas', 'Juego de cartas competitivo'),
(2, 'Code&Run', 'Interativo', 'Evita enemigos y supera niveles.');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `participante`
--

CREATE TABLE `participante` (
  `id_participante` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `edad` int(11) NOT NULL,
  `id_evento` int(11) DEFAULT NULL,
  `id_escuela` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `participante`
--

INSERT INTO `participante` (`id_participante`, `nombre`, `edad`, `id_evento`, `id_escuela`) VALUES
(1, 'alisia', 17, 2, 1),
(2, 'Pachoco', 16, 2, 1),
(3, 'alondra', 17, 2, 1),
(4, 'carlos', 19, 2, 1),
(5, 'kenia', 18, 3, 1),
(6, 'Luci', 54, 6, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `responsable`
--

CREATE TABLE `responsable` (
  `id_responsable` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `correo` varchar(100) NOT NULL,
  `contraseña` varchar(100) NOT NULL,
  `rol` varchar(50) NOT NULL,
  `imagen_urls` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`imagen_urls`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `responsable`
--

INSERT INTO `responsable` (`id_responsable`, `nombre`, `correo`, `contraseña`, `rol`, `imagen_urls`) VALUES
(1, 'Alejandro', 'alelopezbae86@gmail.com', 'ale1515', 'administrador', ''),
(2, 'Jeni', 'jeni@gmail.com', 'jeni1515', 'promotor', ''),
(3, 'Gabriela', 'gabi@gmail.com', 'gabi1234', 'promotor', ''),
(4, 'Sabrina', 'sabrina@gob.com', 'sabri1515', 'promotor', '');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `satisfaccion`
--

CREATE TABLE `satisfaccion` (
  `id_satisfaccion` int(11) NOT NULL,
  `calificacion` int(11) NOT NULL,
  `comentario` text DEFAULT NULL,
  `fecha` date NOT NULL,
  `id_participante` int(11) DEFAULT NULL,
  `id_juego` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `satisfaccion`
--

INSERT INTO `satisfaccion` (`id_satisfaccion`, `calificacion`, `comentario`, `fecha`, `id_participante`, `id_juego`) VALUES
(1, 4, 'Me parecio muy entretenido', '2026-04-07', 1, 2),
(8, 8, 'muy bien', '2026-04-07', 2, 2),
(9, 6, 'me gusto un poco', '2026-04-07', 3, 2),
(11, 10, 'wow', '2026-04-07', 4, 2),
(12, 2, 'No me gusto esta culero', '2026-04-13', 6, 2);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `escuela`
--
ALTER TABLE `escuela`
  ADD PRIMARY KEY (`id_escuela`);

--
-- Indices de la tabla `evento`
--
ALTER TABLE `evento`
  ADD PRIMARY KEY (`id_evento`);

--
-- Indices de la tabla `evento_responsable`
--
ALTER TABLE `evento_responsable`
  ADD PRIMARY KEY (`id_evento`,`id_responsable`),
  ADD KEY `id_responsable` (`id_responsable`);

--
-- Indices de la tabla `juego`
--
ALTER TABLE `juego`
  ADD PRIMARY KEY (`id_juego`);

--
-- Indices de la tabla `participante`
--
ALTER TABLE `participante`
  ADD PRIMARY KEY (`id_participante`),
  ADD KEY `id_evento` (`id_evento`),
  ADD KEY `id_escuela` (`id_escuela`);

--
-- Indices de la tabla `responsable`
--
ALTER TABLE `responsable`
  ADD PRIMARY KEY (`id_responsable`);

--
-- Indices de la tabla `satisfaccion`
--
ALTER TABLE `satisfaccion`
  ADD PRIMARY KEY (`id_satisfaccion`),
  ADD KEY `id_participante` (`id_participante`),
  ADD KEY `id_juego` (`id_juego`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `escuela`
--
ALTER TABLE `escuela`
  MODIFY `id_escuela` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `evento`
--
ALTER TABLE `evento`
  MODIFY `id_evento` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `juego`
--
ALTER TABLE `juego`
  MODIFY `id_juego` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `participante`
--
ALTER TABLE `participante`
  MODIFY `id_participante` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `responsable`
--
ALTER TABLE `responsable`
  MODIFY `id_responsable` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `satisfaccion`
--
ALTER TABLE `satisfaccion`
  MODIFY `id_satisfaccion` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `evento_responsable`
--
ALTER TABLE `evento_responsable`
  ADD CONSTRAINT `evento_responsable_ibfk_1` FOREIGN KEY (`id_evento`) REFERENCES `evento` (`id_evento`) ON DELETE CASCADE,
  ADD CONSTRAINT `evento_responsable_ibfk_2` FOREIGN KEY (`id_responsable`) REFERENCES `responsable` (`id_responsable`) ON DELETE CASCADE;

--
-- Filtros para la tabla `participante`
--
ALTER TABLE `participante`
  ADD CONSTRAINT `participante_ibfk_1` FOREIGN KEY (`id_evento`) REFERENCES `evento` (`id_evento`) ON DELETE SET NULL,
  ADD CONSTRAINT `participante_ibfk_2` FOREIGN KEY (`id_escuela`) REFERENCES `escuela` (`id_escuela`) ON DELETE SET NULL;

--
-- Filtros para la tabla `satisfaccion`
--
ALTER TABLE `satisfaccion`
  ADD CONSTRAINT `satisfaccion_ibfk_1` FOREIGN KEY (`id_participante`) REFERENCES `participante` (`id_participante`) ON DELETE CASCADE,
  ADD CONSTRAINT `satisfaccion_ibfk_2` FOREIGN KEY (`id_juego`) REFERENCES `juego` (`id_juego`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
