/**
 * Registrar Asistencia - Con Sistema Biométrico Integrado
 */

let todasFichas = [];
let todosAprendices = [];
let aprendicesBiometria = {}; // Cache de estado biometrico
let archivosSoporte = {}; // Cache de archivos subidos

document.addEventListener('DOMContentLoaded', () => {
    cargarFichas();
    establecerFechaHoy();
});

function establecerFechaHoy() {
    const hoy = new Date().toISOString().split('T')[0];
    document.getElementById('fechaAsistencia').value = hoy;
    document.getElementById('fechaAsistencia').max = hoy; // No permitir fechas futuras
}

async function cargarFichas() {
    try {
        const currentUser = authSystem.getCurrentUser();

        if (!currentUser) {
            console.error('No hay usuario autenticado');
            return;
        }

        let id_instructor = currentUser.id_instructor;

        // Si no tiene id_instructor, intentar obtenerlo
        if (!id_instructor && currentUser.id) {
            console.log('Buscando id_instructor para el usuario...');
            const response = await fetch(`api/get-instructor-id.php?id_usuario=${currentUser.id}`);
            const result = await response.json();

            if (result.success && result.id_instructor) {
                id_instructor = result.id_instructor;
                // Actualizar localStorage
                currentUser.id_instructor = id_instructor;
                localStorage.setItem('asistnet_user', JSON.stringify(currentUser));
                console.log('id_instructor actualizado:', id_instructor);
            }
        }

        if (!id_instructor) {
            console.error('No se pudo obtener id_instructor');
            const select = document.getElementById('fichaSeleccionada');
            select.innerHTML = '<option value="">Error: No se pudo identificar al instructor</option>';
            return;
        }

        // Obtener fichas asignadas al instructor desde la base de datos
        const response = await fetch(`api/instructor-asignaciones.php?id_instructor=${id_instructor}`);
        const result = await response.json();

        if (result.success) {
            todasFichas = result.data || [];

            const select = document.getElementById('fichaSeleccionada');

            select.innerHTML = '<option value="">Seleccione una ficha...</option>';
            todasFichas.forEach(f => {
                const option = document.createElement('option');
                option.value = f.numero_ficha;
                option.textContent = `${f.numero_ficha} - ${f.nombre_programa || 'Sin programa'}`;
                select.appendChild(option);
            });
        } else {
            console.error('Error al cargar fichas:', result.message);
            const select = document.getElementById('fichaSeleccionada');
            select.innerHTML = '<option value="">No hay fichas asignadas</option>';
        }
    } catch (error) {
        console.error('Error cargando fichas:', error);
        const select = document.getElementById('fichaSeleccionada');
        select.innerHTML = '<option value="">Error al cargar fichas</option>';
    }
}

/**
 * Cargar aprendices y verificar estado biométrico
 */
async function cargarAprendices() {
    const fichaSeleccionada = document.getElementById('fichaSeleccionada').value;
    const contenedor = document.getElementById('contenedorAsistencia');
    const tbody = document.getElementById('tablaAsistenciaAprendices');

    if (!fichaSeleccionada) {
        contenedor.style.display = 'none';
        return;
    }

    try {
        // Cargar aprendices
        const response = await fetch(`api/test-aprendices.php?limit=1000`);
        const result = await response.json();

        if (result.success) {
            todosAprendices = result.data.filter(a => a.id_ficha == fichaSeleccionada);

            if (todosAprendices.length === 0) {
                tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">No hay aprendices en esta ficha</td></tr>';
                contenedor.style.display = 'block';
                return;
            }

            // Verificar estado biométrico de cada aprendiz
            await verificarEstadoBiometrico(todosAprendices);

            // Renderizar tabla
            renderizarTablaAsistencia();

            contenedor.style.display = 'block';
        }
    } catch (error) {
        console.error('Error cargando aprendices:', error);
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">Error al cargar aprendices</td></tr>';
        contenedor.style.display = 'block';
    }
}

/**
 * Verificar qué aprendices tienen biometría registrada
 */
async function verificarEstadoBiometrico(aprendices) {
    aprendicesBiometria = {};

    for (const aprendiz of aprendices) {
        try {
            const response = await fetch(`api/biometria/verificar.php?id_aprendiz=${aprendiz.id_aprendiz}`);
            const result = await response.json();

            if (result.success) {
                aprendicesBiometria[aprendiz.id_aprendiz] = {
                    tiene_biometria: result.tiene_biometria,
                    fecha_registro: result.fecha_registro || null
                };
            }
        } catch (error) {
            console.error(`Error verificando biometría de ${aprendiz.id_aprendiz}:`, error);
            aprendicesBiometria[aprendiz.id_aprendiz] = { tiene_biometria: false };
        }
    }
}

/**
 * Renderizar tabla de asistencia con columnas de biometría y soporte
 */
function renderizarTablaAsistencia() {
    const tbody = document.getElementById('tablaAsistenciaAprendices');

    tbody.innerHTML = todosAprendices.map((aprendiz, index) => {
        const biometria = aprendicesBiometria[aprendiz.id_aprendiz] || { tiene_biometria: false };

        // HTML del botón/ícono de biometría
        const biometriaHTML = biometria.tiene_biometria
            ? `<span title="Biometría registrada el ${biometria.fecha_registro}" 
                     style="font-size: 1.5rem; color: #10B981; cursor: help;">
                    📷
               </span>`
            : `<button onclick='mostrarModalBiometria(${JSON.stringify(aprendiz)})' 
                       class="btn btn-sm" 
                       style="background: #3B82F6; color: white; font-size: 0.85rem; padding: 0.4rem 1rem;">
                    Registro
               </button>`;

        return `
            <tr>
                <td>${index + 1}</td>
                <td>${aprendiz.nombre} ${aprendiz.apellido}</td>
                <td>${aprendiz.documento}</td>
                <td style="text-align: center;">
                    ${biometriaHTML}
                </td>
                <td style="text-align: center;">
                    <label class="checkbox-container">
                        <input type="checkbox" id="asistencia_${aprendiz.id_aprendiz}" checked>
                        <span class="checkmark"></span>
                    </label>
                </td>
                <td>
                    <input type="text" id="observacion_${aprendiz.id_aprendiz}" placeholder="Observaciones..." 
                           style="width: 100%; padding: 0.5rem; border: 1px solid var(--border); border-radius: 6px;">
                </td>
                <td style="text-align: center;">
                    <input type="file" accept=".pdf" 
                           id="soporte_${aprendiz.id_aprendiz}"
                           onchange="manejarSoporte(this, ${aprendiz.id_aprendiz})" 
                           style="font-size: 0.8rem; max-width: 150px;">
                    <span id="soporte_status_${aprendiz.id_aprendiz}" style="font-size: 0.8rem; color: #10B981;"></span>
                </td>
            </tr>
        `;
    }).join('');
}

/**
 * Manejar carga de archivo de soporte
 */
async function manejarSoporte(input, id_aprendiz) {
    const archivo = input.files[0];

    if (!archivo) return;

    // Validar formato PDF
    if (archivo.type !== 'application/pdf') {
        alert('⚠️ Solo se permiten archivos PDF');
        input.value = '';
        return;
    }

    // Validar tamaño (5MB)
    if (archivo.size > 5 * 1024 * 1024) {
        alert('⚠️ El archivo no debe superar 5MB');
        input.value = '';
        return;
    }

    // Guardar temporalmente en cache
    archivosSoporte[id_aprendiz] = archivo;

    // Mostrar estado
    const statusSpan = document.getElementById(`soporte_status_${id_aprendiz}`);
    statusSpan.textContent = '✓ Listo para subir';
    statusSpan.style.color = '#10B981';
}

/**
 * Subir soporte a servidor
 */
async function subirSoporte(id_aprendiz, archivo) {
    const formData = new FormData();
    formData.append('archivo', archivo);
    formData.append('id_aprendiz', id_aprendiz);

    try {
        const response = await fetch('api/upload-soporte.php', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        if (result.success) {
            console.log(`✅ Soporte subido para aprendiz ${id_aprendiz}:`, result.archivo);
            return result.archivo; // Ruta del archivo
        } else {
            console.error(`Error subiendo soporte: ${result.message}`);
            return null;
        }
    } catch (error) {
        console.error('Error en upload:', error);
        return null;
    }
}

function marcarTodos(estado) {
    const checkboxes = document.querySelectorAll('input[type="checkbox"][id^="asistencia_"]');
    checkboxes.forEach(checkbox => {
        checkbox.checked = estado;
    });
}

/**
 * Guardar asistencia (modificado para incluir soportes)
 */
async function guardarAsistencia() {
    const fichaSeleccionada = document.getElementById('fichaSeleccionada').value;
    const fechaAsistencia = document.getElementById('fechaAsistencia').value;

    if (!fichaSeleccionada || !fechaAsistencia) {
        alert('⚠️ Por favor seleccione una ficha y una fecha');
        return;
    }

    // Validar que la fecha no sea futura
    const hoy = new Date().toISOString().split('T')[0];
    if (fechaAsistencia > hoy) {
        alert('⚠️ No puede registrar asistencia para fechas futuras');
        return;
    }

    // Primero, subir todos los soportes pendientes
    const soportesSubidos = {};
    for (const id_aprendiz in archivosSoporte) {
        const archivo = archivosSoporte[id_aprendiz];
        const rutaArchivo = await subirSoporte(id_aprendiz, archivo);
        if (rutaArchivo) {
            soportesSubidos[id_aprendiz] = rutaArchivo;
        }
    }

    const registros = todosAprendices.map(aprendiz => ({
        id: aprendiz.id_aprendiz,
        nombre: `${aprendiz.nombre} ${aprendiz.apellido}`,
        presente: document.getElementById(`asistencia_${aprendiz.id_aprendiz}`)?.checked || false,
        observacion: document.getElementById(`observacion_${aprendiz.id_aprendiz}`)?.value || '',
        soporte: soportesSubidos[aprendiz.id_aprendiz] || null
    }));

    const presentes = registros.filter(r => r.presente).length;
    const ausentes = registros.filter(r => !r.presente).length;
    const porcentaje = ((presentes / registros.length) * 100).toFixed(1);

    console.log('Guardando asistencia:', {
        ficha: fichaSeleccionada,
        fecha: fechaAsistencia,
        presentes,
        ausentes,
        porcentaje,
        registros
    });

    alert(`✅ Asistencia guardada exitosamente\n\nFicha: ${fichaSeleccionada}\nFecha: ${fechaAsistencia}\nPresentes: ${presentes}\nAusentes: ${ausentes}\nPorcentaje: ${porcentaje}%`);

    // Limpiar formulario
    document.getElementById('fichaSeleccionada').value = '';
    document.getElementById('contenedorAsistencia').style.display = 'none';
    archivosSoporte = {}; // Limpiar cache de soportes
    establecerFechaHoy();
}

function cancelarAsistencia() {
    if (confirm('¿Está seguro de cancelar el registro de asistencia?')) {
        document.getElementById('fichaSeleccionada').value = '';
        document.getElementById('contenedorAsistencia').style.display = 'none';
        archivosSoporte = {}; // Limpiar cache
        establecerFechaHoy();
    }
}
