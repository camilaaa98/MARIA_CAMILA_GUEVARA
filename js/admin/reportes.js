/**
 * Gestión de Reportes - Carga dinámica
 */

let aprendicesData = [];
let fichasData = [];
let instructoresData = [];

document.addEventListener('DOMContentLoaded', () => {
    cargarDatosIniciales();
    configurarTipoReporte();
});

async function cargarDatosIniciales() {
    try {
        // Cargar fichas
        const resFichas = await fetch('api/test-fichas.php');
        const dataFichas = await resFichas.json();
        if (dataFichas.success) fichasData = dataFichas.data;

        // Cargar aprendices
        const resAprendices = await fetch('api/test-aprendices.php?page=1&limit=2000');
        const dataAprendices = await resAprendices.json();
        if (dataAprendices.success) aprendicesData = dataAprendices.data;

        // Cargar instructores
        const resInstructores = await fetch('api/test-instructores.php');
        const dataInstructores = await resInstructores.json();
        if (dataInstructores.success) instructoresData = dataInstructores.data;

    } catch (error) {
        console.error('Error cargando datos:', error);
    }
}

function configurarTipoReporte() {
    const tipoSelect = document.getElementById('tipoReporte');
    const contenedorBusqueda = document.getElementById('contenedorBusqueda');

    tipoSelect.addEventListener('change', (e) => {
        const tipo = e.target.value;
        mostrarCampoBusqueda(tipo);
    });
}

function mostrarCampoBusqueda(tipo) {
    const contenedor = document.getElementById('contenedorBusqueda');

    if (tipo === 'general') {
        contenedor.innerHTML = '<p style="color: #6b7280;">Se generará reporte de todas las fichas y programas</p>';
        return;
    }

    let html = '<div class="form-group"><label for="campoBusqueda">Buscar:</label>';

    if (tipo === 'ficha') {
        html += '<input type="text" id="campoBusqueda" list="listaFichas" placeholder="Ingrese número de ficha" inputmode="numeric">';
        html += '<datalist id="listaFichas">';
        fichasData.forEach(f => {
            html += `<option value="${f.numero_ficha}">${f.numero_ficha} - ${f.nombre_programa || ''}</option>`;
        });
        html += '</datalist>';
    } else if (tipo === 'aprendiz') {
        html += '<input type="text" id="campoBusqueda" list="listaAprendices" placeholder="Documento o nombre del aprendiz">';
        html += '<datalist id="listaAprendices">';
        aprendicesData.forEach(a => {
            html += `<option value="${a.documento}">${a.nombre} ${a.apellido} - ${a.documento}</option>`;
        });
        html += '</datalist>';
    } else if (tipo === 'instructor') {
        html += '<select id="campoBusqueda" class="form-select">';
        html += '<option value="">Seleccione instructor</option>';
        instructoresData.forEach(i => {
            html += `<option value="${i.id_usuario}">${i.nombre} ${i.apellido}</option>`;
        });
        html += '</select>';
    } else if (tipo === 'programa') {
        html += '<input type="text" id="campoBusqueda" list="listaProgramas" placeholder="Buscar programa">';
        html += '<datalist id="listaProgramas">';
        const programasUnicos = [...new Set(fichasData.map(f => f.nombre_programa))];
        programasUnicos.forEach(p => {
            if (p) html += `<option value="${p}">${p}</option>`;
        });
        html += '</datalist>';
    }

    html += '</div>';
    contenedor.innerHTML = html;
}

function generarReporte(event) {
    event.preventDefault();

    const tipo = document.getElementById('tipoReporte').value;
    const campoBusqueda = document.getElementById('campoBusqueda');
    const valorBusqueda = campoBusqueda ? campoBusqueda.value : '';
    const fechaInicio = document.getElementById('reporteFechaInicio').value;
    const fechaFin = document.getElementById('reporteFechaFin').value;
    const formato = document.getElementById('formatoReporte').value;

    if (formato === 'excel') {
        const url = `api/reporte-excel.php?tipo=${tipo}&busqueda=${valorBusqueda}&fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`;
        window.location.href = url;
    } else if (formato === 'pdf') {
        const url = `api/reporte-view.php?tipo=${tipo}&busqueda=${valorBusqueda}&fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`;
        window.open(url, '_blank');
    } else {
        alert('Formato no soportado aún.');
    }
}
