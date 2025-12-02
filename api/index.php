<?php
/**
 * Punto de entrada principal del API
 * Enruta las peticiones a los controladores correspondientes
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Manejar preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Obtener la ruta solicitada
$request_uri = $_SERVER['REQUEST_URI'];
$script_name = dirname($_SERVER['SCRIPT_NAME']);
$request_path = str_replace($script_name, '', $request_uri);
$request_path = strtok($request_path, '?');
$request_path = trim($request_path, '/');

// Separar la ruta en segmentos
$segments = explode('/', $request_path);
$resource = $segments[0] ?? '';

// Enrutar según el recurso solicitado
switch ($resource) {
    case 'dashboard':
        require_once __DIR__ . '/routes/dashboard.php';
        break;
    
    case 'auth':
        require_once __DIR__ . '/routes/auth.php';
        break;
    
    case 'usuarios':
        require_once __DIR__ . '/routes/usuarios.php';
        break;
    
    case 'aprendices':
        require_once __DIR__ . '/routes/aprendices.php';
        break;
    
    case 'programas':
        require_once __DIR__ . '/routes/programas.php';
        break;
    
    case 'fichas':
        require_once __DIR__ . '/routes/fichas.php';
        break;
    
    case 'asistencias':
        require_once __DIR__ . '/routes/asistencias.php';
        break;
    
    default:
        http_response_code(404);
        echo json_encode([
            'message' => 'Recurso no encontrado',
            'available_endpoints' => [
                'POST /api/auth' => 'Autenticación',
                'GET /api/usuarios' => 'Listar usuarios',
                'GET /api/aprendices' => 'Listar aprendices',
                'GET /api/programas' => 'Listar programas',
                'GET /api/fichas' => 'Listar fichas',
                'GET /api/asistencias' => 'Listar asistencias',
            ]
        ]);
}
?>
