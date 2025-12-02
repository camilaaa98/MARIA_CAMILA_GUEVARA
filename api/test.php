<?php
header('Content-Type: application/json');
echo json_encode([
    'success' => true,
    'message' => 'API funcionando correctamente',
    'total_aprendices' => 1886,
    'fichas_activas' => 72,
    'total_programas' => 40,
    'asistencia_promedio' => 0
]);
?>
