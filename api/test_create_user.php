<?php
// Test manual de crear usuario
header('Content-Type: application/json');
require_once __DIR__ . '/controllers/UsuariosController.php';

$controller = new UsuariosController();

$testData = [
    'nombre' => 'Franl',
    'apellido' => 'Perez',
    'correo' => 'frank@sena.edu.co',
    'password' => '123456',
    'rol' => 'instructor',
    'estado' => 1
];

echo $controller->create($testData);
?>
