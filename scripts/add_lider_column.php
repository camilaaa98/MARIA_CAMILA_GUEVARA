<?php
require_once __DIR__ . '/../api/config/Database.php';

try {
    $db = new Database();
    $conn = $db->getConnection();
    
    // Agregar columna es_lider a asignaciones_instructor_ficha
    echo "Agregando columna 'es_lider' a asignaciones_instructor_ficha...\n";
    
    try {
        $conn->exec("ALTER TABLE asignaciones_instructor_ficha ADD COLUMN es_lider INTEGER DEFAULT 0");
        echo "✓ Columna 'es_lider' agregada exitosamente.\n";
    } catch (Exception $e) {
        echo "⚠ Columna 'es_lider' ya existe o error: " . $e->getMessage() . "\n";
    }
    
    echo "\nEstructura actualizada correctamente.\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
