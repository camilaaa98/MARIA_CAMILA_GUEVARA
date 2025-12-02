/**
 * Gestión de Aprendices - Dashboard con API
 */

let todosAprendices = [];
let aprendicesFiltrados = [];
let currentPage = 1;
const itemsPerPage = 10;
let terminoBusqueda = '';
let fichaContexto = null; // Guarda la ficha actual para auto-llenar el modal

document.addEventListener('DOMContentLoaded', () => {
    const filtroFicha = localStorage.getItem('filtro_ficha');
    if (filtroFicha) {
        localStorage.removeItem('filtro_ficha');
        fichaContexto = filtroFicha; // Guardar en variable global
        document.querySelector('.table-title').innerHTML = `Lista de Aprendices - Ficha: <span class="badge badge-info">${filtroFicha}</span>`;
        cargarTodosAprendices(filtroFicha);
    } else {
        cargarTodosAprendices();
    }
});

async function cargarTodosAprendices(filtroFicha = null) {
    try {
        const response = await fetch(`api/test-aprendices.php?limit=1000`);
        const result = await response.json();

        if (result.success) {
            todosAprendices = result.data;

            // Aplicar filtro de ficha si existe
            if (filtroFicha) {
                aprendicesFiltrados = todosAprendices.filter(a => a.id_ficha == filtroFicha);
            } else {
                aprendicesFiltrados = todosAprendices;
            }

            currentPage = 1;
            mostrarAprendicesPaginados();
        } else {
            console.error('Error:', result.message);
            alert('Error al cargar aprendices');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

function filtrarAprendices(texto) {
    terminoBusqueda = texto.toLowerCase();
    aprendicesFiltrados = todosAprendices.filter(a =>
        (a.nombre && a.nombre.toLowerCase().includes(terminoBusqueda)) ||
        (a.apellido && a.apellido.toLowerCase().includes(terminoBusqueda)) ||
        (a.documento && a.documento.toString().includes(terminoBusqueda)) ||
        (a.id_ficha && a.id_ficha.toString().includes(terminoBusqueda))
    );
    currentPage = 1;
    mostrarAprendicesPaginados();
}

function mostrarAprendicesPaginados() {
    const inicio = (currentPage - 1) * itemsPerPage;
    const fin = inicio + itemsPerPage;
    const aprendicesPagina = aprendicesFiltrados.slice(inicio, fin);

    mostrarAprendices(aprendicesPagina);
    actualizarInfoPaginacion(aprendicesFiltrados.length, aprendicesPagina.length);
}

function mostrarAprendices(aprendices) {
    const tbody = document.querySelector('tbody');

    if (!aprendices || aprendices.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">No hay aprendices registrados</td></tr>';
        return;
    }

    tbody.innerHTML = aprendices.map(a => {
        const nombreCompleto = `${a.nombre || ''} ${a.apellido || ''}`;
        const nombreDisplay = resaltarTexto(nombreCompleto, terminoBusqueda);
        const documentoDisplay = resaltarTexto(a.documento || '', terminoBusqueda);
        const fichaDisplay = resaltarTexto(a.id_ficha || '', terminoBusqueda);

        return `
        <tr>
            <td>${nombreDisplay}</td>
            <td>${documentoDisplay}</td>
            <td>${fichaDisplay}</td>
            <td>${a.nombre_programa || 'Sin programa asignado'}</td>
            <td><span class="badge badge-success">ACTIVO</span></td>
            <td>
                <button class="btn-icon" onclick="editarAprendiz(${a.id_aprendiz})" title="Editar">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                    </svg>
                </button>
                <button class="btn-icon" onclick="eliminarAprendiz(${a.id_aprendiz})" title="Eliminar">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                    </svg>
                </button>
            </td>
        </tr>
    `}).join('');
}

function resaltarTexto(texto, termino) {
    if (!termino || termino.length < 2) return texto;
    const regex = new RegExp(`(${termino})`, 'gi');
    return texto.toString().replace(regex, '<span style="background-color: #fff3cd; color: #856404; font-weight: bold; padding: 0 2px; border-radius: 2px;">$1</span>');
}

function actualizarInfoPaginacion(total, mostrados) {
    const totalPaginas = Math.ceil(total / itemsPerPage);
    const pageInfo = document.getElementById('pageInfo');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    if (pageInfo) {
        pageInfo.textContent = `Página ${currentPage} de ${totalPaginas || 1} (${mostrados} de ${total} aprendices)`;
    }

    if (prevBtn) {
        prevBtn.disabled = currentPage === 1;
        prevBtn.onclick = () => {
            if (currentPage > 1) {
                currentPage--;
                mostrarAprendicesPaginados();
            }
        };
    }

    if (nextBtn) {
        nextBtn.disabled = currentPage >= totalPaginas;
        nextBtn.onclick = () => {
            if (currentPage < totalPaginas) {
                currentPage++;
                mostrarAprendicesPaginados();
            }
        };
    }
}

function exportarAprendices() {
    const datos = aprendicesFiltrados.length > 0 ? aprendicesFiltrados : todosAprendices;

    if (!datos || datos.length === 0) {
        alert('No hay datos para exportar');
        return;
    }

    let table = `
        <table border="1">
            <thead>
                <tr>
                    <th colspan="5" style="background-color: #39A900; color: white; text-align: center; font-size: 14pt;">
                        AsistNet - Reporte de Aprendices
                    </th>
                </tr>
                <tr>
                    <th colspan="5">Fecha de Generación: ${new Date().toLocaleDateString()}</th>
                </tr>
                <tr style="background-color: #f0f0f0;">
                    <th>Nombre Completo</th>
                    <th>Documento</th>
                    <th>Ficha</th>
                    <th>Programa</th>
                    <th>Estado</th>
                </tr>
            </thead>
            <tbody>
    `;

    datos.forEach(a => {
        table += `
            <tr>
                <td>${a.nombre} ${a.apellido}</td>
                <td>${a.documento}</td>
                <td>${a.id_ficha}</td>
                <td>${a.nombre_programa || 'N/A'}</td>
                <td>Activo</td>
            </tr>
        `;
    });

    table += '</tbody></table>';

    // Agregar BOM UTF-8 para caracteres especiales
    const BOM = '\uFEFF';
    const content = BOM + table;
    
    const blob = new Blob([content], { 
        type: 'application/vnd.ms-excel;charset=utf-8;' 
    });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Reporte_Aprendices_${new Date().toISOString().split('T')[0]}.xls`;
    link.click();

    alert('✅ Archivo Excel generado exitosamente');
}

function nuevoAprendiz() {
    document.getElementById('modalTitle').textContent = 'Nuevo Aprendiz';
    document.getElementById('formAprendiz').reset();
    cargarFichasModal();

    // Si estamos en el contexto de una ficha específica, pre-llenar y deshabilitar
    if (fichaContexto) {
        setTimeout(() => { // Esperar a que carguen las fichas
            const fichaInput = document.getElementById('fichaAprendiz');
            const estadoSelect = document.getElementById('estadoAprendiz');

            fichaInput.value = fichaContexto;
            fichaInput.disabled = true;
            fichaInput.style.backgroundColor = '#f3f4f6';
            fichaInput.title = 'La ficha está fijada porque está dentro de una ficha específica';

            estadoSelect.value = 'En Formación';
            estadoSelect.disabled = true;
            estadoSelect.style.backgroundColor = '#f3f4f6';
            estadoSelect.title = 'El estado está fijado porque está dentro de una ficha específica';
        }, 300);
    }

    document.getElementById('modalAprendiz').style.display = 'flex';
}

function cerrarModalAprendiz() {
    document.getElementById('modalAprendiz').style.display = 'none';
}

async function cargarFichasModal() {
    try {
        const response = await fetch('api/test-fichas.php');
        const result = await response.json();

        if (result.success) {
            const datalist = document.getElementById('fichasList');
            if (datalist) {
                datalist.innerHTML = '';
                result.data.forEach(f => {
                    const option = document.createElement('option');
                    option.value = f.numero_ficha;
                    option.textContent = `${f.numero_ficha} - ${f.nombre_programa || 'Sin programa'}`;
                    datalist.appendChild(option);
                });
            }
        }
    } catch (error) {
        console.error('Error cargando fichas:', error);
    }
}

async function guardarAprendiz(event) {
    event.preventDefault();

    const formData = {
        tipo_identificacion: document.getElementById('tipoDocumento').value,
        documento: document.getElementById('documento').value,
        nombre: document.getElementById('nombre').value,
        apellido: document.getElementById('apellido').value,
        celular: document.getElementById('celular').value || null,
        correo: document.getElementById('correo').value || null,
        numero_ficha: document.getElementById('fichaAprendiz').value,
        estado: document.getElementById('estadoAprendiz').value
    };

    try {
        const response = await fetch('api/index.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                resource: 'aprendices',
                action: 'create',
                data: formData
            })
        });

        const result = await response.json();

        if (response.ok) {
            alert('✅ Aprendiz guardado exitosamente en la base de datos');
            cerrarModalAprendiz();
            cargarTodosAprendices();
        } else {
            alert('❌ Error: ' + result.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Error al guardar aprendiz');
    }
}

function editarAprendiz(id) {
    alert('Editar aprendiz ' + id);
}

function eliminarAprendiz(id) {
    if (confirm('¿Está seguro de eliminar este aprendiz?')) {
        alert('Eliminar aprendiz ' + id);
    }
}
