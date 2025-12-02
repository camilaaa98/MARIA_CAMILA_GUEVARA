/**
 * Gestión de Fichas - Navegación Cruzada con Paginación
 */

let todasFichas = [];
let fichasFiltradas = [];
let paginaActual = 1;
const fichasPorPagina = 10;
let terminoBusqueda = '';

document.addEventListener('DOMContentLoaded', () => {
    const filtroPrograma = localStorage.getItem('filtro_programa');
    if (filtroPrograma) {
        localStorage.removeItem('filtro_programa');
        document.querySelector('.table-title').textContent = `Fichas del Programa: ${filtroPrograma}`;
    }
    cargarFichas();
    cargarProgramasDatalist();
    configurarPaginacion();
});

async function cargarProgramasDatalist() {
    try {
        const response = await fetch('api/test-programas.php');
        const result = await response.json();
        if (result.success) {
            const datalist = document.getElementById('listaProgramas');
            if (datalist) {
                datalist.innerHTML = '';
                result.data.forEach(p => {
                    const option = document.createElement('option');
                    option.value = p.nombre_programa;
                    datalist.appendChild(option);
                });
            }
        }
    } catch (error) {
        console.error('Error cargando programas:', error);
    }
}

function configurarPaginacion() {
    document.getElementById('prevBtnFichas')?.addEventListener('click', () => {
        if (paginaActual > 1) {
            paginaActual--;
            mostrarFichas(fichasFiltradas);
        }
    });

    document.getElementById('nextBtnFichas')?.addEventListener('click', () => {
        const totalPaginas = Math.ceil(fichasFiltradas.length / fichasPorPagina);
        if (paginaActual < totalPaginas) {
            paginaActual++;
            mostrarFichas(fichasFiltradas);
        }
    });
}

async function cargarFichas() {
    try {
        const response = await fetch('api/test-fichas.php');
        const result = await response.json();

        if (result.success) {
            todasFichas = result.data;
            fichasFiltradas = todasFichas;
            paginaActual = 1;
            mostrarFichas(fichasFiltradas);
        }
    } catch (error) {
        console.error('Error:', error);
        // Datos Mock de respaldo
        // Datos Mock de respaldo
        todasFichas = [
            { numero_ficha: '2558934', nombre_programa: 'ADSO', estado: 'Activa' },
            { numero_ficha: '2558935', nombre_programa: 'Multimedia', estado: 'Activa' },
            { numero_ficha: '2558936', nombre_programa: 'Sistemas', estado: 'Inactiva' }
        ];
        fichasFiltradas = todasFichas;
        paginaActual = 1;
        mostrarFichas(fichasFiltradas);
    }
}

function mostrarFichas(fichas) {
    const tbody = document.getElementById('tablaFichas');

    if (!fichas || fichas.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">No hay fichas registradas</td></tr>';
        actualizarInfoPaginacion(0, 0);
        return;
    }

    const inicio = (paginaActual - 1) * fichasPorPagina;
    const fin = inicio + fichasPorPagina;
    const fichasPagina = fichas.slice(inicio, fin);

    tbody.innerHTML = fichasPagina.map(f => {
        const estadoColor = f.estado === 'Inactiva' ? '#ef4444' : '#10b981';
        const numeroDisplay = resaltarTexto(f.numero_ficha, terminoBusqueda);
        const programaDisplay = resaltarTexto(f.nombre_programa || 'N/A', terminoBusqueda);

        return `
        <tr>
            <td>
                <button onclick="verAprendicesFicha('${f.numero_ficha}')" class="btn-ficha">${numeroDisplay}</button>
            </td>
            <td>${programaDisplay}</td>
            <td>
                <button class="btn-instructor" onclick="asignarInstructor('${f.numero_ficha}')">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
                    </svg>
                    Asignar Instructores
                </button>
            </td>
            <td>
                <select onchange="cambiarEstadoFicha('${f.numero_ficha}', this.value)" 
                        style="padding: 4px; border-radius: 4px; border: 1px solid #ddd; color: white; background-color: ${estadoColor}">
                    <option value="Activa" ${f.estado !== 'Inactiva' ? 'selected' : ''} style="background: white; color: black;">Activa</option>
                    <option value="Inactiva" ${f.estado === 'Inactiva' ? 'selected' : ''} style="background: white; color: black;">Inactiva</option>
                </select>
            </td>
        </tr>
        `;
    }).join('');

    actualizarInfoPaginacion(fichas.length, fichasPagina.length);
}

function resaltarTexto(texto, termino) {
    if (!termino || termino.length < 2) return texto;
    const regex = new RegExp(`(${termino})`, 'gi');
    return texto.toString().replace(regex, '<span style="background-color: #fff3cd; color: #856404; font-weight: bold; padding: 0 2px; border-radius: 2px;">$1</span>');
}

function actualizarInfoPaginacion(total, mostrados) {
    const totalPaginas = Math.ceil(total / fichasPorPagina);
    const pageInfo = document.getElementById('pageInfoFichas');
    if (pageInfo) {
        pageInfo.textContent = `Página ${paginaActual} de ${totalPaginas || 1} (${mostrados} de ${total} fichas)`;
    }

    const prevBtn = document.getElementById('prevBtnFichas');
    const nextBtn = document.getElementById('nextBtnFichas');
    if (prevBtn) prevBtn.disabled = paginaActual === 1;
    if (nextBtn) nextBtn.disabled = paginaActual >= totalPaginas;
}

function filtrarFichas(texto) {
    terminoBusqueda = texto.toLowerCase();
    fichasFiltradas = todasFichas.filter(f =>
        (f.numero_ficha && f.numero_ficha.toString().toLowerCase().includes(terminoBusqueda)) ||
        (f.nombre_programa && f.nombre_programa.toString().toLowerCase().includes(terminoBusqueda))
    );
    paginaActual = 1;
    mostrarFichas(fichasFiltradas);
}

function exportarFichas() {
    const datos = fichasFiltradas.length > 0 ? fichasFiltradas : todasFichas;

    if (!datos || datos.length === 0) {
        alert('No hay datos para exportar');
        return;
    }

    let table = `
        < table border = "1" >
            <thead>
                <tr style="background-color: #39A900; color: white;">
                    <th>Numero Ficha</th>
                    <th>Programa de Formación</th>
                    <th>Estado</th>
                </tr>
            </thead>
            <tbody>
    `;

    datos.forEach(f => {
        table += `
            <tr>
                <td>${f.numero_ficha}</td>
                <td>${f.nombre_programa || 'N/A'}</td>
                <td>${f.estado}</td>
            </tr>
        `;
    });

    table += '</tbody></table > ';

    const blob = new Blob([table], { type: 'application/vnd.ms-excel' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Reporte_Fichas_${new Date().toISOString().split('T')[0]}.xls`;
    link.click();

    alert('✅ Archivo Excel generado exitosamente');
}

async function guardarFicha(event) {
    event.preventDefault();

    const formData = {
        numero_ficha: document.getElementById('numeroFicha').value,
        nombre_programa: document.getElementById('programa') ? document.getElementById('programa').value : (document.getElementById('programaFicha') ? document.getElementById('programaFicha').value : 'N/A'),
        estado: document.getElementById('estadoFicha') ? document.getElementById('estadoFicha').value : 'Activa'
    };

    try {
        const response = await fetch('api/index.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                resource: 'fichas',
                action: 'create',
                data: formData
            })
        });

        const result = await response.json();

        if (response.ok) {
            alert('✅ Ficha guardada exitosamente en la base de datos');
            cerrarModal();
            cargarFichas();
        } else {
            alert('❌ Error: ' + result.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Error al guardar ficha');
    }
}

function cerrarModal() {
    const modal = document.getElementById('modalFicha');
    if (modal) modal.style.display = 'none';
}

// Simulación de BD de asignaciones
let asignacionesInstructores = {}; // { '2558934': ['Juan Pérez', 'Ana Gómez'] }

async function asignarInstructor(ficha) {
    document.getElementById('fichaAsignacion').value = ficha;
    document.getElementById('fichaDisplay').value = ficha;

    // Cargar instructores REALES desde la base de datos
    const instructorSelect = document.getElementById('instructorSelect');
    instructorSelect.innerHTML = '<option value="">Cargando...</option>';

    try {
        const response = await fetch('api/test-instructores.php');
        const result = await response.json();

        if (result.success) {
            instructorSelect.innerHTML = '<option value="">Seleccione un instructor...</option>';
            result.data.forEach(inst => {
                const option = document.createElement('option');
                option.value = inst.id_instructor;
                option.textContent = `${inst.nombre} ${inst.apellido}`;
                instructorSelect.appendChild(option);
            });
        } else {
            instructorSelect.innerHTML = '<option value="">Error al cargar</option>';
        }
    } catch (error) {
        console.error('Error cargando instructores:', error);
        instructorSelect.innerHTML = '<option value="">Error al cargar</option>';
    }

    actualizarListaInstructores(ficha);
    document.getElementById('modalInstructor').style.display = 'flex';
}

function actualizarListaInstructores(ficha) {
    const listaDiv = document.getElementById('listaInstructoresAsignados');
    const asignados = asignacionesInstructores[ficha] || [];

    if (asignados.length === 0) {
        listaDiv.innerHTML = '<span style="color: #666; font-style: italic;">Ninguno asignado</span>';
    } else {
        listaDiv.innerHTML = asignados.map(inst => `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px; background: #f0fdf4; padding: 5px; border-radius: 4px;">
                <span>${inst}</span>
                <button type="button" onclick="removerInstructor('${ficha}', '${inst}')" style="color: #ef4444; background: none; border: none; cursor: pointer;">&times;</button>
            </div>
        `).join('');
    }
}

async function guardarAsignacionInstructor(event) {
    console.log('guardarAsignacionInstructor called');
    event.preventDefault();
    const select = document.getElementById('instructorSelect');
    const instructorNombre = select.options[select.selectedIndex].text;
    const id_instructor = select.value;
    const ficha = document.getElementById('fichaAsignacion').value;

    if (!id_instructor) {
        alert('Seleccione un instructor');
        return;
    }

    try {
        const response = await fetch('api/asignaciones.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id_ficha: ficha,
                id_instructor: parseInt(id_instructor)
            })
        });

        const result = await response.json();

        if (result.success) {
            alert(`✅ Instructor ${instructorNombre} asignado a la ficha ${ficha}`);
            await cargarInstructoresAsignados(ficha);
            select.value = ""; // Reset select
        } else {
            alert('❌ Error: ' + (result.message || 'No se pudo asignar'));
        }
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Error al asignar instructor');
    }
}

async function removerInstructor(ficha, id_instructor, nombre) {
    if (confirm(`¿Quitar a ${nombre} de esta ficha ? `)) {
        try {
            const response = await fetch('api/asignaciones.php', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id_ficha: ficha,
                    id_instructor: id_instructor
                })
            });

            const result = await response.json();

            if (result.success) {
                await cargarInstructoresAsignados(ficha);
            } else {
                alert('❌ Error: ' + (result.message || 'No se pudo remover'));
            }
        } catch (error) {
            console.error('Error:', error);
            alert('❌ Error al remover instructor');
        }
    }
}

async function cargarInstructoresAsignados(ficha) {
    try {
        const response = await fetch(`api/asignaciones.php?id_ficha=${ficha}`);
        const result = await response.json();

        const listaDiv = document.getElementById('listaInstructoresAsignados');
        listaDiv.innerHTML = '';

        if (result.success && result.data.length > 0) {
            result.data.forEach(inst => {
                const badge = document.createElement('div'); // Changed to div for better styling control
                badge.className = 'instructor-badge';
                badge.style = "display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px; background: #f0fdf4; padding: 5px; border-radius: 4px;";
                badge.innerHTML = `
                    <span>${inst.nombres} ${inst.apellidos}</span>
        <button type="button" onclick="removerInstructor('${ficha}', ${inst.id_instructor}, '${inst.nombres}')"
            style="color: #ef4444; background: none; border: none; cursor: pointer;">&times;</button>
                `;
                listaDiv.appendChild(badge);
            });
        } else {
            listaDiv.innerHTML = '<span style="color: #666; font-style: italic;">Ninguno asignado</span>';
        }
    } catch (error) {
        console.error('Error cargando instructores asignados:', error);
        const listaDiv = document.getElementById('listaInstructoresAsignados');
        listaDiv.innerHTML = '<span style="color: #ef4444; font-style: italic;">Error al cargar asignaciones</span>';
    }
}

function cerrarModalInstructor() {
    document.getElementById('modalInstructor').style.display = 'none';
}

async function cambiarEstadoFicha(ficha, nuevoEstado) {
    const select = event.target;
    select.style.backgroundColor = nuevoEstado === 'Inactiva' ? '#ef4444' : '#10b981';

    if (nuevoEstado === 'Inactiva') {
        if (asignacionesInstructores[ficha] && asignacionesInstructores[ficha].length > 0) {
            if (confirm(`Al inactivar la ficha ${ficha}, se desasignarán todos los instructores. ¿Continuar ? `)) {
                delete asignacionesInstructores[ficha];
                localStorage.setItem('asignacionesInstructores', JSON.stringify(asignacionesInstructores));
                alert('⚠️ Ficha inactivada y asignaciones eliminadas.');
            } else {
                // Revertir cambio si cancela (opcional, pero complejo sin recargar)
                // Por simplicidad, solo notificamos
            }
        }
    }
    console.log(`Estado ficha ${ficha} cambiado a ${nuevoEstado}`);
}

function verAprendicesFicha(ficha) {
    localStorage.setItem('filtro_ficha', ficha);
    window.location.href = 'admin-aprendices.html';
}

function editarFicha(id) {
    alert(`Función de edición en desarrollo para ficha: ${id}`);
}

function eliminarFicha(id) {
    if (confirm('¿Está seguro de eliminar esta ficha?')) {
        alert(`Función de eliminación en desarrollo para ficha: ${id}`);
    }
}

function guardarFicha(event) {
    event.preventDefault();

    const nuevaFicha = {
        numero_ficha: document.getElementById('numeroFicha').value,
        nombre_programa: document.getElementById('programa') ? document.getElementById('programa').value :
            (document.getElementById('programaFicha') ? document.getElementById('programaFicha').value : 'N/A'),
        estado: document.getElementById('estadoFicha') ? document.getElementById('estadoFicha').value : 'Activa'
    };

    todasFichas.push(nuevaFicha);
    fichasFiltradas = todasFichas;

    alert('✅ Ficha guardada exitosamente');
    cerrarModal();
    paginaActual = 1;
    mostrarFichas(fichasFiltradas);
}

function cerrarModal() {
    const modal = document.getElementById('modalFicha');
    if (modal) modal.style.display = 'none';
}

