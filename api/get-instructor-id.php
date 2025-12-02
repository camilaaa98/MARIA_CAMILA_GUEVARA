<?php
header('Content-Type: application/json');
require_once __DIR__ . '/config/Database.php';

try {
    $db = new Database();
    $conn = $db->getConnection();
    
    $id_usuario = $_GET['id_usuario'] ?? null;
    
    if (!$id_usuario) {
        echo json_encode([
            'success' => false,
            'message' => 'ID de usuario requerido'
        ]);
        exit;
    }
    
    // Obtener id_instructor del usuario
    $query = "SELECT id_instructor FROM instructores WHERE id_usuario = ?";
    $stmt = $conn->prepare($query);
    $stmt->execute([$id_usuario]);
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($result) {
        echo json_encode([
            'success' => true,
            'id_instructor' => $result['id_instructor']
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Instructor no encontrado'
        ]);
    }
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>
