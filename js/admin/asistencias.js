/**
 * Gestión de Asistencias - Validaciones y Datos
 */

let asistenciasData = [];

document.addEventListener('DOMContentLoaded', () => {
    cargarAsistencias();
    configurarFiltros();
    cargarFichasFiltro();
    cargarInstructoresFiltro();
});

async function cargarFichasFiltro() {
    try {
        const response = await fetch('api/test-fichas.php');
        const result = await response.json();
        if (result.success) {
            const select = document.getElementById('filtroFicha');
            if (select) {
                select.innerHTML = '<option value="">Todas</option>';
                result.data.forEach(f => {
                    const option = document.createElement('option');
                    option.value = f.numero_ficha;
                    option.textContent = `${f.numero_ficha} - ${f.nombre_programa || 'Sin Programa'}`;
                    select.appendChild(option);
                });
            }
        }
    } catch (error) { console.error(error); }
}

async function cargarInstructoresFiltro() {
    try {
        const response = await fetch('api/test-instructores.php');
        const result = await response.json();
        if (result.success) {
            const select = document.getElementById('filtroInstructor');
            if (select) {
                select.innerHTML = '<option value="">Todos</option>';
                result.data.forEach(i => {
                    const option = document.createElement('option');
                    option.value = i.id_usuario;
                    option.textContent = `${i.nombre} ${i.apellido}`;
                    select.appendChild(option);
                });
            }
        }
    } catch (error) { console.error(error); }
}

function configurarFiltros() {
    const fechaInicio = document.getElementById('filtroFechaInicio');
    const fechaFin = document.getElementById('filtroFechaFin');

    if (!fechaInicio || !fechaFin) return;

    // Establecer max fecha actual (no futuras)
    const hoy = new Date().toISOString().split('T')[0];
    fechaInicio.max = hoy;
    fechaFin.max = hoy;

    // Validar rangos
    fechaInicio.addEventListener('change', () => {
        // Validar no futura
        if (fechaInicio.value > hoy) {
            alert('No se pueden seleccionar fechas futuras');
            fechaInicio.value = '';
            return;
        }
        // Validar rango
        if (fechaFin.value && fechaInicio.value > fechaFin.value) {
            alert('La fecha de inicio no puede ser mayor a la fecha fin');
            fechaInicio.value = '';
        }
    });

    fechaFin.addEventListener('change', () => {
        // Validar no futura
        if (fechaFin.value > hoy) {
            alert('No se pueden seleccionar fechas futuras');
            fechaFin.value = '';
            return;
        }
        // Validar rango
        if (fechaInicio.value && fechaFin.value < fechaInicio.value) {
            alert('La fecha fin no puede ser menor a la fecha de inicio');
            fechaFin.value = '';
        }
    });
}

async function cargarAsistencias() {
    try {
        const response = await fetch('api/test-asistencias.php');
        const result = await response.json();

        if (result.success) {
            asistenciasData = result.data;
            mostrarAsistencias(asistenciasData);
        }
    } catch (error) {
        console.error('Error cargando asistencias:', error);
    }
}

function mostrarAsistencias(datos) {
    const tbody = document.querySelector('tbody');

    if (!datos || datos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center;">No hay registros de asistencia</td></tr>';
        return;
    }

    // Renderizar datos...
}

function exportarAsistencias() {
    alert('Exportando asistencias...');
    // Lógica de exportación similar a aprendices
}
