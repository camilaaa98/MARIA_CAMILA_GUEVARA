<?php
/**
 * API: Listar Aprendices con Estado de Biometría por Ficha
 * Retorna lista de aprendices indicando si tienen biometría registrada
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

try {
    $numero_ficha = $_GET['numero_ficha'] ?? null;

    if (!$numero_ficha) {
        echo json_encode([
            'success' => false,
            'message' => 'Número de ficha requerido'
        ]);
        exit();
    }

    $db = new SQLite3(__DIR__ . '/../../database/Asistnet.db');

    // Obtener id_ficha
    $stmt = $db->prepare('SELECT id_ficha FROM fichas WHERE numero_ficha = :numero');
    $stmt->bindValue(':numero', $numero_ficha, SQLITE3_INTEGER);
    $result = $stmt->execute();
    $ficha = $result->fetchArray(SQLITE3_ASSOC);

    if (!$ficha) {
        echo json_encode([
            'success' => false,
            'message' => 'Ficha no encontrada'
        ]);
        exit();
    }

    // Obtener aprendices con información de biometría
    $stmt = $db->prepare('
        SELECT 
            a.id_aprendiz,
            a.nombre,
            a.apellido,
            a.documento,
            CASE WHEN b.id_biometria IS NOT NULL THEN 1 ELSE 0 END as tiene_biometria,
            b.fecha_registro
        FROM aprendices a
        LEFT JOIN biometria_aprendices b ON a.id_aprendiz = b.id_aprendiz
        WHERE a.id_ficha = :id_ficha
        ORDER BY a.apellido, a.nombre
    ');
    $stmt->bindValue(':id_ficha', $ficha['id_ficha'], SQLITE3_INTEGER);
    $result = $stmt->execute();

    $aprendices = [];
    while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
        $aprendices[] = [
            'id_aprendiz' => $row['id_aprendiz'],
            'nombre' => $row['nombre'],
            'apellido' => $row['apellido'],
            'documento' => $row['documento'],
            'tiene_biometria' => (bool)$row['tiene_biometria'],
            'fecha_registro' => $row['fecha_registro']
        ];
    }

    echo json_encode([
        'success' => true,
        'data' => $aprendices
    ]);

    $db->close();
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error al listar aprendices: ' . $e->getMessage()
    ]);
}
?>
