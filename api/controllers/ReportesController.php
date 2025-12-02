<?php
/**
 * Controlador de Reportes
 * Genera reportes de asistencias desde la base de datos
 */

require_once __DIR__ . '/../config/Database.php';

class ReportesController {
    private $db;
    private $conn;

    public function __construct() {
        $this->db = new Database();
        $this->conn = $this->db->getConnection();
    }

    /**
     * Generar reporte de asistencias
     */
    public function generarReporte($tipo, $ficha, $fechaInicio, $fechaFin) {
        try {
            // Por ahora, como no hay tabla de asistencias con datos, 
            // generamos reporte basado en fichas y aprendices
            
            $query = "
                SELECT 
                    f.numero_ficha as ficha,
                    f.nombre_programa as programa,
                    COUNT(a.id_aprendiz) as total_aprendices,
                    0 as asistencias,
                    COUNT(a.id_aprendiz) as inasistencias,
                    '0%' as porcentaje
                FROM fichas f
                LEFT JOIN aprendices a ON f.numero_ficha = a.id_ficha
            ";
            
            // Filtrar por ficha si se especifica
            if (!empty($ficha)) {
                $query .= " WHERE f.numero_ficha = :ficha";
            }
            
            $query .= " GROUP BY f.numero_ficha, f.nombre_programa";
            $query .= " ORDER BY f.numero_ficha";
            
            $stmt = $this->conn->prepare($query);
            
            if (!empty($ficha)) {
                $stmt->execute([':ficha' => $ficha]);
            } else {
                $stmt->execute();
            }
            
            $datos = $stmt->fetchAll();
            
            return [
                'success' => true,
                'tipo' => $tipo,
                'periodo' => "$fechaInicio a $fechaFin",
                'ficha' => $ficha ?: 'Todas',
                'datos' => $datos
            ];
            
        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Error al generar reporte: ' . $e->getMessage()
            ];
        }
    }
}
?>
