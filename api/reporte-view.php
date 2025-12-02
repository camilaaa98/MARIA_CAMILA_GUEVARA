<?php
require_once __DIR__ . '/config/Database.php';

// Obtener parámetros
$tipo = $_GET['tipo'] ?? 'general';
$ficha = $_GET['ficha'] ?? '';
$fechaInicio = $_GET['fechaInicio'] ?? '';
$fechaFin = $_GET['fechaFin'] ?? '';

try {
    $db = new Database();
    $conn = $db->getConnection();
    
    // Construir consulta (misma lógica que Excel)
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
    <title>Reporte de Asistencia</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 20px; color: #333; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #FF6B00; padding-bottom: 10px; }
        .logo { font-size: 24px; font-weight: bold; color: #FF6B00; }
        .meta { margin-bottom: 20px; font-size: 14px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th { background-color: #f3f4f6; color: #374151; padding: 12px; text-align: left; border-bottom: 2px solid #e5e7eb; font-weight: 600; }
        td { padding: 10px; border-bottom: 1px solid #e5e7eb; }
        tr:nth-child(even) { background-color: #f9fafb; }
        .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #6b7280; }
        
        @media print {
            .no-print { display: none; }
            body { padding: 0; }
            th { background-color: #eee !important; -webkit-print-color-adjust: exact; }
        }
        
        .btn-print {
            background-color: #FF6B00; color: white; border: none; padding: 10px 20px; 
            border-radius: 5px; cursor: pointer; font-size: 16px; margin-bottom: 20px;
        }
        .btn-print:hover { background-color: #e65100; }
    </style>
</head>
<body>
    <div class="no-print" style="text-align: right;">
        <button onclick="window.print()" class="btn-print">🖨️ Imprimir / Guardar como PDF</button>
    </div>

    <div class="header">
        <div class="logo">AsistNet</div>
        <h2>Reporte de Asistencias</h2>
    </div>
    
    <div class="meta">
        <strong>Fecha de Generación:</strong> <?php echo date('d/m/Y H:i'); ?><br>
        <strong>Tipo de Reporte:</strong> <?php echo ucfirst($tipo); ?><br>
        <?php if($ficha): ?><strong>Ficha:</strong> <?php echo $ficha; ?><br><?php endif; ?>
        <?php if($fechaInicio): ?><strong>Desde:</strong> <?php echo $fechaInicio; ?><br><?php endif; ?>
        <?php if($fechaFin): ?><strong>Hasta:</strong> <?php echo $fechaFin; ?><br><?php endif; ?>
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
                <th>%</th>
            </tr>
        </thead>
        <tbody>
            <?php if (empty($datos)): ?>
            <tr><td colspan="8" style="text-align: center;">No se encontraron registros para los criterios seleccionados.</td></tr>
            <?php else: ?>
                <?php foreach ($datos as $row): 
                    $porcentaje = $row['total'] > 0 ? round(($row['asistieron'] / $row['total']) * 100, 1) : 0;
                ?>
                <tr>
                    <td><?php echo $row['fecha']; ?></td>
                    <td><?php echo $row['numero_ficha']; ?></td>
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
    
    <div class="footer">
        Reporte generado automáticamente por el sistema AsistNet.
    </div>
</body>
</html>
