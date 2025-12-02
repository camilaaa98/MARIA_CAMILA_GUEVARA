<?php
require_once __DIR__ . '/../api/config/Database.php';

try {
    $db = new Database();
    $conn = $db->getConnection();
    
    // Crear tabla horarios_formacion
    $sql = "CREATE TABLE IF NOT EXISTS horarios_formacion (
        id_horario INTEGER PRIMARY KEY AUTOINCREMENT,
        id_ficha INTEGER NOT NULL,
        id_instructor INTEGER NOT NULL,
        dia_semana INTEGER NOT NULL, -- 1=Lunes, 7=Domingo
        hora_inicio TEXT NOT NULL, -- HH:MM
        hora_fin TEXT NOT NULL, -- HH:MM
        FOREIGN KEY (id_ficha) REFERENCES fichas(id_ficha),
        FOREIGN KEY (id_instructor) REFERENCES instructores(id_instructor)
    )";
    
    $conn->exec($sql);
    echo "Tabla 'horarios_formacion' creada exitosamente.\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
