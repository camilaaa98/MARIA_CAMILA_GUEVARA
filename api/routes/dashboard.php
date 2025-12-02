<?php
/**
 * Rutas del Dashboard
 */

require_once __DIR__ . '/../controllers/DashboardController.php';

$controller = new DashboardController();
$method = $_SERVER['REQUEST_METHOD'];

// Obtener el segmento de la ruta
$request_uri = $_SERVER['REQUEST_URI'];
$script_name = dirname(dirname($_SERVER['SCRIPT_NAME']));
$request_path = str_replace($script_name, '', $request_uri);
$request_path = strtok($request_path, '?');
$request_path = trim($request_path, '/');
$segments = explode('/', $request_path);

// El segundo segmento indica la acción (stats o recent-activity)
$action = $segments[1] ?? '';

switch ($method) {
    case 'GET':
        if ($action === 'stats') {
            $result = $controller->getStats();
            echo json_encode($result['data'] ?? $result);
        } elseif ($action === 'recent-activity') {
            $result = $controller->getRecentActivity();
            echo json_encode($result['data'] ?? $result);
        } else {
            http_response_code(404);
            echo json_encode(['message' => 'Endpoint no encontrado']);
        }
        break;
    
    default:
        http_response_code(405);
        echo json_encode(['message' => 'Método no permitido']);
        break;
}
?>
