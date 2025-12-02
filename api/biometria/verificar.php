<?php
/**
 * API: Verificar Biometría de Aprendiz
 * Verifica si un aprendiz tiene biometría registrada
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

try {
    $id_aprendiz = $_GET['id_aprendiz'] ?? null;

    if (!$id_aprendiz) {
        echo json_encode([
            'success' => false,
            'message' => 'ID de aprendiz requerido'
        ]);
        exit();
    }

    $db = new SQLite3(__DIR__ . '/../../database/Asistnet.db');

    $stmt = $db->prepare('
        SELECT id_biometria, fecha_registro, tipo_biometria 
        FROM biometria_aprendices 
        WHERE id_aprendiz = :id_aprendiz
    ');
    $stmt->bindValue(':id_aprendiz', $id_aprendiz, SQLITE3_INTEGER);
    $result = $stmt->execute();
    $row = $result->fetchArray(SQLITE3_ASSOC);

    if ($row) {
        echo json_encode([
            'success' => true,
            'tiene_biometria' => true,
            'fecha_registro' => $row['fecha_registro'],
            'tipo_biometria' => $row['tipo_biometria']
        ]);
    } else {
        echo json_encode([
            'success' => true,
            'tiene_biometria' => false
        ]);
    }

    $db->close();
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error al verificar biometría: ' . $e->getMessage()
    ]);
}
?>
