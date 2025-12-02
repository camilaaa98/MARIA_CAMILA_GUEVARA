<?php
require_once __DIR__ . '/config/Database.php';
$db = new Database();
$conn = $db->getConnection();

echo "=== DIAGNÓSTICO DE CAMILA ===\n\n";

// 1. Buscar a Camila en usuarios
$stmt = $conn->query("SELECT * FROM usuarios WHERE correo LIKE '%camila%'");
$camila_user = $stmt->fetch(PDO::FETCH_ASSOC);

if ($camila_user) {
    echo "Usuario encontrado:\n";
    print_r($camila_user);
    echo "\n";
    
    // 2. Buscar en instructores
    $stmt = $conn->prepare("SELECT * FROM instructores WHERE id_usuario = ?");
    $stmt->execute([$camila_user['id_usuario']]);
    $camila_inst = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($camila_inst) {
        echo "Instructor encontrado:\n";
        print_r($camila_inst);
        echo "\n";
        
        // 3. Buscar asignaciones
        $stmt = $conn->prepare("SELECT * FROM asignaciones_instructor_ficha WHERE id_instructor = ?");
        $stmt->execute([$camila_inst['id_instructor']]);
        $asignaciones = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo "Asignaciones encontradas: " . count($asignaciones) . "\n";
        if (count($asignaciones) > 0) {
            print_r($asignaciones);
        }
    } else {
        echo "❌ Camila NO está en la tabla instructores\n";
    }
} else {
    echo "❌ Camila NO encontrada en usuarios\n";
}
?>
