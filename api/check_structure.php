<?php
require_once 'config/Database.php';
$db = new Database();
$conn = $db->getConnection();
$stmt = $conn->query("PRAGMA table_info(programas_formacion)");
echo "Estructura programas_formacion:\n";
while($row = $stmt->fetch()) {
    echo $row['name'] . " - " . $row['type'] . "\n";
}
?>
