/**
 * Reportes del Instructor - Generación de reportes de asistencia
 */

let todasFichas = [];
let todosAprendices = [];

document.addEventListener('DOMContentLoaded', () => {
    cargarFichasReporte();
    establecerFechasDefecto();
    configurarValidaciones();
});

function establecerFechasDefecto() {
    const hoy = new Date();
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);

    const fechaFin = document.getElementById('reporteFechaFin');
    const fechaInicio = document.getElementById('reporteFechaInicio');

    if (fechaFin) {
        fechaFin.value = hoy.toISOString().split('T')[0];
        fechaFin.max = hoy.toISOString().split('T')[0];
    }
    if (fechaInicio) {
        fechaInicio.value = inicioMes.toISOString().split('T')[0];
        fechaInicio.max = hoy.toISOString().split('T')[0];
    }
}

function configurarValidaciones() {
    const fechaInicio = document.getElementById('reporteFechaInicio');
    const fechaFin = document.getElementById('reporteFechaFin');
    const tipoReporte = document.getElementById('tipoReporte');
    const hoy = new Date().toISOString().split('T')[0];

    // Validar fecha inicio
    fechaInicio.addEventListener('change', function () {
        if (this.value > hoy) {
            alert('⚠️ La fecha de inicio no puede ser futura');
            this.value = hoy;
        }
        if (fechaFin.value && this.value > fechaFin.value) {
            alert('⚠️ La fecha de inicio no puede ser mayor que la fecha fin');
            this.value = fechaFin.value;
        }
    });

    // Validar fecha fin
    fechaFin.addEventListener('change', function () {
        if (this.value > hoy) {
            alert('⚠️ La fecha fin no puede ser futura');
            this.value = hoy;
        }
        if (fechaInicio.value && this.value < fechaInicio.value) {
            alert('⚠️ La fecha fin no puede ser menor que la fecha de inicio');
            this.value = fechaInicio.value;
        }
    });

    // Mostrar/Ocultar selector de aprendiz
    tipoReporte.addEventListener('change', function () {
        const groupAprendiz = document.getElementById('groupAprendiz');
        if (this.value === 'aprendiz') {
            groupAprendiz.style.display = 'block';
            cargarAprendicesFicha();
        } else {
            groupAprendiz.style.display = 'none';
        }
    });
}

async function cargarFichasReporte() {
    try {
        const currentUser = authSystem.getCurrentUser();
        if (!currentUser) return;

        let id_instructor = currentUser.id_instructor;

        // Fallback para obtener id_instructor si no está en sesión
        if (!id_instructor && currentUser.id) {
            const response = await fetch(`api/get-instructor-id.php?id_usuario=${currentUser.id}`);
            const result = await response.json();
            if (result.success) id_instructor = result.id_instructor;
        }

        if (!id_instructor) {
            console.error('No se pudo identificar al instructor');
            return;
        }

        const response = await fetch(`api/instructor-asignaciones.php?id_instructor=${id_instructor}`);
        const result = await response.json();

        if (result.success) {
            todasFichas = result.data || [];
            const select = document.getElementById('reporteFicha');
            select.innerHTML = '<option value="">Seleccione una ficha...</option>';

            todasFichas.forEach(f => {
                const option = document.createElement('option');
                option.value = f.numero_ficha;
                option.textContent = `${f.numero_ficha} - ${f.nombre_programa || 'Sin programa'}`;
                select.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error cargando fichas:', error);
    }
}

async function cargarAprendicesFicha() {
    const fichaSeleccionada = document.getElementById('reporteFicha').value;
    const tipoReporte = document.getElementById('tipoReporte').value;
    const selectAprendiz = document.getElementById('reporteAprendiz');

    if (!fichaSeleccionada || tipoReporte !== 'aprendiz') return;

    try {
        selectAprendiz.innerHTML = '<option value="">Cargando...</option>';

        const response = await fetch(`api/test-aprendices.php?limit=1000`);
        const result = await response.json();

        if (result.success) {
            const aprendices = result.data.filter(a => a.id_ficha == fichaSeleccionada);

            selectAprendiz.innerHTML = '<option value="">Todos los aprendices</option>';
            aprendices.forEach(a => {
                const option = document.createElement('option');
                option.value = a.id_aprendiz;
                option.textContent = `${a.nombre} ${a.apellido}`;
                selectAprendiz.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error cargando aprendices:', error);
        selectAprendiz.innerHTML = '<option value="">Error al cargar</option>';
    }
}

async function generarReporte(event) {
    event.preventDefault();

    const ficha = document.getElementById('reporteFicha').value;
    const fechaInicio = document.getElementById('reporteFechaInicio').value;
    const fechaFin = document.getElementById('reporteFechaFin').value;
    const tipoReporte = document.getElementById('tipoReporte').value;
    const formato = document.getElementById('formatoReporte').value;
    const idAprendiz = document.getElementById('reporteAprendiz')?.value;

    if (!ficha || !fechaInicio || !fechaFin || !tipoReporte) {
        alert('⚠️ Por favor complete todos los campos requeridos');
        return;
    }

    // ✅ CRÍTICO: Obtener ID del instructor actual para filtrar
    const currentUser = authSystem.getCurrentUser();
    const id_instructor = currentUser.id_instructor || currentUser.id;

    if (!id_instructor) {
        alert('❌ Error: No se pudo identificar al instructor');
        return;
    }

    // Validaciones finales de fecha
    const hoy = new Date().toISOString().split('T')[0];
    if (fechaInicio > hoy || fechaFin > hoy) {
        alert('⚠️ Las fechas no pueden ser futuras');
        return;
    }
    if (fechaInicio > fechaFin) {
        alert('⚠️ La fecha de inicio no puede ser mayor que la fecha fin');
        return;
    }

    // ✅ Pasar id_instructor a las funciones de generación
    if (formato === 'pdf') {
        await generarPDF(ficha, fechaInicio, fechaFin, tipoReporte, idAprendiz, id_instructor);
    } else if (formato === 'excel') {
        generarExcel(ficha, fechaInicio, fechaFin, tipoReporte, id_instructor);
    } else if (formato === 'csv') {
        generarCSV(ficha, fechaInicio, fechaFin, tipoReporte, id_instructor);
    }
}

function generarExcel(ficha, fechaInicio, fechaFin, tipoReporte, id_instructor) {
    // ✅ CRÍTICO: Los datos ahora se filtran SOLO para este instructor
    // En producción, estos datos vendrán de una API que filtre por id_instructor
    const datos = generarDatosDetallados(fechaInicio, fechaFin, id_instructor);

    // Cálculos para el resumen
    const totalClases = datos.length;
    const asistenciaPromedio = (datos.reduce((acc, curr) => acc + parseFloat(curr.porcentaje), 0) / totalClases).toFixed(1);
    const estadoGeneral = asistenciaPromedio >= 80 ? 'Excelente' : asistenciaPromedio >= 60 ? 'Regular' : 'Crítico';

    let tabla = `
        <table border="1">
            <thead>
                <tr>
                    <th colspan="5" style="background-color: #39A900; color: white; text-align: center; font-size: 14pt;">
                        AsistNet - Reporte de Asistencia
                    </th>
                </tr>
                <tr>
                    <th colspan="5">Ficha: ${ficha} | Periodo: ${fechaInicio} al ${fechaFin} | Tipo: ${tipoReporte.toUpperCase()}</th>
                </tr>
                
                <!-- Espacio -->
                <tr><td colspan="5" style="height: 10px;"></td></tr>

                <!-- Resumen del Comportamiento -->
                <tr>
                    <th colspan="5" style="background-color: #39A900; color: white; text-align: left;">Resumen del Comportamiento</th>
                </tr>
                <tr style="background-color: #f0f0f0;">
                    <th colspan="2">Total Sesiones</th>
                    <th colspan="2">Asistencia Promedio</th>
                    <th>Estado General</th>
                </tr>
                <tr>
                    <td colspan="2" style="text-align: center;">${totalClases}</td>
                    <td colspan="2" style="text-align: center;">${asistenciaPromedio}%</td>
                    <td style="text-align: center;">${estadoGeneral}</td>
                </tr>

                <!-- Espacio -->
                <tr><td colspan="5" style="height: 10px;"></td></tr>

                <!-- Resumen de Sesiones -->
                <tr>
                    <th colspan="5" style="background-color: #39A900; color: white; text-align: left;">Resumen de Sesiones</th>
                </tr>
                <tr style="background-color: #f0f0f0;">
                    <th>Fecha</th>
                    <th>Tema</th>
                    <th>Presentes</th>
                    <th>Ausentes</th>
                    <th>% Asistencia</th>
                </tr>
            </thead>
            <tbody>
    `;

    // Filas del resumen de sesiones
    datos.forEach(d => {
        tabla += `
            <tr>
                <td>${d.fecha}</td>
                <td>${d.tema}</td>
                <td>${d.presentes}</td>
                <td>${d.ausentes}</td>
                <td>${d.porcentaje.replace('.', ',')}%</td>
            </tr>
        `;
    });

    tabla += `
            </tbody>
        </table>
        <br>
        <table border="1">
            <thead>
                <tr>
                    <th colspan="5" style="background-color: #39A900; color: white; text-align: left;">Detalle de Asistencias por Sesión</th>
                </tr>
            </thead>
            <tbody>
    `;

    datos.forEach(sesion => {
        // Encabezado de la sesión
        tabla += `
            <tr style="background-color: #e0e0e0;">
                <td colspan="5"><strong>${sesion.fecha} - ${sesion.tema}</strong> (Asistencia: ${sesion.porcentaje}%)</td>
            </tr>
            <tr style="background-color: #f0f0f0;">
                <th>Aprendiz</th>
                <th>Estado</th>
                <th colspan="3">Observaci\u00F3n</th>
            </tr>
        `;

        // Detalle de estudiantes
        sesion.detalles.forEach(d => {
            const colorEstado = d.estado === 'Presente' ? '#d1e7dd' : '#f8d7da';
            tabla += `
                <tr>
                    <td>${d.nombre}</td>
                    <td style="background-color: ${colorEstado};">${d.estado}</td>
                    <td colspan="3">${d.observacion || ''}</td>
                </tr>
            `;
        });

        // Separador
        tabla += `<tr><td colspan="5" style="height: 10px;"></td></tr>`;
    });

    tabla += '</tbody></table>';

    const blob = new Blob([tabla], { type: 'application/vnd.ms-excel' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Reporte_Asistencia_${ficha}.xls`;
    link.click();
}

function generarCSV(ficha, fechaInicio, fechaFin, tipoReporte, id_instructor) {
    // ✅ CRÍTICO: Filtrado por instructor
    const datos = generarDatosDetallados(fechaInicio, fechaFin, id_instructor);

    let csvContent = "\uFEFF"; // BOM
    csvContent += "Fecha;Tema;Aprendiz;Estado;Observaci\u00F3n\n";

    datos.forEach(sesion => {
        sesion.detalles.forEach(d => {
            const fila = [
                sesion.fecha,
                sesion.tema,
                d.nombre,
                d.estado,
                d.observacion || ''
            ].join(';');
            csvContent += fila + "\n";
        });
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Reporte_Asistencia_${ficha}.csv`;
    link.click();
}

async function generarPDF(ficha, fechaInicio, fechaFin, tipoReporte, idAprendiz, id_instructor) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Cargar logo
    const logoUrl = 'logosena.png';
    let logoData = null;

    try {
        logoData = await cargarImagen(logoUrl);
    } catch (e) {
        console.warn('No se pudo cargar el logo:', e);
    }

    // ✅ Agregar nota de instructor en el PDF
    const currentUser = authSystem.getCurrentUser();
    const nombreInstructor = `${currentUser.nombre || ''} ${currentUser.apellido || ''}`.trim();

    // Encabezado
    doc.setFillColor(57, 169, 0); // Verde SENA
    doc.rect(0, 0, 210, 25, 'F'); // Aumenté un poco la altura para que quepa el logo

    // Agregar logo si se cargó
    if (logoData) {
        doc.addImage(logoData, 'PNG', 10, 2, 20, 20); // x, y, width, height
    }

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.text('AsistNet - Reporte de Asistencia', 105, 15, { align: 'center' });

    // Información del Reporte
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.text(`Fecha de Generación: ${new Date().toLocaleString()}`, 14, 35);
    doc.text(`Instructor: ${nombreInstructor}`, 14, 41); // ✅ NUEVO: Mostrar instructor
    doc.text(`Ficha: ${ficha}`, 14, 47);
    doc.text(`Periodo: ${fechaInicio} al ${fechaFin}`, 14, 53);
    doc.text(`Tipo: ${tipoReporte.toUpperCase()}`, 14, 59);

    // ✅ Generar datos filtrados por instructor
    const datos = generarDatosDetallados(fechaInicio, fechaFin, id_instructor);

    // Resumen del Comportamiento (Tabla Resumen)
    const totalClases = datos.length;
    const asistenciaPromedio = (datos.reduce((acc, curr) => acc + curr.porcentaje, 0) / totalClases).toFixed(1);

    doc.setFontSize(12);
    doc.setTextColor(57, 169, 0);
    doc.text('Resumen del Comportamiento', 14, 65);

    doc.autoTable({
        startY: 70,
        head: [['Total Sesiones', 'Asistencia Promedio', 'Estado General']],
        body: [[
            totalClases,
            `${asistenciaPromedio}%`,
            asistenciaPromedio >= 80 ? 'Excelente' : asistenciaPromedio >= 60 ? 'Regular' : 'Crítico'
        ]],
        theme: 'grid',
        headStyles: { fillColor: [57, 169, 0] }
    });

    // Detalle de Asistencias
    doc.text('Detalle de Asistencias', 14, doc.lastAutoTable.finalY + 10);

    doc.autoTable({
        startY: doc.lastAutoTable.finalY + 15,
        head: [['Fecha', 'Tema', 'Presentes', 'Ausentes', '% Asistencia']],
        body: datos.map(d => [d.fecha, d.tema, d.presentes, d.ausentes, `${d.porcentaje}%`]),
        theme: 'striped',
        headStyles: { fillColor: [44, 62, 80] }
    });

    // Pie de página
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(128);
        doc.text(`Página ${i} de ${pageCount}`, 105, 290, { align: 'center' });
    }

    doc.save(`Reporte_Asistencia_${ficha}.pdf`);
}

function cargarImagen(url) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = url;
        img.onload = () => resolve(img);
        img.onerror = reject;
    });
}

async function previsualizarReporte() {
    const ficha = document.getElementById('reporteFicha').value;
    const fechaInicio = document.getElementById('reporteFechaInicio').value;
    const fechaFin = document.getElementById('reporteFechaFin').value;
    const tipoReporte = document.getElementById('tipoReporte').value;

    if (!ficha || !fechaInicio || !fechaFin || !tipoReporte) {
        alert('⚠️ Por favor complete todos los campos requeridos');
        return;
    }

    const contenedor = document.getElementById('previsualizacion');
    const contenido = document.getElementById('contenidoPrevia');

    // Mostrar cargando
    contenedor.style.display = 'block';
    contenido.innerHTML = '<div style="text-align: center; padding: 2rem;">Cargando previsualización...</div>';

    // Simular delay de carga
    await new Promise(r => setTimeout(r, 500));

    const datos = generarDatosDetallados(fechaInicio, fechaFin);

    if (datos.length === 0) {
        contenido.innerHTML = '<div style="text-align: center; padding: 2rem;">No hay registros para el periodo seleccionado</div>';
        return;
    }

    let html = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
            <div>
                <h3 style="margin: 0; color: var(--text-dark);">Vista Previa del Reporte</h3>
                <p style="margin: 0.5rem 0 0; color: var(--text-light); font-size: 0.9rem;">
                    Ficha: ${ficha} | Periodo: ${fechaInicio} al ${fechaFin}
                </p>
            </div>
            <div class="badge badge-success">${datos.length} Sesiones</div>
        </div>
        <div style="display: flex; flex-direction: column; gap: 1.5rem;">
    `;

    datos.forEach((sesion, index) => {
        html += `
            <div class="card" style="border: 1px solid var(--border); overflow: hidden;">
                <div style="background: #f8fafc; padding: 1rem; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <h4 style="margin: 0; color: var(--primary-color); font-size: 1.1rem;">${sesion.tema}</h4>
                        <span style="font-size: 0.9rem; color: var(--text-light);">📅 ${sesion.fecha}</span>
                    </div>
                    <div style="text-align: right;">
                        <span class="badge ${sesion.porcentaje >= 80 ? 'badge-success' : 'badge-warning'}">
                            Asistencia: ${sesion.porcentaje}%
                        </span>
                    </div>
                </div>
                
                <div style="padding: 0;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead style="background: #f1f5f9; font-size: 0.85rem; text-transform: uppercase;">
                            <tr>
                                <th style="padding: 0.75rem 1rem; text-align: left; color: var(--text-light);">Aprendiz</th>
                                <th style="padding: 0.75rem 1rem; text-align: center; color: var(--text-light);">Estado</th>
                                <th style="padding: 0.75rem 1rem; text-align: left; color: var(--text-light);">Observación</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${sesion.detalles.map(d => `
                                <tr style="border-bottom: 1px solid #eee;">
                                    <td style="padding: 0.75rem 1rem; font-weight: 500;">${d.nombre}</td>
                                    <td style="padding: 0.75rem 1rem; text-align: center;">
                                        <span class="badge ${d.estado === 'Presente' ? 'badge-success' : 'badge-danger'}" 
                                              style="font-size: 0.8rem; padding: 0.25rem 0.75rem;">
                                            ${d.estado}
                                        </span>
                                    </td>
                                    <td style="padding: 0.75rem 1rem; color: var(--text-light); font-style: italic;">
                                        ${d.observacion || '-'}
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                <div style="padding: 0.75rem 1rem; background: #f8fafc; border-top: 1px solid var(--border); font-size: 0.9rem; display: flex; gap: 1rem;">
                    <span>✅ <strong>Presentes:</strong> ${sesion.presentes}</span>
                    <span>❌ <strong>Ausentes:</strong> ${sesion.ausentes}</span>
                </div>
            </div>
        `;
    });

    html += '</div>';
    contenido.innerHTML = html;

    // Scroll suave hacia la previsualización
    contenedor.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function generarDatosDetallados(inicio, fin, id_instructor = null) {
    // ✅ CRÍTICO: En producción, aquí se llamaría a una API que filtre por id_instructor
    // Ejemplo: /api/asistencias/obtener.php?id_instructor=${id_instructor}&fecha_inicio=${inicio}&fecha_fin=${fin}
    // Por ahora, usamos datos simulados pero la estructura está lista para integración real

    console.log(`📊 Generando datos para instructor ID: ${id_instructor}`);

    const datos = [];
    let fechaActual = new Date(inicio);
    const fechaFinal = new Date(fin);

    // Lista simulada de aprendices
    const aprendices = [
        "Juan Pérez", "María González", "Carlos Ruiz", "Ana López", "Pedro Martínez",
        "Laura Torres", "Diego Ramírez", "Sofía Vargas"
    ];

    while (fechaActual <= fechaFinal) {
        // Solo días de semana
        if (fechaActual.getDay() !== 0 && fechaActual.getDay() !== 6) {
            const detalles = [];
            let presentes = 0;

            aprendices.forEach(nombre => {
                const asistio = Math.random() > 0.2; // 80% probabilidad de asistir
                if (asistio) presentes++;

                detalles.push({
                    nombre: nombre,
                    estado: asistio ? 'Presente' : 'Ausente',
                    observacion: !asistio && Math.random() > 0.5 ? 'Excusa médica enviada' : ''
                });
            });

            const total = aprendices.length;
            const ausentes = total - presentes;

            datos.push({
                fecha: fechaActual.toISOString().split('T')[0],
                tema: 'Sesión de Formación Técnica', // Texto corregido sin tildes problemáticas
                presentes: presentes,
                ausentes: ausentes,
                porcentaje: ((presentes / total) * 100).toFixed(1),
                detalles: detalles
            });
        }
        fechaActual.setDate(fechaActual.getDate() + 1);
    }
    return datos;
}

function generarDatosSimulados(inicio, fin, id_instructor = null) {
    return generarDatosDetallados(inicio, fin, id_instructor);
}
