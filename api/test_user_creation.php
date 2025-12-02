<?php
// Test crear usuario manualmente
header('Content-Type: application/json');
require_once __DIR__ . '/controllers/UsuariosController.php';

$controller = new UsuariosController();

// Simular datos del formulario
$testData = [
    'nombre' => 'Test',
    'apellido' => 'Usuario',
    'correo' => 'test@sena.edu.co',
    'password' => '123456',
    'rol' => 'instructor',
    'estado' => 1
];

echo "Intentando crear usuario...\n";
$result = $controller->create($testData);
echo $result . "\n";

// Verificar si se creó
try {
    require_once __DIR__ . '/config/Database.php';
    $db = new Database();
    $conn = $db->getConnection();
    
    $sql = "SELECT * FROM usuarios WHERE correo = 'test@sena.edu.co'";
    $stmt = $conn->query($sql);
    $usuario = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($usuario) {
        echo "\n✅ Usuario encontrado en BD:\n";
        echo json_encode($usuario, JSON_PRETTY_PRINT) . "\n";
        
        // Ver si está en instructores
        $sql2 = "SELECT * FROM instructores WHERE id_usuario = ?";
        $stmt2 = $conn->prepare($sql2);
        $stmt2->execute([$usuario['id_usuario']]);
        $instructor = $stmt2->fetch(PDO::FETCH_ASSOC);
        
        if ($instructor) {
            echo "\n✅ También está en tabla instructores:\n";
            echo json_encode($instructor, JSON_PRETTY_PRINT) . "\n";
        }
    } else {
        echo "\n❌ Usuario NO encontrado en BD\n";
    }
} catch (Exception $e) {
    echo "\n❌ Error: " . $e->getMessage() . "\n";
}
?>
