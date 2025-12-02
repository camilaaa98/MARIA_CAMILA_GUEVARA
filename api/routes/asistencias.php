<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

require_once __DIR__ . '/../controllers/AsistenciasController.php';
require_once __DIR__ . '/../controllers/ReportesController.php';

$method = $_SERVER['REQUEST_METHOD'];
$uri = $_SERVER['REQUEST_URI'];
$segments = explode('/', trim(parse_url($uri, PHP_URL_PATH), '/'));

// Verificar si es una petición de reporte
$isReporte = strpos($uri, '/reporte') !== false;

if ($isReporte) {
    // Manejar reportes
    $reportesController = new ReportesController();
    
    if ($method === 'GET') {
        $tipo = $_GET['tipo'] ?? 'general';
        $ficha = $_GET['ficha'] ?? '';
        $fechaInicio = $_GET['fecha_inicio'] ?? date('Y-m-01');
        $fechaFin = $_GET['fecha_fin'] ?? date('Y-m-d');
        
        $result = $reportesController->generarReporte($tipo, $ficha, $fechaInicio, $fechaFin);
        echo json_encode($result);
    } else {
        http_response_code(405);
        echo json_encode(['message' => 'Método no permitido']);
    }
} else {
    // Manejar asistencias normales
    $controller = new AsistenciasController();
    
    switch ($method) {
        case 'GET':
            if (isset($_GET['fecha'])) {
                echo $controller->getByFecha($_GET['fecha']);
            } else {
                $filters = [];
                if (isset($_GET['id_ficha'])) $filters['id_ficha'] = $_GET['id_ficha'];
                if (isset($_GET['id_aprendiz'])) $filters['id_aprendiz'] = $_GET['id_aprendiz'];
                echo $controller->getAll($filters);
            }
            break;
        
        case 'POST':
            $data = json_decode(file_get_contents('php://input'), true);
            echo $controller->create($data);
            break;
        
        case 'PUT':
            $id = end($segments);
            if (is_numeric($id) && $id > 0) {
                $data = json_decode(file_get_contents('php://input'), true);
                echo $controller->update($id, $data);
            } else {
                http_response_code(400);
                echo json_encode(['message' => 'ID inválido']);
            }
            break;
        
        default:
            http_response_code(405);
            echo json_encode(['message' => 'Método no permitido']);
    }
}
?>
