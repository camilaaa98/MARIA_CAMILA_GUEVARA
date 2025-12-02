<?php
// Asegurar que siempre devolvemos JSON
header('Content-Type: application/json');

// Manejo robusto de errores
try {
    require_once __DIR__ . '/../controllers/AuthController.php';
    
    // Obtener datos del request
    $data = json_decode(file_get_contents('php://input'), true);
    
    // Crear controlador y procesar login
    $controller = new AuthController();
    echo $controller->login($data);
    
} catch (Exception $e) {
    // Si algo falla, siempre devolver JSON válido
    http_response_code(500);
    echo json_encode([
        'message' => 'Error del servidor: ' . $e->getMessage(),
        'error' => true
    ]);
} catch (Error $e) {
    // Capturar errores fatales también
    http_response_code(500);
    echo json_encode([
        'message' => 'Error fatal del servidor: ' . $e->getMessage(),
        'error' => true
    ]);
}
?>
