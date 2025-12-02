<?php
require_once __DIR__ . '/config/Database.php';

// Obtener parámetros
$tipo = $_GET['tipo'] ?? 'general';
$ficha = $_GET['ficha'] ?? '';
$fechaInicio = $_GET['fechaInicio'] ?? '';
$fechaFin = $_GET['fechaFin'] ?? '';

// Configurar headers para descarga Excel
header("Content-Type: application/vnd.ms-excel; charset=utf-8");
header("Content-Disposition: attachment; filename=Reporte_Asistencia_" . date('Y-m-d_H-i') . ".xls");
header("Pragma: no-cache");
header("Expires: 0");

try {
    $db = new Database();
    $conn = $db->getConnection();
    
    // Construir consulta base
    $sql = "SELECT a.fecha, a.numero_ficha, p.nombre_programa, 
            (u.nombre || ' ' || u.apellido) as instructor,
            a.asistieron, a.faltaron, (a.asistieron + a.faltaron) as total
            FROM asistencias a
            LEFT JOIN fichas f ON a.numero_ficha = f.numero_ficha
            LEFT JOIN programas p ON f.codigo_programa = p.codigo_programa
            LEFT JOIN usuarios u ON a.id_instructor = u.id_usuario
            WHERE 1=1";
            
    $params = [];
    
    if (!empty($ficha)) {
        $sql .= " AND a.numero_ficha = ?";
        $params[] = $ficha;
    }
    
    if (!empty($fechaInicio)) {
        $sql .= " AND a.fecha >= ?";
        $params[] = $fechaInicio;
    }
    
    if (!empty($fechaFin)) {
        $sql .= " AND a.fecha <= ?";
        $params[] = $fechaFin;
    }
    
    $sql .= " ORDER BY a.fecha DESC";
    
    $stmt = $conn->prepare($sql);
    $stmt->execute($params);
    $datos = $stmt->fetchAll(PDO::FETCH_ASSOC);

} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
    exit;
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <style>
        table { border-collapse: collapse; width: 100%; font-family: Arial, sans-serif; }
        th { background-color: #FF6B00; color: white; border: 1px solid #000; padding: 10px; }
        td { border: 1px solid #000; padding: 8px; text-align: center; }
        .header { font-size: 18px; font-weight: bold; margin-bottom: 20px; text-align: center; }
        .meta { margin-bottom: 10px; }
    </style>
</head>
<body>
    <div class="header">Reporte de Asistencias - AsistNet</div>
    <div class="meta">
        <p>Generado el: <?php echo date('d/m/Y H:i'); ?></p>
        <p>Tipo: <?php echo ucfirst($tipo); ?></p>
    </div>
    
    <table>
        <thead>
            <tr>
                <th>Fecha</th>
                <th>Ficha</th>
                <th>Programa</th>
                <th>Instructor</th>
                <th>Asistieron</th>
                <th>Faltaron</th>
                <th>Total</th>
                <th>% Asistencia</th>
            </tr>
        </thead>
        <tbody>
            <?php if (empty($datos)): ?>
            <tr><td colspan="8">No se encontraron registros</td></tr>
            <?php else: ?>
                <?php foreach ($datos as $row): 
                    $porcentaje = $row['total'] > 0 ? round(($row['asistieron'] / $row['total']) * 100, 1) : 0;
                ?>
                <tr>
                    <td><?php echo $row['fecha']; ?></td>
                    <td style="mso-number-format:'@'"><?php echo $row['numero_ficha']; ?></td>
                    <td><?php echo utf8_decode($row['nombre_programa']); ?></td>
                    <td><?php echo utf8_decode($row['instructor']); ?></td>
                    <td><?php echo $row['asistieron']; ?></td>
                    <td><?php echo $row['faltaron']; ?></td>
                    <td><?php echo $row['total']; ?></td>
                    <td><?php echo $porcentaje; ?>%</td>
                </tr>
                <?php endforeach; ?>
            <?php endif; ?>
        </tbody>
    </table>
</body>
</html>
