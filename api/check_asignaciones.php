<?php
require_once 'config/Database.php';

$db = new Database();
$conn = $db->getConnection();

// Check if table exists
$result = $conn->query("SELECT name FROM sqlite_master WHERE type='table' AND name='asignaciones'");
$exists = $result->fetch();

if ($exists) {
    echo "✅ Tabla asignaciones EXISTE\n\n";
    
    // Get sample data
    $stmt = $conn->query("SELECT * FROM asignaciones LIMIT 5");
    $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo "Datos de ejemplo:\n";
    print_r($data);
} else {
    echo "❌ Tabla asignaciones NO EXISTE\n";
}
?>
