<?php
header('Content-Type: application/json');
require_once __DIR__ . '/config/Database.php';

try {
    $db = new Database();
    $conn = $db->getConnection();
    
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $data = json_decode(file_get_contents('php://input'), true);
        
        $query = "INSERT INTO aprendices (tipo_identificacion, documento, nombre, apellido, celular, correo, numero_ficha, estado) 
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        
        $stmt = $conn->prepare($query);
        $stmt->execute([
            $data['tipo_identificacion'],
            $data['documento'],
            $data['nombre'],
            $data['apellido'],
            $data['celular'],
            $data['correo'],
            $data['numero_ficha'],
            $data['estado'] ?? 'Activo'
        ]);
        
        echo json_encode([
            'success' => true,
            'message' => 'Aprendiz creado exitosamente',
            'id' => $conn->lastInsertId()
        ]);
    }
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>
