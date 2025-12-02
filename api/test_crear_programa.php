<?php
require_once 'config/Database.php';

$db = new Database();
$conn = $db->getConnection();

// Test 1: Crear programa nuevo con ficha nueva
echo "=== TEST 1: Crear ficha + programa nuevo ===\n";
$data1 = [
    'numeroFicha' => '9999999',
    'nombrePrograma' => 'Programa de Prueba',
    'nivelFormacion' => 'Tecnólogo',
    'jornada' => 'Mixta',
    'estado' => 'EN FORMACION'
];

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, "http://localhost/YanguasEjercicios/mockups-asist-net/api/crear-programa-ficha.php");
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data1));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
$result = curl_exec($ch);
curl_close($ch);
echo $result . "\n\n";

// Test 2: Intentar duplicar la ficha
echo "=== TEST 2: Intentar duplicar ficha ===\n";
$data2 = [
    'numeroFicha' => '9999999',  // Mismo número
    'nombrePrograma' => 'Otro Programa',
    'nivelFormacion' => 'Técnico',
    'jornada' => 'Diurna',
    'estado' => 'EN FORMACION'
];

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, "http://localhost/YanguasEjercicios/mockups-asist-net/api/crear-programa-ficha.php");
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data2));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
$result = curl_exec($ch);
curl_close($ch);
echo $result . "\n\n";

// Test 3: Crear ficha con programa existente (diferentes mayúsculas)
echo "===TEST 3: Programa existente (case-insensitive) ===\n";
$data3 = [
    'numeroFicha' => '9999998',
    'nombrePrograma' => 'PROGRAMA DE PRUEBA',  // Mayúsculas, debería detectar el existente
    'nivelFormacion' => 'Tecnólogo',
    'jornada' => 'Mixta',
    'estado' => 'EN FORMACION'
];

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, "http://localhost/YanguasEjercicios/mockups-asist-net/api/crear-programa-ficha.php");
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data3));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
$result = curl_exec($ch);
curl_close($ch);
echo $result . "\n\n";

// Cleanup
echo "=== CLEANUP: Eliminando datos de prueba ===\n";
$conn->exec("DELETE FROM fichas WHERE numero_ficha IN ('9999999', '9999998')");
$conn->exec("DELETE FROM programas_formacion WHERE LOWER(nombre_programa) = 'programa de prueba'");
echo "✅ Limpieza completada\n";
?>
