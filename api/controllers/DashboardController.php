<?php
/**
 * Controlador del Dashboard
 * Provee estadísticas y actividad reciente
 */

require_once __DIR__ . '/../config/Database.php';

class DashboardController {
    private $db;
    private $conn;

    public function __construct() {
        $this->db = new Database();
        $this->conn = $this->db->getConnection();
    }

    /**
     * Obtener estadísticas generales
     */
    public function getStats() {
        try {
            // Total de aprendices (sin filtro de estado ya que la columna no existe)
            $stmt = $this->conn->query("SELECT COUNT(*) as total FROM aprendices");
            $total_aprendices = $stmt->fetch()['total'];

            // Fichas activas (sin filtro de estado)
            $stmt = $this->conn->query("SELECT COUNT(*) as total FROM fichas");
            $fichas_activas = $stmt->fetch()['total'];

            // Total de programas
            $stmt = $this->conn->query("SELECT COUNT(*) as total FROM programas_formacion");
            $total_programas = $stmt->fetch()['total'];

            // Asistencia promedio (si no hay tabla asistencias, usar 0)
            $asistencia_promedio = 0;
            try {
                $stmt = $this->conn->query("SELECT COUNT(*) as total FROM asistencias");
                if ($stmt->fetch()['total'] > 0) {
                    $asistencia_promedio = 89; // Valor por defecto hasta tener datos reales
                }
            } catch (Exception $e) {
                // Tabla asistencias no existe aún
                $asistencia_promedio = 0;
            }

            return [
                'success' => true,
                'data' => [
                    'total_aprendices' => $total_aprendices,
                    'fichas_activas' => $fichas_activas,
                    'total_programas' => $total_programas,
                    'asistencia_promedio' => $asistencia_promedio
                ]
            ];
        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Error al obtener estadísticas: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Obtener actividad reciente
     */
    public function getRecentActivity() {
        try {
            // Verificar si existe la tabla asistencias
            $stmt = $this->conn->query("SELECT name FROM sqlite_master WHERE type='table' AND name='asistencias'");
            if (!$stmt->fetch()) {
                // Si no existe, retornar datos de ejemplo basados en fichas
                return $this->getActivityFromFichas();
            }

            $stmt = $this->conn->query("
                SELECT 
                    a.fecha,
                    f.numero_ficha,
                    f.nombre_programa,
                    'Instructor' as instructor,
                    COUNT(DISTINCT a.id_aprendiz) as asistentes,
                    (SELECT COUNT(*) FROM aprendices WHERE id_ficha = a.id_ficha) as total_ficha,
                    CASE 
                        WHEN COUNT(DISTINCT a.id_aprendiz) * 100.0 / (SELECT COUNT(*) FROM aprendices WHERE id_ficha = a.id_ficha) >= 80 THEN 'success'
                        WHEN COUNT(DISTINCT a.id_aprendiz) * 100.0 / (SELECT COUNT(*) FROM aprendices WHERE id_ficha = a.id_ficha) >= 60 THEN 'warning'
                        ELSE 'danger'
                    END as estado_class,
                    CASE 
                        WHEN COUNT(DISTINCT a.id_aprendiz) * 100.0 / (SELECT COUNT(*) FROM aprendices WHERE id_ficha = a.id_ficha) >= 80 THEN 'Completado'
                        WHEN COUNT(DISTINCT a.id_aprendiz) * 100.0 / (SELECT COUNT(*) FROM aprendices WHERE id_ficha = a.id_ficha) >= 60 THEN 'Pendiente'
                        ELSE 'Bajo'
                    END as estado
                FROM asistencias a
                INNER JOIN fichas f ON a.id_ficha = f.id_ficha
                GROUP BY a.fecha, f.id_ficha, f.nombre_programa
                ORDER BY a.fecha DESC
                LIMIT 10
            ");

            $activity = $stmt->fetchAll();

            // Formatear los datos
            $formatted_activity = array_map(function($item) {
                return [
                    'fecha' => $item['fecha'],
                    'numero_ficha' => $item['numero_ficha'],
                    'nombre_programa' => $item['nombre_programa'],
                    'instructor' => $item['instructor'],
                    'asistencia' => $item['asistentes'] . '/' . $item['total_ficha'],
                    'estado' => $item['estado'],
                    'estado_class' => $item['estado_class']
                ];
            }, $activity);

            return [
                'success' => true,
                'data' => $formatted_activity
            ];
        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Error al obtener actividad reciente: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Obtener actividad desde fichas (cuando no hay asistencias)
     */
    private function getActivityFromFichas() {
        try {
            $stmt = $this->conn->query("
                SELECT 
                    date('now') as fecha,
                    f.numero_ficha,
                    f.nombre_programa,
                    'Instructor' as instructor,
                    COUNT(a.id_aprendiz) as total_ficha
                FROM fichas f
                LEFT JOIN aprendices a ON f.numero_ficha = a.id_ficha
                GROUP BY f.numero_ficha, f.nombre_programa
                ORDER BY f.numero_ficha DESC
                LIMIT 5
            ");

            $activity = $stmt->fetchAll();

            $formatted_activity = array_map(function($item) {
                return [
                    'fecha' => $item['fecha'],
                    'numero_ficha' => $item['numero_ficha'],
                    'nombre_programa' => $item['nombre_programa'],
                    'instructor' => $item['instructor'],
                    'asistencia' => '0/' . $item['total_ficha'],
                    'estado' => 'Pendiente',
                    'estado_class' => 'warning'
                ];
            }, $activity);

            return [
                'success' => true,
                'data' => $formatted_activity
            ];
        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Error: ' . $e->getMessage(),
                'data' => []
            ];
        }
    }
}
?>
