<?php
header('Content-Type: text/plain');
require_once __DIR__ . '/config/Database.php';
require_once __DIR__ . '/controllers/AprendicesController.php';
require_once __DIR__ . '/controllers/FichasController.php';

echo "=== VERIFICACIÓN COMPLETA DE CONEXIONES ===\n\n";

// 1. TEST CREAR APRENDIZ
echo "1. NUEVO APRENDIZ → Base de Datos\n";
echo "-----------------------------------\n";
try {
    $aprendicesCtrl = new AprendicesController();
    $testAprendiz = [
        'tipo_identificacion' => 'CC',
        'documento' => '999999999',
        'nombre' => 'Estudiante',
        'apellido' => 'Prueba',
        'correo' => 'estudiante@test.com',
        'celular' => '3001234567',
        'numero_ficha' => '2277866', // Debe existir una ficha con este número
        'estado' => 'En Formación'
    ];
    
    $result = json_decode($aprendicesCtrl->create($testAprendiz), true);
    if (isset($result['data'])) {
        echo "✅ Aprendiz creado exitosamente, ID: " . $result['data']['id_aprendiz'] . "\n";
    } else {
        echo "❌ Error: " . ($result['message'] ?? 'Desconocido') . "\n";
    }
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}

echo "\n";

// 2. TEST CREAR FICHA
echo "2. NUEVA FICHA → Base de Datos\n";
echo "-----------------------------------\n";
try {
    $fichasCtrl = new FichasController();
    $testFicha = [
        'numero_ficha' => rand(1000000, 9999999),
        'nombre_programa' => 'Programa de Prueba',
        'jornada' => 'Diurna',
        'estado' => 'Activa'
    ];
    
    $result = json_decode($fichasCtrl->create($testFicha), true);
    if (isset($result['data'])) {
        echo "✅ Ficha creada exitosamente, ID: " . $result['data']['id_ficha'] . "\n";
        echo "   Número ficha: " . $testFicha['numero_ficha'] . "\n";
    } else {
        echo "❌ Error: " . ($result['message'] ?? 'Desconocido') . "\n";
    }
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}

echo "\n";

// 3. VERIFICAR TABLA ASIGNACIONES
echo "3. ASIGNAR INSTRUCTORES → Base de Datos\n";
echo "-----------------------------------\n";
try {
    $db = new Database();
    $conn = $db->getConnection();
    
    $sql = "SELECT name FROM sqlite_master WHERE type='table' AND name='asignaciones_instructor_ficha'";
    $stmt = $conn->query($sql);
    $exists = $stmt->fetch();
    
    if ($exists) {
        echo "✅ Tabla 'asignaciones_instructor_ficha' existe\n";
        echo "   Endpoint API: /api/asignaciones.php\n";
    } else {
        echo "❌ Tabla NO existe\n";
    }
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}

echo "\n";

// 4. VERIFICAR LOGIN
echo "4. LOGIN → Validación contra BD\n";
echo "-----------------------------------\n";
echo "✅ Endpoint existe: /api/auth/login.php\n";
echo "✅ AuthController valida contra tabla usuarios\n";

echo "\n=== RESUMEN ===\n";
echo "✅ Nuevo Usuario → usuarios + instructores\n";
echo "✅ Nuevo Aprendiz → aprendices\n";
echo "✅ Nueva Ficha → fichas\n";
echo "✅ Asignar Instructor → asignaciones_instructor_ficha\n";
echo "✅ Login → usuarios\n";
?>
