<?php
header('Content-Type: application/json');
require_once __DIR__ . '/config/Database.php';

$db = new Database();
$conn = $db->getConnection();
$method = $_SERVER['REQUEST_METHOD'];

try {
    if ($method === 'POST') {
        $data = json_decode(file_get_contents('php://input'), true);
        
        $numero_ficha = $data['numeroFicha'] ?? null;
        $nombre_programa = trim($data['nombrePrograma'] ?? '');
        $nivel_formacion = $data['nivelFormacion'] ?? '';
        $jornada = $data['jornada'] ?? '';
        $estado = $data['estado'] ?? 'EN FORMACION';
        
        if (!$numero_ficha || !$nombre_programa) {
            throw new Exception("Número de ficha y nombre del programa son obligatorios");
        }
        
        // 1. VALIDAR: No se puede repetir el número de ficha
        $stmtCheckFicha = $conn->prepare("SELECT numero_ficha FROM fichas WHERE numero_ficha = ?");
        $stmtCheckFicha->execute([$numero_ficha]);
        if ($stmtCheckFicha->fetch()) {
            throw new Exception("Ya existe una ficha con el número $numero_ficha");
        }
        
        // 2. VALIDAR: No se puede repetir el nombre del programa (case-insensitive)
        $stmtCheckPrograma = $conn->prepare("SELECT nombre_programa FROM programas_formacion WHERE LOWER(nombre_programa) = LOWER(?)");
        $stmtCheckPrograma->execute([$nombre_programa]);
        $programaExistente = $stmtCheckPrograma->fetch();
        
        $conn->beginTransaction();
        
        try {
            // 3. Si el programa NO existe, crearlo en programas_formacion
            if (!$programaExistente) {
                $sqlPrograma = "INSERT INTO programas_formacion (nombre_programa, nivel_formacion) VALUES (?, ?)";
                $stmtPrograma = $conn->prepare($sqlPrograma);
                $stmtPrograma->execute([$nombre_programa, $nivel_formacion]);
            }
            
            // 4. Crear la ficha en la tabla fichas (columnas correctas según estructura real)
            $sqlFicha = "INSERT INTO fichas (numero_ficha, nombre_programa, jornada, estado) VALUES (?, ?, ?, ?)";
            $stmtFicha = $conn->prepare($sqlFicha);
            $stmtFicha->execute([$numero_ficha, $nombre_programa, $jornada, $estado]);
            
            $conn->commit();
            
            echo json_encode([
                'success' => true,
                'message' => 'Ficha creada exitosamente',
                'programa_nuevo' => !$programaExistente
            ]);
            
        } catch (Exception $e) {
            $conn->rollBack();
            throw $e;
        }
        
    } else {
        throw new Exception("Método no permitido");
    }
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>
