<?php
header('Content-Type: application/json');
require_once __DIR__ . '/config/Database.php';

try {
    $db = new Database();
    $conn = $db->getConnection();
    
    // Obtener programas únicos directamente de fichas
    $query = "SELECT DISTINCT nombre_programa
              FROM fichas
              WHERE nombre_programa IS NOT NULL
              ORDER BY nombre_programa";
              
    $stmt = $conn->query($query);
    $programasBase = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Para cada programa, obtener sus fichas
    $programas = [];
    foreach ($programasBase as $prog) {
        $queryFichas = "SELECT GROUP_CONCAT(numero_ficha) as fichas_asociadas 
                        FROM fichas 
                        WHERE nombre_programa = ?";
        $stmtFichas = $conn->prepare($queryFichas);
        $stmtFichas->execute([$prog['nombre_programa']]);
        $fichas = $stmtFichas->fetch(PDO::FETCH_ASSOC);
        
        $programas[] = [
            'nombre_programa' => $prog['nombre_programa'],
            'nivel_formacion' => 'Tecnólogo',
            'codigo_programa' => substr(md5($prog['nombre_programa']), 0, 8),
            'fichas_asociadas' => $fichas['fichas_asociadas'],
            'estado' => 'Activo'
        ];
    }
    
    echo json_encode([
        'success' => true,
        'data' => $programas,
        'total' => count($programas)
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>
