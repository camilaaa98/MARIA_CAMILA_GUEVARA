<?php
try {
    $db = new PDO('sqlite:database/Asistnet.db');
    $tables = $db->query("SELECT name FROM sqlite_master WHERE type='table'")->fetchAll(PDO::FETCH_COLUMN);
    
    foreach ($tables as $table) {
        echo "TABLE: $table\n";
        $cols = $db->query("PRAGMA table_info($table)")->fetchAll(PDO::FETCH_ASSOC);
        foreach ($cols as $col) {
            echo " - " . $col['name'] . " (" . $col['type'] . ")\n";
        }
        echo "\n";
    }
} catch (Exception $e) {
    echo $e->getMessage();
}
?>
