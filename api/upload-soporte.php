<?php
/**
 * API: Upload de Soporte PDF
 * Maneja la carga de archivos PDF de excusas médicas o soportes
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        echo json_encode(['success' => false, 'message' => 'Método no permitido']);
        exit();
    }

    $id_asistencia = $_POST['id_asistencia'] ?? null;
    $id_aprendiz = $_POST['id_aprendiz'] ?? null;
    $fecha = $_POST['fecha'] ?? null;

    if (!isset($_FILES['archivo'])) {
        echo json_encode(['success' => false, 'message' => 'No se recibió ningún archivo']);
        exit();
    }

    $archivo = $_FILES['archivo'];

    // Validar tipo de archivo
    $extension = strtolower(pathinfo($archivo['name'], PATHINFO_EXTENSION));
    if ($extension !== 'pdf') {
        echo json_encode(['success' => false, 'message' => 'Solo se permiten archivos PDF']);
        exit();
    }

    // Validar tamaño (máximo 5MB)
    if ($archivo['size'] > 5 * 1024 * 1024) {
        echo json_encode(['success' => false, 'message' => 'El archivo no debe superar 5MB']);
        exit();
    }

    // Crear directorio si no existe
    $upload_dir = __DIR__ . '/../uploads/soportes/';
    if (!is_dir($upload_dir)) {
        mkdir($upload_dir, 0755, true);
    }

    // Generar nombre único para el archivo
    $nombre_archivo = 'soporte_' . $id_aprendiz . '_' . date('Ymd_His') . '.pdf';
    $ruta_destino = $upload_dir . $nombre_archivo;
    $ruta_relativa = 'uploads/soportes/' . $nombre_archivo;

    // Mover archivo
    if (!move_uploaded_file($archivo['tmp_name'], $ruta_destino)) {
        echo json_encode(['success' => false, 'message' => 'Error al guardar el archivo']);
        exit();
    }

    // Actualizar base de datos
    $db = new SQLite3(__DIR__ . '/../database/Asistnet.db');

    if ($id_asistencia) {
        // Actualizar registro existente
        $stmt = $db->prepare('UPDATE asistencias SET archivo_soporte = :archivo WHERE id_asistencia = :id');
        $stmt->bindValue(':archivo', $ruta_relativa, SQLITE3_TEXT);
        $stmt->bindValue(':id', $id_asistencia, SQLITE3_INTEGER);
        $stmt->execute();
    } else {
        // Si no hay id_asistencia, solo guardamos el archivo
        // El archivo se asociará cuando se guarde la asistencia
    }

    echo json_encode([
        'success' => true,
        'message' => 'Archivo subido correctamente',
        'archivo' => $ruta_relativa,
        'nombre_archivo' => $nombre_archivo
    ]);

    $db->close();
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error al subir archivo: ' . $e->getMessage()
    ]);
}
?>
