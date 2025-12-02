<?php
/**
 * Endpoint para obtener estadísticas de asistencia de hoy para un instructor
 */
header('Content-Type: application/json');

try {
    require_once __DIR__ . '/controllers/AsistenciasController.php';
    
    // Obtener id_instructor desde query params
    if (!isset($_GET['id_instructor'])) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'id_instructor es requerido'
        ]);
        exit;
    }
    
    $id_instructor = $_GET['id_instructor'];
    
    // Crear controlador y obtener estadísticas
    $controller = new AsistenciasController();
    echo $controller->getStatsHoy($id_instructor);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error del servidor: ' . $e->getMessage()
    ]);
}
?>
