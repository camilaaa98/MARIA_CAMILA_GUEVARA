<?php
/**
 * API: Registrar Biometría de Aprendiz
 * Guarda los descriptores faciales capturados por face-api.js
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Método no permitido']);
    exit();
}

try {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    $id_aprendiz = $data['id_aprendiz'] ?? null;
    $datos_biometricos = $data['datos_biometricos'] ?? null;
    $tipo_biometria = $data['tipo_biometria'] ?? 'facial';
    $registrado_por = $data['registrado_por'] ?? null;

    // Validaciones
    if (!$id_aprendiz || !$datos_biometricos || !$registrado_por) {
        echo json_encode([
            'success' => false,
            'message' => 'Faltan datos requeridos'
        ]);
        exit();
    }

    // Conectar a la base de datos
    $db = new SQLite3(__DIR__ . '/../../database/Asistnet.db');

    // Verificar si ya existe un registro biométrico para este aprendiz
    $stmt = $db->prepare('SELECT id_biometria FROM biometria_aprendices WHERE id_aprendiz = :id_aprendiz');
    $stmt->bindValue(':id_aprendiz', $id_aprendiz, SQLITE3_INTEGER);
    $result = $stmt->execute();
    $existente = $result->fetchArray(SQLITE3_ASSOC);

    if ($existente) {
        // Actualizar registro existente
        $stmt = $db->prepare('
            UPDATE biometria_aprendices 
            SET datos_biometricos = :datos,
                tipo_biometria = :tipo,
                fecha_registro = :fecha,
                registrado_por = :registrado_por
            WHERE id_aprendiz = :id_aprendiz
        ');
        $stmt->bindValue(':datos', json_encode($datos_biometricos), SQLITE3_TEXT);
        $stmt->bindValue(':tipo', $tipo_biometria, SQLITE3_TEXT);
        $stmt->bindValue(':fecha', date('Y-m-d H:i:s'), SQLITE3_TEXT);
        $stmt->bindValue(':registrado_por', $registrado_por, SQLITE3_INTEGER);
        $stmt->bindValue(':id_aprendiz', $id_aprendiz, SQLITE3_INTEGER);
        $stmt->execute();

        echo json_encode([
            'success' => true,
            'message' => 'Biometría actualizada correctamente',
            'id_biometria' => $existente['id_biometria']
        ]);
    } else {
        // Insertar nuevo registro
        $stmt = $db->prepare('
            INSERT INTO biometria_aprendices 
            (id_aprendiz, datos_biometricos, tipo_biometria, fecha_registro, registrado_por)
            VALUES (:id_aprendiz, :datos, :tipo, :fecha, :registrado_por)
        ');
        $stmt->bindValue(':id_aprendiz', $id_aprendiz, SQLITE3_INTEGER);
        $stmt->bindValue(':datos', json_encode($datos_biometricos), SQLITE3_TEXT);
        $stmt->bindValue(':tipo', $tipo_biometria, SQLITE3_TEXT);
        $stmt->bindValue(':fecha', date('Y-m-d H:i:s'), SQLITE3_TEXT);
        $stmt->bindValue(':registrado_por', $registrado_por, SQLITE3_INTEGER);
        $stmt->execute();

        echo json_encode([
            'success' => true,
            'message' => 'Biometría registrada correctamente',
            'id_biometria' => $db->lastInsertRowID()
        ]);
    }

    $db->close();
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error al registrar biometría: ' . $e->getMessage()
    ]);
}
?>
