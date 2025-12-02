<?php
header('Content-Type: application/json');
require_once __DIR__ . '/config/Database.php';

try {
    $db = new Database();
    $conn = $db->getConnection();
    
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $data = json_decode(file_get_contents('php://input'), true);
        
        // Primero insertar en programas_formacion si no existe
        $checkQuery = "SELECT codigo_programa FROM programas_formacion WHERE codigo_programa = ?";
        $checkStmt = $conn->prepare($checkQuery);
        $checkStmt->execute([$data['codigo_programa']]);
        
        if (!$checkStmt->fetch()) {
            $query = "INSERT INTO programas_formacion (codigo_programa, nombre_programa, nivel_formacion) 
                      VALUES (?, ?, ?)";
            
            $stmt = $conn->prepare($query);
            $stmt->execute([
                $data['codigo_programa'],
                $data['nombre_programa'],
                $data['nivel_formacion']
            ]);
        }
        
        echo json_encode([
            'success' => true,
            'message' => 'Programa creado exitosamente'
        ]);
    }
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>
