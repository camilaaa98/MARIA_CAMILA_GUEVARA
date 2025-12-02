<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once __DIR__ . '/../controllers/AuthController.php';

$controller = new AuthController();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    echo $controller->login($data);
} else {
    http_response_code(405);
    echo json_encode(['message' => 'Método no permitido']);
}
?>
