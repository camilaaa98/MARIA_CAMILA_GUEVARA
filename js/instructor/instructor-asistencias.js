/**
 * Consultar Asistencias - Instructor
 * Gestión y consulta de asistencias registradas
 */

let asistenciasData = [];

document.addEventListener('DOMContentLoaded', () => {
    configurarValidacionesFecha();
    cargarAsistencias();
});

/**
 * Configurar validaciones de fecha
 * - Fecha inicio no puede ser mayor que fecha fin
 * - Fecha fin no puede ser menor que fecha inicio
 * - Ninguna fecha puede ser futura
 */
function configurarValidacionesFecha() {
    const fechaInicio = document.getElementById('filtroFechaInicio');
    const fechaFin = document.getElementById('filtroFechaFin');
    const hoy = new Date().toISOString().split('T')[0];

    // Establecer fecha máxima como hoy
    fechaInicio.max = hoy;
    fechaFin.max = hoy;

    // Validación cuando cambia fecha inicio
    fechaInicio.addEventListener('change', function () {
        const valorInicio = this.value;
        const valorFin = fechaFin.value;

        // Verificar que no sea futura
        if (valorInicio > hoy) {
            alert('⚠️ La fecha de inicio no puede ser futura');
            this.value = hoy;
            return;
        }

        // Si hay fecha fin, verificar que inicio no sea mayor
        if (valorFin && valorInicio > valorFin) {
            alert('⚠️ La fecha de inicio no puede ser mayor que la fecha fin');
            this.value = valorFin;
        }
    });

    // Validación cuando cambia fecha fin
    fechaFin.addEventListener('change', function () {
        const valorInicio = fechaInicio.value;
        const valorFin = this.value;

        // Verificar que no sea futura
        if (valorFin > hoy) {
            alert('⚠️ La fecha fin no puede ser futura');
            this.value = hoy;
            return;
        }

        // Si hay fecha inicio, verificar que fin no sea menor
        if (valorInicio && valorFin < valorInicio) {
            alert('⚠️ La fecha fin no puede ser menor que la fecha de inicio');
            this.value = valorInicio;
        }
    });
}

/**
 * Cargar asistencias desde la base de datos
 */
async function cargarAsistencias() {
    try {
        // Inicializar vacío
        asistenciasData = [];

        mostrarAsistencias(asistenciasData);
    } catch (error) {
        console.error('Error cargando asistencias:', error);
        alert('❌ Error al cargar asistencias');
    }
}

/**
 * Mostrar asistencias en la tabla
 */
function mostrarAsistencias(asistencias) {
    const tbody = document.getElementById('tablaAsistencias');

    if (!asistencias || asistencias.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">No hay asistencias registradas</td></tr>';
        return;
    }

    tbody.innerHTML = asistencias.map(a => `
        <tr>
            <td>${formatearFecha(a.fecha)}</td>
            <td>${a.ficha}</td>
            <td style="color: #10B981; font-weight: 600;">${a.presentes}</td>
            <td style="color: #EF4444; font-weight: 600;">${a.ausentes}</td>
            <td>${a.total}</td>
            <td>
                <span class="badge ${a.porcentaje >= 80 ? 'badge-success' : a.porcentaje >= 60 ? 'badge-warning' : 'badge-danger'}">
                    ${a.porcentaje.toFixed(1)}%
                </span>
            </td>
            <td>
                <button class="btn-icon" onclick="verDetalle('${a.fecha}', '${a.ficha}')" title="Ver Detalle">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                    </svg>
                </button>
            </td>
        </tr>
    `).join('');
}

/**
 * Filtrar asistencias según criterios seleccionados
 */
function filtrarAsistencias() {
    const fichaSeleccionada = document.getElementById('filtroFicha').value;
    const fechaInicio = document.getElementById('filtroFechaInicio').value;
    const fechaFin = document.getElementById('filtroFechaFin').value;

    let asistenciasFiltradas = [...asistenciasData];

    // Filtrar por ficha
    if (fichaSeleccionada) {
        asistenciasFiltradas = asistenciasFiltradas.filter(a => a.ficha === fichaSeleccionada);
    }

    // Filtrar por rango de fechas
    if (fechaInicio) {
        asistenciasFiltradas = asistenciasFiltradas.filter(a => a.fecha >= fechaInicio);
    }

    if (fechaFin) {
        asistenciasFiltradas = asistenciasFiltradas.filter(a => a.fecha <= fechaFin);
    }

    mostrarAsistencias(asistenciasFiltradas);
}

/**
 * Exportar asistencias a Excel
 */
function exportarAsistencias() {
    const fichaSeleccionada = document.getElementById('filtroFicha').value;
    const fechaInicio = document.getElementById('filtroFechaInicio').value;
    const fechaFin = document.getElementById('filtroFechaFin').value;

    // Obtener datos filtrados
    let datosExportar = [...asistenciasData];

    if (fichaSeleccionada) {
        datosExportar = datosExportar.filter(a => a.ficha === fichaSeleccionada);
    }

    if (fechaInicio) {
        datosExportar = datosExportar.filter(a => a.fecha >= fechaInicio);
    }

    if (fechaFin) {
        datosExportar = datosExportar.filter(a => a.fecha <= fechaFin);
    }

    if (datosExportar.length === 0) {
        alert('⚠️ No hay datos para exportar');
        return;
    }

    // Crear tabla HTML para Excel
    let tabla = `
        <table border="1">
            <thead>
                <tr style="background-color: #39A900; color: white;">
                    <th>Fecha</th>
                    <th>Ficha</th>
                    <th>Presentes</th>
                    <th>Ausentes</th>
                    <th>Total</th>
                    <th>% Asistencia</th>
                </tr>
            </thead>
            <tbody>
    `;

    datosExportar.forEach(a => {
        tabla += `
            <tr>
                <td>${formatearFecha(a.fecha)}</td>
                <td>${a.ficha}</td>
                <td>${a.presentes}</td>
                <td>${a.ausentes}</td>
                <td>${a.total}</td>
                <td>${a.porcentaje.toFixed(1)}%</td>
            </tr>
        `;
    });

    tabla += '</tbody></table>';

    // Crear blob y descargar
    const blob = new Blob([tabla], { type: 'application/vnd.ms-excel' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);

    const nombreArchivo = `Asistencias_${fechaInicio || 'todas'}_${fechaFin || 'hasta_hoy'}.xls`;
    link.download = nombreArchivo;
    link.click();

    alert('✅ Archivo Excel generado exitosamente');
}

/**
 * Ver detalle de una asistencia específica
 */
function verDetalle(fecha, ficha) {
    alert(`Ver detalle de asistencia:\nFecha: ${formatearFecha(fecha)}\nFicha: ${ficha}`);
    // Aquí se puede implementar un modal con el detalle completo
}

/**
 * Formatear fecha para mostrar
 */
function formatearFecha(fecha) {
    const partes = fecha.split('-');
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}
