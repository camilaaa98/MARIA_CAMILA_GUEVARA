/**
 * Gestión de Programas - Navegación Cruzada con Paginación
 */

let todosProgramas = [];
let programasFiltrados = [];
let paginaActual = 1;
const programasPorPagina = 10;

document.addEventListener('DOMContentLoaded', () => {
    cargarProgramas();
    configurarPaginacion();
});

function configurarPaginacion() {
    document.getElementById('prevBtnProgramas')?.addEventListener('click', () => {
        if (paginaActual > 1) {
            paginaActual--;
            mostrarProgramas(programasFiltrados);
        }
    });

    document.getElementById('nextBtnProgramas')?.addEventListener('click', () => {
        const totalPaginas = Math.ceil(programasFiltrados.length / programasPorPagina);
        if (paginaActual < totalPaginas) {
            paginaActual++;
            mostrarProgramas(programasFiltrados);
        }
    });
}

async function cargarProgramas() {
    try {
        const response = await fetch('api/test-programas.php');
        const result = await response.json();

        if (result.success) {
            todosProgramas = result.data;
            programasFiltrados = todosProgramas;
            paginaActual = 1;
            mostrarProgramas(programasFiltrados);
        }
    } catch (error) {
        console.error('Error:', error);
        // Datos Mock de respaldo
        // Sin datos mock
        todosProgramas = [];
        programasFiltrados = todosProgramas;
        paginaActual = 1;
        mostrarProgramas(programasFiltrados);
    }
}

let terminoBusqueda = '';

function mostrarProgramas(programas) {
    const tbody = document.querySelector('tbody');

    if (!programas || programas.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">No hay programas registrados</td></tr>';
        actualizarInfoPaginacionProgramas(0, 0);
        return;
    }

    // Calcular índices de paginación
    const inicio = (paginaActual - 1) * programasPorPagina;
    const fin = inicio + programasPorPagina;
    const programasPagina = programas.slice(inicio, fin);

    tbody.innerHTML = programasPagina.map(p => {
        const nombreDisplay = resaltarTexto(p.nombre_programa, terminoBusqueda);

        return `
        <tr>
            <td>${nombreDisplay}</td>
            <td>${p.nivel_formacion || 'N/A'}</td>
            <td>
                <select onchange="cambiarEstadoPrograma('${p.codigo_programa}', this.value)" 
                        style="padding: 4px; border-radius: 4px; border: 1px solid #ddd; color: white; background-color: ${p.estado === 'Inactivo' ? '#ef4444' : '#39A900'}">
                    <option value="Activo" ${p.estado !== 'Inactivo' ? 'selected' : ''} style="background: white; color: black;">Activo</option>
                    <option value="Inactivo" ${p.estado === 'Inactivo' ? 'selected' : ''} style="background: white; color: black;">Inactivo</option>
                </select>
            </td>
        </tr>
        `;
    }).join('');

    actualizarInfoPaginacionProgramas(programas.length, programasPagina.length);
}

function resaltarTexto(texto, termino) {
    if (!termino || termino.length < 2) return texto;
    const regex = new RegExp(`(${termino})`, 'gi');
    return texto.toString().replace(regex, '<span style="background-color: #fff3cd; color: #856404; font-weight: bold; padding: 0 2px; border-radius: 2px;">$1</span>');
}

// ... (resto de funciones) ...

function exportarProgramas() {
    const datos = programasFiltrados.length > 0 ? programasFiltrados : todosProgramas;

    if (!datos || datos.length === 0) {
        alert('No hay datos para exportar');
        return;
    }

    let table = `
        <table border="1">
            <thead>
                <tr>
                    <th colspan="3" style="background-color: #39A900; color: white; text-align: center; font-size: 14pt;">
                        AsistNet - Reporte de Programas de Formación
                    </th>
                </tr>
                <tr>
                    <th colspan="3">Fecha de Generación: ${new Date().toLocaleDateString()}</th>
                </tr>
                <tr style="background-color: #f0f0f0;">
                    <th>Nombre del Programa</th>
                    <th>Nivel de Formación</th>
                    <th>Estado</th>
                </tr>
            </thead>
            <tbody>
    `;

    datos.forEach(p => {
        table += `
            <tr>
                <td>${p.nombre_programa}</td>
                <td>${p.nivel_formacion || 'N/A'}</td>
                <td>${p.estado}</td>
            </tr>
        `;
    });

    table += '</tbody></table>';

    // Agregar BOM UTF-8 para que Excel reconozca los caracteres especiales
    const BOM = '\uFEFF';
    const content = BOM + table;

    const blob = new Blob([content], {
        type: 'application/vnd.ms-excel;charset=utf-8;'
    });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Reporte_Programas_${new Date().toISOString().split('T')[0]}.xls`;
    link.click();

    alert('✅ Archivo Excel generado exitosamente');
}

function filtrarProgramas(texto) {
    terminoBusqueda = texto.toLowerCase();
    programasFiltrados = todosProgramas.filter(p =>
        (p.nombre_programa && p.nombre_programa.toLowerCase().includes(terminoBusqueda)) ||
        (p.codigo_programa && p.codigo_programa.toString().includes(terminoBusqueda))
    );
    paginaActual = 1;
    mostrarProgramas(programasFiltrados);
}

function actualizarInfoPaginacionProgramas(total, mostrados) {
    const totalPaginas = Math.ceil(total / programasPorPagina);
    const pageInfo = document.getElementById('pageInfoProgramas');
    if (pageInfo) {
        pageInfo.textContent = `Página ${paginaActual} de ${totalPaginas || 1} (${mostrados} de ${total} programas)`;
    }

    const prevBtn = document.getElementById('prevBtnProgramas');
    const nextBtn = document.getElementById('nextBtnProgramas');
    if (prevBtn) prevBtn.disabled = paginaActual === 1;
    if (nextBtn) nextBtn.disabled = paginaActual >= totalPaginas;
}

function cambiarEstadoPrograma(codigo, nuevoEstado) {
    const select = event.target;
    select.style.backgroundColor = nuevoEstado === 'Inactivo' ? '#ef4444' : '#10b981';
    console.log(`Estado programa ${codigo} cambiado a ${nuevoEstado}`);
}

// Redirigir a aprendices filtrados por ficha
function verAprendicesFicha(ficha) {
    // Guardar filtro en localStorage para que la página de aprendices lo lea
    localStorage.setItem('filtro_ficha', ficha);
    window.location.href = 'admin-aprendices.html';
}

// Redirigir a fichas filtradas por programa
function filtrarFichasPorPrograma(programa) {
    localStorage.setItem('filtro_programa', programa);
    window.location.href = 'admin-fichas.html';
}

function nuevoPrograma() {
    document.getElementById('modalTitlePrograma').textContent = 'Nuevo Programa';
    document.getElementById('formPrograma').reset();
    document.getElementById('modalPrograma').style.display = 'flex';
}

function cerrarModalPrograma() {
    document.getElementById('modalPrograma').style.display = 'none';
}

async function guardarPrograma(event) {
    event.preventDefault();

    const formData = {
        numeroFicha: document.getElementById('codigoPrograma').value.trim(),
        nombrePrograma: document.getElementById('nombrePrograma').value.trim(),
        nivelFormacion: document.getElementById('nivelFormacion').value,
        jornada: document.getElementById('jornadaPrograma').value,
        estado: document.getElementById('estadoPrograma').value
    };

    // Validaciones frontend antes de enviar
    if (!formData.numeroFicha || !formData.nombrePrograma) {
        alert('❌ Por favor complete todos los campos obligatorios');
        return;
    }

    try {
        const response = await fetch('api/crear-programa-ficha.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        const result = await response.json();

        if (result.success) {
            let mensaje = '✅ Ficha creada exitosamente';
            if (result.programa_nuevo) {
                mensaje += '\n📚 Se creó el nuevo programa: ' + formData.nombrePrograma;
            } else {
                mensaje += '\n📚 Se usó el programa existente: ' + formData.nombrePrograma;
            }
            alert(mensaje);
            cerrarModalPrograma();
            cargarProgramas();
        } else {
            alert('❌ ' + result.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Error al guardar: ' + error.message);
    }
}



function filtrarProgramas(texto) {
    const termino = texto.toLowerCase();
    programasFiltrados = todosProgramas.filter(p =>
        p.nombre_programa.toLowerCase().includes(termino) ||
        (p.codigo_programa && p.codigo_programa.toString().includes(termino))
    );
    paginaActual = 1;
    mostrarProgramas(programasFiltrados);
}
