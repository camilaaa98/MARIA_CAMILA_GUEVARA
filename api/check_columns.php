<?php
require_once __DIR__ . '/config/Database.php';
$db = new Database();
$conn = $db->getConnection();

echo "Columns in asignaciones_instructor_ficha:\n";
$cols = $conn->query("PRAGMA table_info(asignaciones_instructor_ficha)")->fetchAll(PDO::FETCH_ASSOC);
foreach ($cols as $col) echo $col['name'] . "\n";

echo "\nColumns in instructores:\n";
$cols = $conn->query("PRAGMA table_info(instructores)")->fetchAll(PDO::FETCH_ASSOC);
foreach ($cols as $col) echo $col['name'] . "\n";

echo "\nColumns in usuarios:\n";
$cols = $conn->query("PRAGMA table_info(usuarios)")->fetchAll(PDO::FETCH_ASSOC);
foreach ($cols as $col) echo $col['name'] . "\n";
?>
