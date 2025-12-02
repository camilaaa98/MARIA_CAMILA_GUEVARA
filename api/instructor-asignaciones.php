<?php
header('Content-Type: application/json');
require_once __DIR__ . '/config/Database.php';

try {
    $db = new Database();
    $conn = $db->getConnection();
    
    // Obtener el instructor actual desde la sesión o parámetro
    $id_instructor = $_GET['id_instructor'] ?? null;
    
    if (!$id_instructor) {
        echo json_encode([
            'success' => false,
            'message' => 'ID de instructor requerido'
        ]);
        exit;
    }
    
    // Obtener fichas asignadas al instructor
    $query = "SELECT DISTINCT f.* 
              FROM fichas f
              JOIN asignaciones_instructor_ficha a ON f.id_ficha = a.id_ficha
              WHERE a.id_instructor = ?
              ORDER BY f.numero_ficha";
    
    $stmt = $conn->prepare($query);
    $stmt->execute([$id_instructor]);
    $fichas = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true,
        'data' => $fichas
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>
