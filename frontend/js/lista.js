const API_URL = "/api/historial-participantes";
let dataTableInstance;

$(document).ready(() => {
    // 1. Configurar barra superior y permisos
    const usuario = localStorage.getItem("usuario") || "Usuario";
    const rol = (localStorage.getItem("rol") || "").toLowerCase();
    
    // Nombres y roles en la barra superior
    const nombreTop = document.getElementById("nombreUsuarioTop");
    if(nombreTop) {
        nombreTop.textContent = usuario + " - " + rol;
    }

    // ================= SOLUCIÓN DE FOTOGRAFÍA =================
    let fotoPerfil = localStorage.getItem("foto");

    // Si por alguna razón el localStorage está sucio, forzamos la imagen por defecto
    if (!fotoPerfil || fotoPerfil === "undefined" || fotoPerfil === "null") {
        fotoPerfil = "/img/responsables/sinFoto.jpg";
    }

    const imgTopBar = document.querySelector(".img-profile");
    if (imgTopBar) {
        imgTopBar.src = fotoPerfil;

        // TRUCO MAESTRO: Si la imagen física fue borrada de tu PC, activa este error 
        // y pone la de por defecto.
        imgTopBar.onerror = function() {
            this.src = "/img/responsables/sinFoto.jpg";
        };
    }

    // ================= SEGURIDAD Y ROLES =================
    // Redirigir si es un participante (los alumnos no pueden ver el historial)
    if (rol !== "administrador" && rol !== "promotor") {
        window.location.href = "/menu.html";
        return;
    }

    // Ocultar los menús administrativos si es promotor
    if (rol === "promotor") {
        const itemPersonal = document.getElementById("menuPersonal");
        const itemEscuelas = document.getElementById("menuEscuelas");
        if (itemPersonal) itemPersonal.style.display = "none";
        if (itemEscuelas) itemEscuelas.style.display = "none";
    }

    // 2. Cargar los datos de la tabla
    cargarLista();
});

async function cargarLista() {
    const token = localStorage.getItem("token");

    try {
        const res = await fetch(API_URL, {
            headers: { Authorization: `Bearer ${token}` },
        });
        const result = await res.json();

        if (result.success) {
            const tbody = document.getElementById("tbodyParticipantes");
            if (!tbody) return;
            
            tbody.innerHTML = "";

            const badgeTotal = document.getElementById("totalParticipantesBadge");
            if(badgeTotal) {
                badgeTotal.innerHTML = `<i class="fas fa-database text-primary mr-1"></i> Total registrados: ${result.data.length}`;
            }

            result.data.forEach((row) => {
                // Formatear Fecha
                let fechaFormateada = "-";
                if (row.fecha) {
                    const fechaObj = new Date(row.fecha);
                    const dia = String(fechaObj.getDate()).padStart(2, "0");
                    const mes = String(fechaObj.getMonth() + 1).padStart(2, "0");
                    const anio = fechaObj.getFullYear();
                    fechaFormateada = `${dia}/${mes}/${anio}`;
                }

                // Formatear Juego
                let juegoHtml = '<span class="text-muted">-</span>';
                if (row.juego) {
                    juegoHtml = `
                        <span class="badge px-3 py-1 rounded-pill" style="background-color: #e3f2fd; color: #0288d1; font-weight: 600;">
                            <i class="fas fa-gamepad mr-1"></i> ${row.juego}
                        </span>`;
                }

                // Formatear Calificación (Lógica de colores)
                let calificacionHtml = '<span class="text-muted">-</span>';
                if (row.calificacion !== null && row.calificacion !== undefined) {
                    const cal = parseInt(row.calificacion);
                    if (cal >= 8) {
                        // Verde (Excelente)
                        calificacionHtml = `<span class='badge px-3 py-2 rounded-pill shadow-sm' style='background-color: #1cc88a; color: white; font-size: 0.85rem;'>${cal} <i class='fas fa-star ml-1'></i></span>`;
                    } else if (cal >= 3 && cal <= 7) {
                        // Amarillo (Regular)
                        calificacionHtml = `<span class='badge px-3 py-2 rounded-pill shadow-sm' style='background-color: #f6c23e; color: white; font-size: 0.85rem;'>${cal} <i class='fas fa-star ml-1'></i></span>`;
                    } else {
                        // Rojo (Malo)
                        calificacionHtml = `<span class='badge px-3 py-2 rounded-pill shadow-sm' style='background-color: #e74a3b; color: white; font-size: 0.85rem;'>${cal} <i class='fas fa-star ml-1'></i></span>`;
                    }
                }

                // Insertar fila en la tabla
                tbody.innerHTML += `
                    <tr>
                        <td class="pl-4 fw-bold text-dark">${row.nombre}</td>
                        <td class="text-center">
                            <span class="badge bg-light text-dark border rounded-circle" style="padding: 8px 10px;">${row.edad}</span>
                        </td>
                        <td class="text-secondary">${row.nombre_evento || "-"}</td>
                        <td class="text-muted"><small>${row.nombre_escuela || "-"}</small></td>
                        <td>${juegoHtml}</td>
                        <td class="text-muted small">${fechaFormateada}</td>
                        <td class="text-center">${calificacionHtml}</td>
                        <td class="text-muted" style="max-width: 250px; font-style: italic;">
                            <small>${row.comentario || "-"}</small>
                        </td>
                    </tr>
                `;
            });

            // Inicializar la librería DataTables
            inicializarTabla();

        } else {
            console.error("Error:", result.error);
        }
    } catch (error) {
        console.error("Error de conexión:", error);
    }
}

// ================= CONFIGURACIÓN DATATABLES =================
function inicializarTabla() {
    dataTableInstance = $("#tablaParticipantes").DataTable({
        pageLength: 10,
        lengthMenu: [
            [5, 10, 25, 50, -1],
            [5, 10, 25, 50, "Todos"],
        ],
        language: {
            lengthMenu: "Mostrar _MENU_ registros",
            zeroRecords: "No se encontraron registros",
            info: "Mostrando página _PAGE_ de _PAGES_",
            infoEmpty: "No hay datos disponibles",
            infoFiltered: "(filtrado de _MAX_ totales)",
            search: "",
            paginate: {
                first: "Primera",
                last: "Última",
                next: "Siguiente >",
                previous: "< Anterior",
            },
        },
    });

    // Conectar el buscador personalizado al buscador de DataTables
    $("#buscadorPersonalizado").off("keyup").on("keyup", function () {
        dataTableInstance.search(this.value).draw();
    });
}

// ================= EXPORTACIÓN EXCEL Y SWEETALERT =================
function confirmarExportacion() {
    Swal.fire({
        title: "¿Exportar a Excel?",
        text: "Se generará un reporte con la satisfacción de los alumnos.",
        icon: "info",
        showCancelButton: true,
        confirmButtonColor: "#1cc88a",
        cancelButtonColor: "#e74a3b",
        confirmButtonText: '<i class="fas fa-download mr-1"></i> Sí, exportar',
        cancelButtonText: "Cancelar",
        reverseButtons: true,
        customClass: {
            confirmButton: "rounded-pill px-4 shadow-sm",
            cancelButton: "rounded-pill px-4",
        },
    }).then((result) => {
        if (result.isConfirmed) {
            Swal.fire({
                title: "Procesando Documento...",
                html: "Preparando calificaciones",
                timer: 1500,
                timerProgressBar: true,
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                },
                willClose: () => {
                    ejecutarExportacion();
                },
            });
        }
    });
}

function ejecutarExportacion() {
    // Destruimos momentáneamente el datatable para agarrar todas las páginas
    if ($.fn.DataTable.isDataTable("#tablaParticipantes")) {
        $("#tablaParticipantes").DataTable().destroy();
    }

    let tablaOriginal = document.getElementById("tablaParticipantes");
    let tablaClon = tablaOriginal.cloneNode(true);

    // Borrar iconos FontAwesome
    let iconos = tablaClon.querySelectorAll("i");
    iconos.forEach((icono) => icono.remove());

    let estilo = "<style>table { font-family: Arial; } th { background-color: #4e73df; color: white; padding: 10px; } td { padding: 8px; border: 1px solid #dddddd; }</style>";
    let uri = "data:application/vnd.ms-excel;base64,";
    let template = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="UTF-8">' + estilo + "</head><body><table>{table}</table></body></html>";

    let base64 = function (s) {
        return window.btoa(unescape(encodeURIComponent(s)));
    };
    let format = function (s, c) {
        return s.replace(/{(\w+)}/g, function (m, p) {
            return c[p];
        });
    };

    let ctx = { worksheet: "Reporte_Satisfaccion", table: tablaClon.innerHTML };

    let a = document.createElement("a");
    a.href = uri + base64(format(template, ctx));
    a.download = "Reporte_Satisfaccion_" + new Date().toISOString().slice(0, 10) + ".xls";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // Volver a crear el DataTable después de descargar
    inicializarTabla();

    Swal.fire({
        icon: "success",
        title: "¡Descarga Exitosa!",
        showConfirmButton: false,
        timer: 2000,
    });
}

function cerrarSesion() {
    localStorage.clear();
    window.location.href = "/registroAdmin/login.html";
}