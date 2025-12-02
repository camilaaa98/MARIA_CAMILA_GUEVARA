/**
 * Dashboard del Instructor - Carga datos de la BD
 */

document.addEventListener('DOMContentLoaded', () => {
    mostrarInformacionUsuario();
    cargarEstadisticas();
    cargarActividadReciente();
});

function mostrarInformacionUsuario() {
    const currentUser = authSystem.getCurrentUser();
    if (currentUser && currentUser.name) {
        const sidebarSubtitle = document.querySelector('.sidebar-subtitle');
        if (sidebarSubtitle) {
            sidebarSubtitle.textContent = currentUser.name;
            // Add title attribute for full name on hover if it's too long
            sidebarSubtitle.title = currentUser.name;
        }
    }
}

async function cargarEstadisticas() {
    try {
        // Obtener usuario actual
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
            document.querySelector('.stat-value').textContent = '0';
            document.querySelectorAll('.stat-value')[2].textContent = '0';
            return;
        }

        // Obtener fichas asignadas desde la base de datos
        const responseFichas = await fetch(`api/instructor-asignaciones.php?id_instructor=${id_instructor}`);
        const resultFichas = await responseFichas.json();

        if (resultFichas.success) {
            const fichasAsignadas = resultFichas.data || [];

            // Actualizar contador de fichas
            document.querySelector('.stat-value').textContent = fichasAsignadas.length;

            // Cargar aprendices
            const responseAprendices = await fetch('api/test-aprendices.php?limit=1000');
            const resultAprendices = await responseAprendices.json();

            if (resultAprendices.success) {
                // Obtener IDs de fichas asignadas (usar numero_ficha para comparar)
                const numerosFichasAsignadas = fichasAsignadas.map(f => f.numero_ficha);

                // Filtrar aprendices que pertenecen a las fichas asignadas
                const aprendicesAsignados = resultAprendices.data.filter(a => numerosFichasAsignadas.includes(a.id_ficha));

                document.querySelectorAll('.stat-value')[2].textContent = aprendicesAsignados.length;
            }

            // NUEVO: Obtener porcentaje de asistencia de hoy
            try {
                const responseAsistenciaHoy = await fetch(`api/asistencia-hoy.php?id_instructor=${id_instructor}`);
                const resultAsistenciaHoy = await responseAsistenciaHoy.json();

                if (resultAsistenciaHoy.data) {
                    const porcentaje = resultAsistenciaHoy.data.porcentaje || 0;
                    document.querySelectorAll('.stat-value')[1].textContent = porcentaje + '%';
                } else {
                    document.querySelectorAll('.stat-value')[1].textContent = '0%';
                }
            } catch (error) {
                console.error('Error al obtener asistencia de hoy:', error);
                document.querySelectorAll('.stat-value')[1].textContent = '0%';
            }
        } else {
            console.error('Error al cargar fichas:', resultFichas.message);
            document.querySelector('.stat-value').textContent = '0';
            document.querySelectorAll('.stat-value')[2].textContent = '0';
        }
    } catch (error) {
        console.error('Error cargando estadísticas:', error);
        // Mostrar 0 si falla
        document.querySelector('.stat-value').textContent = '0';
        document.querySelectorAll('.stat-value')[2].textContent = '0';
    }
}

async function cargarActividadReciente() {
    const tbody = document.getElementById('tablaActividadReciente');

    // Datos vacíos por defecto
    const actividadMock = [];

    tbody.innerHTML = actividadMock.map(a => {
        const porcentaje = ((a.presentes / a.total) * 100).toFixed(1);
        const colorPorcentaje = porcentaje >= 90 ? '#10b981' : porcentaje >= 75 ? '#f59e0b' : '#ef4444';

        return `
            <tr>
                <td>${a.fecha}</td>
                <td><span class="badge badge-info">${a.ficha}</span></td>
                <td style="color: #10b981; font-weight: bold;">${a.presentes}</td>
                <td style="color: #ef4444; font-weight: bold;">${a.ausentes}</td>
                <td>${a.total}</td>
                <td style="color: ${colorPorcentaje}; font-weight: bold;">${porcentaje}%</td>
            </tr>
        `;
    }).join('');
}
