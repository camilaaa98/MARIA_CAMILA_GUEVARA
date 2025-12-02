<?php
require_once __DIR__ . '/config/Database.php';
$db = new Database();
$conn = $db->getConnection();

$numero_ficha = '2277866'; // Example from screenshot
$id_instructor = 5; // Example ID

echo "Trying to assign instructor $id_instructor to ficha $numero_ficha...\n";

// 1. Check if ficha exists and get internal ID
$stmt = $conn->prepare("SELECT id_ficha FROM fichas WHERE numero_ficha = ?");
$stmt->execute([$numero_ficha]);
$ficha = $stmt->fetch(PDO::FETCH_ASSOC);

if ($ficha) {
    echo "Found internal id_ficha: " . $ficha['id_ficha'] . "\n";
    
    // 2. Try to insert using the WRONG value (numero_ficha) to see if it fails
    try {
        $sql = "INSERT INTO asignaciones_instructor_ficha (id_ficha, id_instructor) VALUES (?, ?)";
        $stmt = $conn->prepare($sql);
        $stmt->execute([$numero_ficha, $id_instructor]);
        echo "Insert with numero_ficha SUCCESS (Unexpected if FK exists)\n";
    } catch (Exception $e) {
        echo "Insert with numero_ficha FAILED: " . $e->getMessage() . "\n";
    }

    // 3. Try to insert using the CORRECT value (id_ficha)
    try {
        $sql = "INSERT INTO asignaciones_instructor_ficha (id_ficha, id_instructor) VALUES (?, ?)";
        $stmt = $conn->prepare($sql);
        $stmt->execute([$ficha['id_ficha'], $id_instructor]);
        echo "Insert with internal id_ficha SUCCESS\n";
    } catch (Exception $e) {
        echo "Insert with internal id_ficha FAILED: " . $e->getMessage() . "\n";
    }

} else {
    echo "Ficha not found!\n";
}
?>
