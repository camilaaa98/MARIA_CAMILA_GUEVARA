<?php
header('Content-Type: application/json');
require_once __DIR__ . '/config/Database.php';

try {
    $db = new Database();
    $conn = $db->getConnection();
    
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $data = json_decode(file_get_contents('php://input'), true);
        
        $query = "INSERT INTO fichas (numero_ficha, nombre_programa, estado) 
                  VALUES (?, ?, ?)";
        
        $stmt = $conn->prepare($query);
        $stmt->execute([
            $data['numero_ficha'],
            $data['nombre_programa'],
            $data['estado'] ?? 'Activa'
        ]);
        
        echo json_encode([
            'success' => true,
            'message' => 'Ficha creada exitosamente'
        ]);
    }
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>
