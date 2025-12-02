<?php
header('Content-Type: application/json');
require_once __DIR__ . '/config/Database.php';

try {
    $db = new Database();
    $conn = $db->getConnection();
    
    // Verificar si existe la tabla asistencias
    $check = $conn->query("SELECT name FROM sqlite_master WHERE type='table' AND name='asistencias'");
    
    if ($check->fetch()) {
        $query = "SELECT * FROM asistencias ORDER BY fecha DESC LIMIT 50";
        $stmt = $conn->query($query);
        $asistencias = $stmt->fetchAll(PDO::FETCH_ASSOC);
    } else {
        $asistencias = [];
    }
    
    echo json_encode([
        'success' => true,
        'data' => $asistencias,
        'total' => count($asistencias)
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>
