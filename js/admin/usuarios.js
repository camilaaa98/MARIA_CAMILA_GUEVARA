/**
 * Gestión de Usuarios
 */

let todosUsuarios = [];
let contadorId = 1;

document.addEventListener('DOMContentLoaded', () => {
    cargarUsuarios();
});

async function cargarUsuarios() {
    try {
        const response = await fetch('api/test-usuarios.php');
        const result = await response.json();

        if (result.success) {
            todosUsuarios = result.data;
            contadorId = Math.max(...todosUsuarios.map(u => u.id_usuario || 0)) + 1;
            mostrarUsuarios(todosUsuarios);
        }
    } catch (error) {
        console.error('Error cargando usuarios:', error);
        // Iniciar con array vacío si falla
        todosUsuarios = [];
        mostrarUsuarios(todosUsuarios);
    }
}

function mostrarUsuarios(usuarios) {
    const tbody = document.getElementById('tablaUsuarios');

    if (!usuarios || usuarios.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">No hay usuarios registrados</td></tr>';
        return;
    }

    tbody.innerHTML = usuarios.map(u => `
        <tr>
            <td>${u.nombre || ''} ${u.apellido || ''}</td>
            <td>${u.correo || 'N/A'}</td>
            <td><span class="badge ${u.rol === 'admin' ? 'badge-primary' : 'badge-info'}">${u.rol || 'instructor'}</span></td>
            <td>
                <select onchange="cambiarEstadoUsuario(${u.id_usuario}, this.value)" 
                        style="padding: 4px; border-radius: 4px; border: 1px solid #ddd; color: white; background-color: ${u.estado === 1 ? '#10b981' : '#ef4444'}">
                    <option value="1" ${u.estado === 1 ? 'selected' : ''} style="background: white; color: black;">Activo</option>
                    <option value="0" ${u.estado !== 1 ? 'selected' : ''} style="background: white; color: black;">Inactivo</option>
                </select>
            </td>
        </tr>
    `).join('');
}

function nuevoUsuario() {
    document.getElementById('modalTitle').textContent = 'Nuevo Usuario';
    document.getElementById('formUsuario').reset();
    document.getElementById('modalUsuario').style.display = 'flex';
}

function cerrarModal() {
    document.getElementById('modalUsuario').style.display = 'none';
}

async function guardarUsuario(event) {
    event.preventDefault();

    const nombreCompleto = document.getElementById('nombreCompleto').value.trim();
    const partes = nombreCompleto.split(' ');
    const nombre = partes[0];
    const apellido = partes.slice(1).join(' ') || partes[0];

    const formData = {
        nombre: nombre,
        apellido: apellido,
        correo: document.getElementById('correoUsuario').value,
        password: document.getElementById('contrasenaUsuario').value,
        rol: document.getElementById('rolUsuario').value.toLowerCase(),
        estado: document.getElementById('estadoUsuario').value === 'Activo' ? 1 : 0
    };

    try {
        const response = await fetch('api/usuarios', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        const result = await response.json();

        if (response.ok) {
            alert('✅ Usuario guardado exitosamente en la base de datos');
            cerrarModal();
            cargarUsuarios();
        } else {
            alert('❌ Error: ' + result.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Error al guardar usuario');
    }
}

async function cambiarEstadoUsuario(id, nuevoEstado) {
    const select = event.target;
    select.style.backgroundColor = nuevoEstado == 1 ? '#10b981' : '#ef4444';

    try {
        // Aquí deberíamos llamar a la API para actualizar el estado
        // Por ahora simulamos
        console.log(`Estado usuario ${id} cambiado a ${nuevoEstado}`);

        // TODO: Implementar endpoint UPDATE en API real si es necesario
        // await fetch(`/api/usuarios/${id}`, { method: 'PUT', body: JSON.stringify({ estado: nuevoEstado }) });

    } catch (error) {
        console.error('Error cambiando estado:', error);
        alert('Error al cambiar estado');
    }
}

function exportarUsuarios() {
    if (todosUsuarios.length === 0) {
        alert('No hay datos para exportar');
        return;
    }

    let table = `
        <table border="1">
            <thead>
                <tr style="background-color: #39A900; color: white;">
                    <th>Nombre Completo</th>
                    <th>Documento</th>
                    <th>Correo</th>
                    <th>Teléfono</th>
                    <th>Rol</th>
                    <th>Estado</th>
                </tr>
            </thead>
            <tbody>
    `;

    todosUsuarios.forEach(u => {
        table += `
            <tr>
                <td>${u.nombre} ${u.apellido}</td>
                <td>${u.documento}</td>
                <td>${u.correo}</td>
                <td>${u.celular}</td>
                <td>${u.rol}</td>
                <td>${u.estado}</td>
            </tr>
        `;
    });

    table += '</tbody></table>';

    const blob = new Blob([table], { type: 'application/vnd.ms-excel' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Reporte_Usuarios_${new Date().toISOString().split('T')[0]}.xls`;
    link.click();

    alert('✅ Archivo Excel generado exitosamente');
}
