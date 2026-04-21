// Esperar a que el HTML esté cargado completamente
document.addEventListener("DOMContentLoaded", () => {
  // 1. Actualizar el año del footer
  const yearSpan = document.getElementById("year");
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }

  // El resto de tu objeto 'informacion' y la función 'abrirModal'
  // pueden ir afuera o adentro, pero la lógica de ejecución inicial DEBE ir aquí.
});

 const informacion = {
            'eventos': {
                titulo: 'Acerca de los Eventos',
                icono: 'fa-solid fa-trophy',
                contenido: `
                    <p class="mb-3 text-light opacity-75">Nuestros eventos están diseñados para poner a prueba tus habilidades de lógica y programación mediante juegos competitivos y colaborativos.</p>
                    <h6 class="fw-bold" style="color: #00d2ff;">Lo que encontrarás:</h6>
                    <ul class="text-start text-light opacity-75">
                        <li>Eventos exclusivos para alumnos y visitantes.</li>
                        <li>Retos de sabidria .</li>
                        <li>Exhibición de proyectos finales de la carrera de TI.</li>
                    </ul>
                `
            },
            'comunidad': {
                titulo: 'Nuestra Comunidad',
                icono: 'fa-solid fa-users',
                contenido: `
                    <p class="mb-3 text-light opacity-75">IntegraGames fue desarrollado orgullosamente por alumnos de la Universidad Tecnológica de Morelia (UTM).</p>
                    <h6 class="fw-bold" style="color: #00d2ff;">Tecnologías utilizadas:</h6>
                    <div class="d-flex justify-content-center gap-3 mt-3 fs-3">
                        <i class="fab fa-html5" title="HTML5" style="color: #E34F26;"></i>
                        <i class="fab fa-css3-alt" title="CSS3" style="color: #1572B6;"></i>
                        <i class="fab fa-js" title="JavaScript" style="color: #F7DF1E;"></i>
                        <i class="fas fa-database" title="MySQL" style="color: #4479A1;"></i>
                        <i class="fab fa-bootstrap" title="Bootstrap" style="color: #7952B3;"></i>
                    </div>
                    <p class="mt-4 mb-0 small opacity-50">Trabajamos bajo metodologías ágiles (Scrum) para garantizar la calidad de la plataforma.</p>
                `
            },
            'juegos': {
                titulo: 'Nuestros Juegos',
                icono: 'fa-solid fa-shield-halved',
                contenido: `
                    <p class="mb-3 text-light opacity-75">En la Zona Arcade encontrarás juegos desarrollados para enseñar conceptos fundamentales de programación de forma divertida.</p>
                    <h6 class="fw-bold" style="color: #00d2ff;">Catálogo actual:</h6>
                    <div class="text-start mt-3">
                        <div class="mb-2"><i class="fas fa-check-circle me-2 text-success"></i> <strong>Error 404:</strong> Juego de agilidad mental.</div>
                        <div class="mb-2"><i class="fas fa-check-circle me-2 text-success"></i> <strong>Code Run:</strong> Esquiva bugs y compila código.</div>
                        <div class="mb-2"><i class="fas fa-check-circle me-2 text-success"></i> <strong>DesafioTech:</strong> Preguntas y respuestas de TI.</div>
                    </div>
                `
            }
        };

function abrirModal(seccion) {
  const datos = informacion[seccion];
  if (!datos) return; // Seguridad

  document.getElementById("modalTitle").innerText = datos.titulo;
  document.getElementById("modalIcon").className = datos.icono + " me-2";
  document.getElementById("modalBody").innerHTML = datos.contenido;

  const modalElement = document.getElementById("infoModal");
  const modal = new bootstrap.Modal(modalElement);
  modal.show();
}