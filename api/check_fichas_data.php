<?php
header('Content-Type: text/plain');
require_once __DIR__ . '/config/Database.php';

echo "=== DIAGNÓSTICO DE DATOS DE FICHAS ===\n\n";

try {
    $db = new Database();
    $conn = $db->getConnection();
    
    // 1. Contar registros
    $stmt = $conn->query("SELECT COUNT(*) as total FROM fichas");
    $total = $stmt->fetch(PDO::FETCH_ASSOC)['total'];
    echo "Total de fichas en base de datos: $total\n\n";
    
    if ($total > 0) {
        // 2. Mostrar las primeras 5 fichas
        echo "Primeras 5 fichas encontradas:\n";
        echo "----------------------------------------\n";
        $stmt = $conn->query("SELECT * FROM fichas LIMIT 5");
        $fichas = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        foreach ($fichas as $f) {
            print_r($f);
            echo "----------------------------------------\n";
        }
    } else {
        echo "⚠️ LA TABLA ESTÁ VACÍA.\n";
    }
    
    // 3. Verificar estructura de tabla
    echo "\nEstructura de tabla 'fichas':\n";
    $stmt = $conn->query("PRAGMA table_info(fichas)");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    foreach ($columns as $col) {
        echo "- " . $col['name'] . " (" . $col['type'] . ")\n";
    }

} catch (Exception $e) {
    echo "❌ Error de conexión: " . $e->getMessage() . "\n";
}
?>
