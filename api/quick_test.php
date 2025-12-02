<?php
require_once __DIR__ . '/config/Database.php';
$db = new Database();
$conn = $db->getConnection();

// Obtener id_instructor de Camila
$stmt = $conn->query("SELECT i.id_instructor FROM instructores i JOIN usuarios u ON i.id_usuario = u.id_usuario WHERE u.correo LIKE '%camila%'");
$result = $stmt->fetch(PDO::FETCH_ASSOC);
$id_instructor = $result['id_instructor'];

echo "ID Instructor de Camila: $id_instructor\n\n";

// Probar la consulta que usa la API
$query = "SELECT DISTINCT f.* 
          FROM fichas f
          JOIN asignaciones_instructor_ficha a ON f.id_ficha = a.id_ficha
          WHERE a.id_instructor = ?
          ORDER BY f.numero_ficha";

$stmt = $conn->prepare($query);
$stmt->execute([$id_instructor]);
$fichas = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo "Fichas encontradas: " . count($fichas) . "\n\n";

foreach ($fichas as $f) {
    echo "- Ficha {$f['numero_ficha']}: {$f['nombre_programa']}\n";
}
?>
