// Este script se ejecuta en la portada (index.html)

window.onload = () => {
    // Busca la etiqueta del año en el pie de página y le pone el año actual automáticamente
    const spanYear = document.getElementById('year');
    if (spanYear) {
        spanYear.textContent = new Date().getFullYear();
    }
};