const API_URL = "/api/historial-eventos";
let dataTableInstance; // Variable para guardar la instancia de DataTables

$(document).ready(() => {
    // 1. Configurar barra superior y permisos
    const usuario = localStorage.getItem("usuario") || "Usuario";
    const rol = (localStorage.getItem("rol") || "").toLowerCase();
    
    const nombreTop = document.getElementById("nombreUsuarioTop");
    if (nombreTop) {
        nombreTop.textContent = usuario + " - " + rol;
    }

    // ================= SOLUCIÓN DE FOTOGRAFÍA =================
    let fotoPerfil = localStorage.getItem("foto");

    // Si el localStorage no tiene foto o es inválido, usamos la de por defecto
    if (!fotoPerfil || fotoPerfil === "undefined" || fotoPerfil === "null") {
        fotoPerfil = "/img/responsables/sinFoto.jpg";
    }

    const imgTopBar = document.querySelector(".img-profile");
    if (imgTopBar) {
        imgTopBar.src = fotoPerfil;

        // TRUCO MAESTRO: Si la imagen en la base de datos existe pero el archivo
        // físico fue borrado de tu PC, se activa este error y pone la de por defecto.
        imgTopBar.onerror = function() {
            this.src = "/img/responsables/sinFoto.jpg";
        };
    }

    // ================= SEGURIDAD Y ROLES =================
    // Redirigir si no es admin/promotor
    if (rol !== "administrador" && rol !== "promotor") {
        window.location.href = "/menu.html";
        return;
    }

    // Ocultar los menús si es promotor
    if (rol === "promotor") {
        const itemPersonal = document.getElementById("menuPersonal");
        const itemEscuelas = document.getElementById("menuEscuelas");
        if (itemPersonal) itemPersonal.style.display = "none";
        if (itemEscuelas) itemEscuelas.style.display = "none";
    }

    // Bloquear acceso al perfil para participantes (por seguridad extra)
    if (rol === "participante") {
        const enlacesPerfil = document.querySelectorAll('a[href="/perfil.html"], a[href="perfil.html"]');
        enlacesPerfil.forEach(enlace => enlace.style.display = "none");
    }

    // 2. Cargar el historial
    cargarHistorial();
});

async function cargarHistorial() {
    const token = localStorage.getItem("token");

    try {
        const res = await fetch(API_URL, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const result = await res.json();

        if (result.success) {
            const tbody = document.getElementById("tbodyHistorial");
            if (!tbody) return;
            
            tbody.innerHTML = "";
            
            // Actualizar contador
            const totalBadge = document.getElementById("totalEventosBadge");
            if (totalBadge) {
                totalBadge.innerHTML = `<i class="fas fa-database text-primary mr-1"></i> Total de eventos: ${result.data.length}`;
            }

            result.data.forEach(row => {
                // Formatear Fecha
                let fechaFormateada = '-';
                if (row.fecha) {
                    const fechaObj = new Date(row.fecha);
                    const dia = String(fechaObj.getDate()).padStart(2, '0');
                    const mes = String(fechaObj.getMonth() + 1).padStart(2, '0');
                    const anio = fechaObj.getFullYear();
                    fechaFormateada = `${dia}/${mes}/${anio}`;
                }

                // Generar fila HTML
                tbody.innerHTML += `
                    <tr>
                        <td class="pl-4">
                            <span class="fw-bold text-dark">${row.nombre_evento}</span>
                        </td>
                        <td>
                            <span class="text-muted small fw-bold">
                                <i class="fas fa-calendar-day mr-1" style="color: #4e73df;"></i> 
                                ${fechaFormateada}
                            </span>
                        </td>
                        <td>
                            <span class="text-muted small">
                                <i class="fas fa-map-marker-alt mr-1 text-danger"></i> 
                                ${row.lugar}
                            </span>
                        </td>
                        <td>
                            <span class="badge bg-light text-dark border px-3 py-2 rounded-pill" style="font-weight: 500;">
                                <i class="fas fa-user-tie text-primary mr-1"></i> 
                                ${row.nombre_responsable || 'Sin asignar'}
                            </span>
                        </td>
                        <td class="text-center">
                            <span class="badge px-3 py-2 rounded-pill shadow-sm" style="background-color: #e3f2fd; color: #0288d1; font-size: 0.9rem;">
                                <i class="fas fa-users mr-1"></i> ${row.total_personas}
                            </span>
                        </td>
                    </tr>
                `;
            });

            // Inicializar DataTables una vez que los datos estén en la tabla
            inicializarTabla();

        } else {
            console.error("Error del servidor:", result.error);
        }
    } catch (error) {
        console.error("Error de conexión:", error);
    }
}

// ================= CONFIGURACIÓN DATATABLES =================
function inicializarTabla() {
    dataTableInstance = $('#tablaRegistros').DataTable({
        "pageLength": 10,
        "lengthMenu": [[5, 10, 25, 50, -1], [5, 10, 25, 50, "Todos"]],
        "language": {
            "lengthMenu": "Mostrar _MENU_ eventos",
            "zeroRecords": "No se encontraron registros",
            "info": "Mostrando página _PAGE_ de _PAGES_",
            "infoEmpty": "No hay datos disponibles",
            "infoFiltered": "(filtrado de _MAX_ totales)",
            "search": "",
            "paginate": {
                "first": "Primera",
                "last": "Última",
                "next": "Siguiente >",
                "previous": "< Anterior"
            }
        }
    });

    // Enlazar el buscador personalizado
    $('#buscadorPersonalizado').on('keyup', function () {
        dataTableInstance.search(this.value).draw();
    });
}

// ================= EXPORTACIÓN EXCEL Y SWEETALERT =================
function confirmarExportacion() {
    Swal.fire({
        title: '¿Generar Reporte Excel?',
        text: "Se descargará un archivo con la lista actual de asistencia a eventos.",
        icon: 'info',
        showCancelButton: true,
        confirmButtonColor: '#1cc88a', 
        cancelButtonColor: '#e74a3b',  
        confirmButtonText: '<i class="fas fa-download mr-1"></i> Sí, descargar',
        cancelButtonText: 'Cancelar',
        reverseButtons: true,
        customClass: {
            confirmButton: 'rounded-pill px-4 shadow-sm',
            cancelButton: 'rounded-pill px-4'
        }
    }).then((result) => {
        if (result.isConfirmed) {
            Swal.fire({
                title: 'Procesando Documento...',
                html: 'Preparando filas y columnas',
                timer: 1500,
                timerProgressBar: true,
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                },
                willClose: () => {
                    ejecutarExportacion();
                }
            });
        }
    });
}

function ejecutarExportacion() {
    // Destruimos DataTables para exportar todas las filas
    if ($.fn.DataTable.isDataTable('#tablaRegistros')) {
        $('#tablaRegistros').DataTable().destroy();
    }

    let tablaOriginal = document.getElementById("tablaRegistros");
    let tablaClon = tablaOriginal.cloneNode(true);
    
    // Eliminamos íconos del clon
    let iconos = tablaClon.querySelectorAll('i');
    iconos.forEach(icono => icono.remove());

    let estilo = "<style>table { font-family: Arial; } th { background-color: #4e73df; color: white; padding: 10px; text-transform: uppercase; font-size: 12px; } td { padding: 8px; border: 1px solid #dddddd; font-size: 14px; }</style>";
    
    let uri = 'data:application/vnd.ms-excel;base64,';
    let template = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="UTF-8">' + estilo + '</head><body><table>{table}</table></body></html>';
    
    let base64 = function(s) { return window.btoa(unescape(encodeURIComponent(s))) };
    let format = function(s, c) { return s.replace(/{(\w+)}/g, function(m, p) { return c[p]; }) };

    let ctx = {worksheet: 'Historial_Asistencia', table: tablaClon.innerHTML};
    
    let a = document.createElement('a');
    a.href = uri + base64(format(template, ctx));
    a.download = 'Reporte_Asistencia_' + new Date().toISOString().slice(0,10) + '.xls';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // Volvemos a inicializar DataTables
    inicializarTabla();

    Swal.fire({
        icon: 'success',
        title: '¡Descarga Exitosa!',
        text: 'Tu archivo Excel se ha guardado correctamente.',
        showConfirmButton: false,
        timer: 2000
    });
}

function cerrarSesion() {
    localStorage.clear();
    window.location.href = "/registroAdmin/login.html";
}