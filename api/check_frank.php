<?php
header('Content-Type: application/json');
require_once __DIR__ . '/config/Database.php';

try {
    $db = new Database();
    $conn = $db->getConnection();
    
    // Verificar si el usuario fue creado
    $sql = "SELECT * FROM usuarios WHERE correo = 'frank@sena.edu.co'";
    $stmt = $conn->query($sql);
    $usuario = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$usuario) {
        echo json_encode(['success' => false, 'message' => 'Usuario no encontrado en usuarios']);
        exit;
    }
    
    // Verificar si está en instructores
    $sql2 = "SELECT * FROM instructores WHERE id_usuario = ?";
    $stmt2 = $conn->prepare($sql2);
    $stmt2->execute([$usuario['id_usuario']]);
    $instructor = $stmt2->fetch(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true,
        'usuario' => $usuario,
        'instructor' => $instructor,
        'esta_en_instructores' => $instructor !== false
    ], JSON_PRETTY_PRINT);
    
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
