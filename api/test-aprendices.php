<?php
header('Content-Type: application/json');
require_once __DIR__ . '/config/Database.php';

try {
    $db = new Database();
    $conn = $db->getConnection();
    
    // Parámetros de paginación
    $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;
    $offset = ($page - 1) * $limit;
    
    // Obtener total de registros
    $countQuery = "SELECT count(*) FROM aprendices";
    $total = $conn->query($countQuery)->fetchColumn();
    $totalPages = ceil($total / $limit);
    
    // Obtener aprendices con nombre de programa (JOIN)
    // Nota: Asumimos que la tabla fichas tiene el nombre del programa o se relaciona con programas_formacion
    // Primero verificamos si podemos hacer JOIN directo
    
    $query = "SELECT a.*, f.nombre_programa 
              FROM aprendices a 
              LEFT JOIN fichas f ON a.id_ficha = f.numero_ficha 
              ORDER BY a.apellido, a.nombre 
              LIMIT :limit OFFSET :offset";
              
    $stmt = $conn->prepare($query);
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    $stmt->execute();
    
    $aprendices = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true,
        'data' => $aprendices,
        'pagination' => [
            'current_page' => $page,
            'total_pages' => $totalPages,
            'total_items' => $total,
            'items_per_page' => $limit
        ]
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>
