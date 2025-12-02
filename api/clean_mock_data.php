<?php
header('Content-Type: application/json');
require_once __DIR__ . '/config/Database.php';

try {
    $db = new Database();
    $conn = $db->getConnection();
    
    // Lista de correos de usuarios mock a eliminar
    $correosEliminar = [
        'cardenas@sena.edu.co',
        'carlosm@sena.edu.co',
        'instructor@sena.edu.co',
        'maria.testing@sena.edu.co'
    ];
    
    $placeholders = implode(',', array_fill(0, count($correosEliminar), '?'));
    
    // 1. Obtener IDs de usuarios a eliminar
    $sqlGetIds = "SELECT id_usuario FROM usuarios WHERE correo IN ($placeholders)";
    $stmtGetIds = $conn->prepare($sqlGetIds);
    $stmtGetIds->execute($correosEliminar);
    $ids = $stmtGetIds->fetchAll(PDO::FETCH_COLUMN);
    
    if (empty($ids)) {
        echo json_encode(['success' => true, 'message' => 'No se encontraron usuarios mock para eliminar.']);
        exit;
    }
    
    $idsPlaceholders = implode(',', array_fill(0, count($ids), '?'));
    
    // 2. Eliminar de tabla instructores
    $sqlDelInstructores = "DELETE FROM instructores WHERE id_usuario IN ($idsPlaceholders)";
    $stmtDelInstructores = $conn->prepare($sqlDelInstructores);
    $stmtDelInstructores->execute($ids);
    
    // 3. Eliminar de tabla usuarios
    $sqlDelUsuarios = "DELETE FROM usuarios WHERE id_usuario IN ($idsPlaceholders)";
    $stmtDelUsuarios = $conn->prepare($sqlDelUsuarios);
    $stmtDelUsuarios->execute($ids);
    
    echo json_encode([
        'success' => true, 
        'message' => 'Usuarios mock eliminados correctamente.',
        'deleted_ids' => $ids
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage()
    ]);
}
?>
