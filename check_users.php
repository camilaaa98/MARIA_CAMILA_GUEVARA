<?php
try {
    $db = new PDO('sqlite:database/Asistnet.db');
    $stmt = $db->query("PRAGMA table_info(usuarios)");
    $cols = $stmt->fetchAll(PDO::FETCH_ASSOC);
    foreach ($cols as $col) {
        echo $col['name'] . "\n";
    }
    
    echo "\nEjemplo usuarios:\n";
    $stmt = $db->query("SELECT * FROM usuarios LIMIT 5");
    print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
} catch (Exception $e) {
    echo $e->getMessage();
}
?>
