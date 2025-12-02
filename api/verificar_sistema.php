<?php
// Test completo del sistema de creación
require_once 'config/Database.php';

echo "=== VERIFICACIÓN COMPLETA DEL SISTEMA ===\n\n";

$db = new Database();
$conn = $db->getConnection();

// 1. Verificar estructura de tablas
echo "1. Estructura de tablas:\n";
echo "   - fichas:\n";
$stmt = $conn->query("PRAGMA table_info(fichas)");
while($row = $stmt->fetch()) {
    echo "     {$row['name']} ({$row['type']})\n";
}

echo "\n   - programas_formacion:\n";
$stmt = $conn->query("PRAGMA table_info(programas_formacion)");
while($row = $stmt->fetch()) {
    echo "     {$row['name']} ({$row['type']})\n";
}

// 2. Crear programa de prueba
echo "\n2. Creando ficha de prueba...\n";
$testData = json_encode([
    'numeroFicha' => '1111111',
    'nombrePrograma' => 'Prueba de Sistema',
    'nivelFormacion' => 'Tecnólogo',
    'jornada' => 'Mixta',
    'estado' => 'EN FORMACION'
]);

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, "http://localhost/YanguasEjercicios/mockups-asist-net/api/crear-programa-ficha.php");
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, $testData);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
$result = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "   Resultado HTTP: $httpCode\n";
echo "   Respuesta: $result\n";

// 3. Verificar si se guardó en fichas
echo "\n3. Verificando tabla fichas:\n";
$stmt = $conn->prepare("SELECT * FROM fichas WHERE numero_ficha = '1111111'");
$stmt->execute();
$ficha = $stmt->fetch(PDO::FETCH_ASSOC);
if ($ficha) {
    echo "   ✅ Ficha encontrada:\n";
    foreach($ficha as $key => $value) {
        echo "      $key: $value\n";
    }
} else {
    echo "   ❌ Ficha NO encontrada\n";
}

// 4. Verificar si se guardó en programas_formacion
echo "\n4. Verificando tabla programas_formacion:\n";
$stmt = $conn->prepare("SELECT * FROM programas_formacion WHERE LOWER(nombre_programa) = LOWER('Prueba de Sistema')");
$stmt->execute();
$programa = $stmt->fetch(PDO::FETCH_ASSOC);
if ($programa) {
    echo "   ✅ Programa encontrado:\n";
    foreach($programa as $key => $value) {
        echo "      $key: $value\n";
    }
} else {
    echo "   ❌ Programa NO encontrado\n";
}

// 5. Cleanup
echo "\n5. Limpiando datos de prueba...\n";
$conn->exec("DELETE FROM fichas WHERE numero_ficha = '1111111'");
$conn->exec("DELETE FROM programas_formacion WHERE LOWER(nombre_programa) = LOWER('Prueba de Sistema')");
echo "   ✅ Limpieza completada\n";

echo "\n=== VERIFICACIÓN COMPLETADA ===\n";
?>
