<?php
try {
    $db = new PDO('sqlite:database/Asistnet.db');
    
    // Verificar si existe la tabla
    $check = $db->query("SELECT name FROM sqlite_master WHERE type='table' AND name='asistencias'");
    if (!$check->fetch()) {
        echo "La tabla 'asistencias' NO existe.\n";
        exit;
    }
    
    $stmt = $db->query("SELECT * FROM asistencias LIMIT 10");
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if (empty($rows)) {
        echo "La tabla 'asistencias' está vacía.\n";
    } else {
        echo "Datos en 'asistencias':\n";
        print_r($rows);
    }
    
} catch (Exception $e) {
    echo $e->getMessage();
}
?>
