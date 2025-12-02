<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

require_once __DIR__ . '/../controllers/UsuariosController.php';

$controller = new UsuariosController();
$method = $_SERVER['REQUEST_METHOD'];
$uri = $_SERVER['REQUEST_URI'];
$segments = explode('/', trim(parse_url($uri, PHP_URL_PATH), '/'));
$id = end($segments);

switch ($method) {
    case 'GET':
        if (is_numeric($id) && $id > 0) {
            echo $controller->getById($id);
        } else {
            echo $controller->getAll();
        }
        break;
    
    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);
        echo $controller->create($data);
        break;
    
    case 'PUT':
        if (is_numeric($id) && $id > 0) {
            $data = json_decode(file_get_contents('php://input'), true);
            echo $controller->update($id, $data);
        } else {
            http_response_code(400);
            echo json_encode(['message' => 'ID inválido']);
        }
        break;
    
    case 'DELETE':
        if (is_numeric($id) && $id > 0) {
            echo $controller->delete($id);
        } else {
            http_response_code(400);
            echo json_encode(['message' => 'ID inválido']);
        }
        break;
    
    default:
        http_response_code(405);
        echo json_encode(['message' => 'Método no permitido']);
}
?>
