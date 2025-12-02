<?php
// Crear tabla para asignaciones instructor-ficha
header('Content-Type: application/json');
require_once __DIR__ . '/config/Database.php';

try {
    $db = new Database();
    $conn = $db->getConnection();
    
    $sql = "CREATE TABLE IF NOT EXISTS asignaciones_instructor_ficha (
        id_asignacion INTEGER PRIMARY KEY AUTOINCREMENT,
        id_ficha INTEGER NOT NULL,
        id_instructor INTEGER NOT NULL,
        fecha_asignacion TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (id_ficha) REFERENCES fichas(id_ficha),
        FOREIGN KEY (id_instructor) REFERENCES instructores(id_instructor),
        UNIQUE(id_ficha, id_instructor)
    )";
    
    $conn->exec($sql);
    
    echo json_encode(['success' => true, 'message' => 'Tabla creada']);
    
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>
