<?php
header('Content-Type: application/json');
require_once __DIR__ . '/config/Database.php';

try {
    $db = new Database();
    $conn = $db->getConnection();
    
    // Obtener todas las fichas con sus instructores asignados
    $query = "SELECT f.*, 
                     GROUP_CONCAT(i.nombres || ' ' || i.apellidos, ', ') as instructores_nombres
              FROM fichas f
              LEFT JOIN asignaciones_instructor_ficha a ON f.id_ficha = a.id_ficha
              LEFT JOIN instructores i ON a.id_instructor = i.id_instructor
              GROUP BY f.numero_ficha, f.id_ficha, f.nombre_programa, f.jornada, f.estado
              ORDER BY f.numero_ficha";
    $stmt = $conn->query($query);
    $fichas = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true,
        'data' => $fichas,
        'total' => count($fichas)
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>
