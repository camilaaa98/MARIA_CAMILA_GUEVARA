<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "=== TESTING FINAL ASISTNET ===\n\n";

require_once __DIR__ . '/config/Database.php';
$db = new Database();
$conn = $db->getConnection();

// TEST 1: Verificar endpoint get-instructor-id.php
echo "TEST 1: Endpoint get-instructor-id.php\n";
echo "--------------------------------------\n";

$stmt = $conn->query("SELECT id_usuario FROM usuarios WHERE correo LIKE '%camila%'");
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if ($user) {
    $url = "http://localhost/YanguasEjercicios/mockups-asist-net/api/get-instructor-id.php?id_usuario={$user['id_usuario']}";
    $response = @file_get_contents($url);
    
    if ($response) {
        $data = json_decode($response, true);
        if ($data && $data['success']) {
            echo "✅ Endpoint funciona: id_instructor = {$data['id_instructor']}\n";
        } else {
            echo "❌ Endpoint devolvió error: " . ($data['message'] ?? 'Sin mensaje') . "\n";
        }
    } else {
        echo "❌ No se pudo conectar al endpoint\n";
    }
} else {
    echo "❌ Usuario no encontrado\n";
}

echo "\n";

// TEST 2: Verificar instructor-asignaciones.php
echo "TEST 2: Endpoint instructor-asignaciones.php\n";
echo "--------------------------------------------\n";

$stmt = $conn->query("SELECT i.id_instructor FROM instructores i JOIN usuarios u ON i.id_usuario = u.id_usuario WHERE u.correo LIKE '%camila%'");
$instructor = $stmt->fetch(PDO::FETCH_ASSOC);

if ($instructor) {
    $url = "http://localhost/YanguasEjercicios/mockups-asist-net/api/instructor-asignaciones.php?id_instructor={$instructor['id_instructor']}";
    $response = @file_get_contents($url);
    
    if ($response) {
        $data = json_decode($response, true);
        if ($data && $data['success']) {
            echo "✅ Endpoint funciona: " . count($data['data']) . " fichas encontradas\n";
            foreach ($data['data'] as $ficha) {
                echo "   - Ficha {$ficha['numero_ficha']}: {$ficha['nombre_programa']}\n";
            }
        } else {
            echo "❌ Endpoint devolvió error\n";
        }
    } else {
        echo "❌ No se pudo conectar al endpoint\n";
    }
}

echo "\n";

// TEST 3: Verificar asignaciones.php (POST)
echo "TEST 3: Endpoint asignaciones.php (POST)\n";
echo "----------------------------------------\n";

$url = "http://localhost/YanguasEjercicios/mockups-asist-net/api/asignaciones.php";
$data = json_encode([
    'id_ficha' => '2277866',
    'id_instructor' => 5
]);

$options = [
    'http' => [
        'method' => 'POST',
        'header' => "Content-Type: application/json\r\n",
        'content' => $data,
        'ignore_errors' => true
    ]
];

$context = stream_context_create($options);
$response = @file_get_contents($url, false, $context);

if ($response) {
    $result = json_decode($response, true);
    if ($result && isset($result['success'])) {
        if ($result['success']) {
            echo "✅ POST funciona correctamente\n";
        } else {
            echo "⚠️  POST devolvió: {$result['message']}\n";
        }
    } else {
        echo "❌ Respuesta inválida\n";
    }
} else {
    echo "❌ No se pudo conectar\n";
}

echo "\n";

// TEST 4: Verificar AuthController con id_instructor
echo "TEST 4: Login con id_instructor\n";
echo "--------------------------------\n";

$url = "http://localhost/YanguasEjercicios/mockups-asist-net/api/auth/login.php";
$loginData = json_encode([
    'correo' => 'camila.arciniellas@example.com',
    'password' => 'camila123'
]);

$options = [
    'http' => [
        'method' => 'POST',
        'header' => "Content-Type: application/json\r\n",
        'content' => $loginData,
        'ignore_errors' => true
    ]
];

$context = stream_context_create($options);
$response = @file_get_contents($url, false, $context);

if ($response) {
    $result = json_decode($response, true);
    if ($result && $result['data']) {
        if (isset($result['data']['id_instructor'])) {
            echo "✅ Login incluye id_instructor: {$result['data']['id_instructor']}\n";
        } else {
            echo "❌ Login NO incluye id_instructor\n";
        }
        echo "   Datos devueltos: " . implode(', ', array_keys($result['data'])) . "\n";
    } else {
        echo "❌ Login falló: " . ($result['message'] ?? 'Sin mensaje') . "\n";
    }
} else {
    echo "❌ No se pudo conectar\n";
}

echo "\n";

// TEST 5: Resumen de archivos críticos
echo "TEST 5: Verificar archivos críticos\n";
echo "------------------------------------\n";

$files = [
    'api/get-instructor-id.php',
    'api/instructor-asignaciones.php',
    'api/asignaciones.php',
    'api/controllers/AuthController.php',
    'js/shared/auth.js',
    'js/instructor/instructor-dashboard.js',
    'js/instructor/instructor-registrar.js'
];

foreach ($files as $file) {
    $path = __DIR__ . '/../' . $file;
    if (file_exists($path)) {
        echo "✅ $file existe\n";
    } else {
        echo "❌ $file NO EXISTE\n";
    }
}

echo "\n=== FIN DEL TESTING ===\n";
?>
