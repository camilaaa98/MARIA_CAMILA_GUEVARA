<?php
require_once __DIR__ . '/config/Database.php';
$db = new Database();
$conn = $db->getConnection();

echo "FKs in asignaciones_instructor_ficha:\n";
$fks = $conn->query("PRAGMA foreign_key_list(asignaciones_instructor_ficha)")->fetchAll(PDO::FETCH_ASSOC);
print_r($fks);

echo "\nCamila in usuarios:\n";
$camila = $conn->query("SELECT * FROM usuarios WHERE nombre LIKE '%Camila%'")->fetch(PDO::FETCH_ASSOC);
print_r($camila);

if ($camila) {
    echo "\nCamila in instructores (by id_usuario):\n";
    $inst = $conn->query("SELECT * FROM instructores WHERE id_usuario = " . $camila['id_usuario'])->fetch(PDO::FETCH_ASSOC);
    print_r($inst);
}
?>
