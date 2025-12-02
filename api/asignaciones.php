<?php
header('Content-Type: application/json');
require_once __DIR__ . '/config/Database.php';

$db = new Database();
$conn = $db->getConnection();
$method = $_SERVER['REQUEST_METHOD'];

try {
    if ($method === 'POST') {
        // Asignar instructor a ficha
        $data = json_decode(file_get_contents('php://input'), true);
        
        // Buscar el id_ficha interno basado en el numero_ficha
        $stmtFicha = $conn->prepare("SELECT id_ficha FROM fichas WHERE numero_ficha = ?");
        $stmtFicha->execute([$data['id_ficha']]);
        $ficha = $stmtFicha->fetch(PDO::FETCH_ASSOC);
        
        if (!$ficha) {
            throw new Exception("Ficha no encontrada: " . $data['id_ficha']);
        }
        
        $sql = "INSERT OR REPLACE INTO asignaciones_instructor_ficha (id_ficha, id_instructor) VALUES (?, ?)";
        $stmt = $conn->prepare($sql);
        $stmt->execute([$ficha['id_ficha'], $data['id_instructor']]);
        
        echo json_encode(['success' => true, 'message' => 'Instructor asignado']);
        
    } elseif ($method === 'GET') {
        // Obtener instructores asignados a una ficha
        $id_ficha = $_GET['id_ficha'] ?? null;
        
        if ($id_ficha) {
            // Buscar el id_ficha interno si se pasó el número
            $stmtFicha = $conn->prepare("SELECT id_ficha FROM fichas WHERE numero_ficha = ? OR id_ficha = ?");
            $stmtFicha->execute([$id_ficha, $id_ficha]);
            $ficha = $stmtFicha->fetch(PDO::FETCH_ASSOC);
            
            if ($ficha) {
                $sql = "SELECT i.* FROM instructores i 
                        JOIN asignaciones_instructor_ficha a ON i.id_instructor = a.id_instructor 
                        WHERE a.id_ficha = ?";
                $stmt = $conn->prepare($sql);
                $stmt->execute([$ficha['id_ficha']]);
                $instructores = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                echo json_encode(['success' => true, 'data' => $instructores]);
            } else {
                echo json_encode(['success' => true, 'data' => []]); // Ficha no encontrada o sin asignaciones
            }
        } else {
            echo json_encode(['success' => false, 'message' => 'id_ficha requerido']);
        }
        
    } elseif ($method === 'DELETE') {
        // Desasignar instructor de ficha
        $data = json_decode(file_get_contents('php://input'), true);
        
        // Buscar el id_ficha interno basado en el numero_ficha
        $stmtFicha = $conn->prepare("SELECT id_ficha FROM fichas WHERE numero_ficha = ?");
        $stmtFicha->execute([$data['id_ficha']]);
        $ficha = $stmtFicha->fetch(PDO::FETCH_ASSOC);
        
        if ($ficha) {
            $sql = "DELETE FROM asignaciones_instructor_ficha WHERE id_ficha = ? AND id_instructor = ?";
            $stmt = $conn->prepare($sql);
            $stmt->execute([$ficha['id_ficha'], $data['id_instructor']]);
            echo json_encode(['success' => true, 'message' => 'Instructor desasignado']);
        } else {
             echo json_encode(['success' => false, 'message' => 'Ficha no encontrada']);
        }
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>
