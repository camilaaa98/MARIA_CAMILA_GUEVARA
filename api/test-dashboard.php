<?php
header('Content-Type: application/json');

require_once __DIR__ . '/controllers/DashboardController.php';

try {
    $controller = new DashboardController();
    $result = $controller->getStats();
    echo json_encode($result);
} catch (Exception $e) {
    echo json_encode([
        'error' => true,
        'message' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
    ]);
}
?>
