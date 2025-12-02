<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "=== TESTING COMPLETO ASISTNET ===\n\n";

// Función helper para hacer requests
function testEndpoint($url, $method = 'GET', $data = null) {
    $options = [
        'http' => [
            'method' => $method,
            'header' => "Content-type: application/json\r\n",
            'ignore_errors' => true
        ]
    ];
    
    if ($data) {
        $options['http']['content'] = json_encode($data);
    }
    
    $context = stream_context_create($options);
    $result = @file_get_contents($url, false, $context);
    
    return [
        'response' => $result,
        'headers' => $http_response_header ?? []
    ];
}

$baseUrl = 'http://localhost/YanguasEjercicios/mockups-asist-net/api';

// TEST 1: Verificar que Camila existe y tiene asignaciones
echo "TEST 1: Verificar usuario Camila\n";
echo "-----------------------------------\n";
require_once __DIR__ . '/config/Database.php';
$db = new Database();
$conn = $db->getConnection();

$stmt = $conn->query("SELECT id_usuario, correo, nombre, apellido FROM usuarios WHERE correo LIKE '%camila%'");
$camila = $stmt->fetch(PDO::FETCH_ASSOC);

if ($camila) {
    echo "✅ Camila encontrada: {$camila['nombre']} {$camila['apellido']} (ID: {$camila['id_usuario']})\n";
    
    // Buscar en instructores
    $stmt = $conn->prepare("SELECT * FROM instructores WHERE id_usuario = ?");
    $stmt->execute([$camila['id_usuario']]);
    $instructor = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($instructor) {
        echo "✅ Registro de instructor encontrado (ID: {$instructor['id_instructor']})\n";
        
        // Verificar asignaciones
        $stmt = $conn->prepare("SELECT COUNT(*) as total FROM asignaciones_instructor_ficha WHERE id_instructor = ?");
        $stmt->execute([$instructor['id_instructor']]);
        $count = $stmt->fetch(PDO::FETCH_ASSOC);
        echo "✅ Asignaciones: {$count['total']} fichas\n";
    } else {
        echo "❌ ERROR: Camila no está en la tabla instructores\n";
    }
} else {
    echo "❌ ERROR: Camila no encontrada\n";
}

echo "\n";

// TEST 2: Probar API de instructor-asignaciones
echo "TEST 2: API instructor-asignaciones.php\n";
echo "-----------------------------------\n";
if (isset($instructor)) {
    $result = testEndpoint("$baseUrl/instructor-asignaciones.php?id_instructor={$instructor['id_instructor']}");
    $data = json_decode($result['response'], true);
    
    if ($data && $data['success']) {
        echo "✅ API funciona correctamente\n";
        echo "   Fichas devueltas: " . count($data['data']) . "\n";
    } else {
        echo "❌ ERROR en API: " . ($data['message'] ?? 'Sin respuesta') . "\n";
        echo "   Response: " . $result['response'] . "\n";
    }
}

echo "\n";

// TEST 3: Probar API de asignaciones (POST)
echo "TEST 3: API asignaciones.php (POST)\n";
echo "-----------------------------------\n";
$testData = [
    'id_ficha' => '2277866',
    'id_instructor' => 5
];

$result = testEndpoint("$baseUrl/asignaciones.php", 'POST', $testData);
$response = json_decode($result['response'], true);

if ($response && isset($response['success'])) {
    if ($response['success']) {
        echo "✅ POST funciona correctamente\n";
    } else {
        echo "⚠️  POST devolvió: {$response['message']}\n";
    }
} else {
    echo "❌ ERROR en POST\n";
    echo "   Response: " . substr($result['response'], 0, 200) . "\n";
}

echo "\n";

// TEST 4: Verificar estructura de fichas
echo "TEST 4: Estructura de tabla fichas\n";
echo "-----------------------------------\n";
$stmt = $conn->query("SELECT * FROM fichas LIMIT 1");
$ficha = $stmt->fetch(PDO::FETCH_ASSOC);

if ($ficha) {
    echo "✅ Columnas en fichas: " . implode(', ', array_keys($ficha)) . "\n";
    
    // Verificar que id_ficha existe
    if (isset($ficha['id_ficha'])) {
        echo "✅ Columna id_ficha existe\n";
    } else {
        echo "❌ ERROR: Columna id_ficha NO existe\n";
    }
    
    if (isset($ficha['numero_ficha'])) {
        echo "✅ Columna numero_ficha existe\n";
    } else {
        echo "❌ ERROR: Columna numero_ficha NO existe\n";
    }
}

echo "\n";

// TEST 5: Verificar relación id_ficha vs numero_ficha
echo "TEST 5: Relación id_ficha vs numero_ficha\n";
echo "-----------------------------------\n";
$stmt = $conn->query("SELECT id_ficha, numero_ficha FROM fichas LIMIT 5");
$fichas = $stmt->fetchAll(PDO::FETCH_ASSOC);

foreach ($fichas as $f) {
    echo "   id_ficha: {$f['id_ficha']} -> numero_ficha: {$f['numero_ficha']}\n";
}

echo "\n";

// TEST 6: Verificar que las asignaciones usan id_ficha correcto
echo "TEST 6: Validar asignaciones\n";
echo "-----------------------------------\n";
$stmt = $conn->query("
    SELECT a.*, f.numero_ficha 
    FROM asignaciones_instructor_ficha a
    LEFT JOIN fichas f ON a.id_ficha = f.id_ficha
    LIMIT 5
");
$asignaciones = $stmt->fetchAll(PDO::FETCH_ASSOC);

foreach ($asignaciones as $a) {
    if ($a['numero_ficha']) {
        echo "✅ Asignación válida: id_ficha={$a['id_ficha']} -> numero_ficha={$a['numero_ficha']}\n";
    } else {
        echo "❌ ERROR: Asignación con id_ficha={$a['id_ficha']} no tiene ficha asociada\n";
    }
}

echo "\n=== FIN DEL TESTING ===\n";
?>
