<?php
header('Content-Type: application/json');
require_once __DIR__ . '/config/Database.php';

try {
    $db = new Database();
    $conn = $db->getConnection();
    
    // Obtener usuarios con rol instructor
    // Si no hay roles definidos aún, traeremos todos para prueba, pero idealmente filtrar por rol
    // Obtener instructores que están en la tabla instructores
    $query = "SELECT i.id_instructor, u.nombre, u.apellido 
              FROM usuarios u 
              JOIN instructores i ON u.id_usuario = i.id_usuario 
              WHERE u.rol = 'instructor' 
              ORDER BY u.apellido, u.nombre";
    $stmt = $conn->query($query);
    $instructores = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Fallback eliminado para mostrar solo datos reales
    if (empty($instructores)) {
        $instructores = [];
    }
    
    echo json_encode([
        'success' => true,
        'data' => $instructores
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>
