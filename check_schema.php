<?php
try {
    $db = new PDO('sqlite:database/Asistnet.db');
    $stmt = $db->query("PRAGMA table_info(aprendices)");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo "Columnas aprendices:\n";
    foreach ($columns as $col) {
        echo $col['name'] . "\n";
    }
    
    echo "\nConteo aprendices:\n";
    $stmt = $db->query("SELECT count(*) FROM aprendices");
    echo $stmt->fetchColumn();
    
} catch (Exception $e) {
    echo $e->getMessage();
}
?>
