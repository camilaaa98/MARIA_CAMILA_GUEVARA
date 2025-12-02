<?php
require_once __DIR__ . '/../config/Database.php';

class AsistenciasController {
    private $db;
    private $conn;

    public function __construct() {
        $this->db = new Database();
        $this->conn = $this->db->getConnection();
    }

    public function getAll($filters = []) {
        try {
            $sql = "SELECT a.*, ap.nombre as nombre_aprendiz, ap.apellido as apellido_aprendiz, 
                    ap.documento, f.numero_ficha, u.nombre as nombre_instructor, u.apellido as apellido_instructor
                    FROM asistencias a
                    JOIN aprendices ap ON a.id_aprendiz = ap.id_aprendiz
                    JOIN fichas f ON ap.id_ficha = f.id_ficha
                    JOIN usuarios u ON a.id_usuario = u.id_usuario
                    WHERE 1=1";

            $params = [];

            if (!empty($filters['fecha'])) {
                $sql .= " AND a.fecha = :fecha";
                $params[':fecha'] = $filters['fecha'];
            }

            if (!empty($filters['id_ficha'])) {
                $sql .= " AND f.id_ficha = :id_ficha";
                $params[':id_ficha'] = $filters['id_ficha'];
            }

            if (!empty($filters['id_aprendiz'])) {
                $sql .= " AND a.id_aprendiz = :id_aprendiz";
                $params[':id_aprendiz'] = $filters['id_aprendiz'];
            }

            $sql .= " ORDER BY a.fecha DESC, a.hora_entrada DESC";

            $stmt = $this->conn->prepare($sql);
            $stmt->execute($params);
            $asistencias = $stmt->fetchAll();

            return $this->response(200, 'Asistencias obtenidas', $asistencias);
        } catch(PDOException $e) {
            return $this->response(500, 'Error: ' . $e->getMessage());
        }
    }

    public function getByFecha($fecha) {
        return $this->getAll(['fecha' => $fecha]);
    }

    public function create($data) {
        try {
            $sql = "INSERT INTO asistencias (id_aprendiz, id_usuario, fecha, hora_entrada, hora_salida, tipo, observaciones) 
                    VALUES (:id_aprendiz, :id_usuario, :fecha, :hora_entrada, :hora_salida, :tipo, :observaciones)";
            
            $stmt = $this->conn->prepare($sql);
            $result = $stmt->execute([
                ':id_aprendiz' => $data['id_aprendiz'],
                ':id_usuario' => $data['id_usuario'],
                ':fecha' => $data['fecha'],
                ':hora_entrada' => $data['hora_entrada'],
                ':hora_salida' => $data['hora_salida'] ?? null,
                ':tipo' => $data['tipo'],
                ':observaciones' => $data['observaciones'] ?? null
            ]);

            if ($result) {
                $id = $this->conn->lastInsertId();
                return $this->response(201, 'Asistencia registrada exitosamente', ['id_asistencia' => $id]);
            }
            return $this->response(400, 'Error al registrar asistencia');
        } catch(PDOException $e) {
            return $this->response(500, 'Error: ' . $e->getMessage());
        }
    }

    public function update($id, $data) {
        try {
            $sql = "UPDATE asistencias SET hora_salida = :hora_salida, tipo = :tipo, 
                    observaciones = :observaciones WHERE id_asistencia = :id";
            
            $stmt = $this->conn->prepare($sql);
            $result = $stmt->execute([
                ':id' => $id,
                ':hora_salida' => $data['hora_salida'] ?? null,
                ':tipo' => $data['tipo'],
                ':observaciones' => $data['observaciones'] ?? null
            ]);

            if ($result) {
                return $this->response(200, 'Asistencia actualizada exitosamente');
            }
            return $this->response(400, 'Error al actualizar asistencia');
        } catch(PDOException $e) {
            return $this->response(500, 'Error: ' . $e->getMessage());
        }
    }

    public function getReporte($fecha_inicio, $fecha_fin, $id_ficha = null) {
        try {
            $sql = "SELECT 
                    ap.documento,
                    ap.nombre || ' ' || ap.apellido as nombre_completo,
                    f.numero_ficha,
                    COUNT(a.id_asistencia) as total_asistencias,
                    SUM(CASE WHEN a.tipo IN ('entrada', 'completa') THEN 1 ELSE 0 END) as asistencias_entrada,
                    SUM(CASE WHEN a.tipo = 'completa' THEN 1 ELSE 0 END) as asistencias_completas
                    FROM aprendices ap
                    JOIN fichas f ON ap.id_ficha = f.id_ficha
                    LEFT JOIN asistencias a ON ap.id_aprendiz = a.id_aprendiz 
                    AND a.fecha BETWEEN :fecha_inicio AND :fecha_fin
                    WHERE ap.estado = 1";

            $params = [
                ':fecha_inicio' => $fecha_inicio,
                ':fecha_fin' => $fecha_fin
            ];

            if ($id_ficha) {
                $sql .= " AND f.id_ficha = :id_ficha";
                $params[':id_ficha'] = $id_ficha;
            }

            $sql .= " GROUP BY ap.id_aprendiz ORDER BY f.numero_ficha, ap.nombre";

            $stmt = $this->conn->prepare($sql);
            $stmt->execute($params);
            $reporte = $stmt->fetchAll();

            return $this->response(200, 'Reporte generado', $reporte);
        } catch(PDOException $e) {
            return $this->response(500, 'Error: ' . $e->getMessage());
        }
    }

    /**
     * Obtener estadísticas de asistencia de hoy para un instructor
     */
    public function getStatsHoy($id_instructor) {
        try {
            $hoy = date('Y-m-d');
            $diaSemana = date('N'); // 1 (Lunes) a 7 (Domingo)
            
            // 1. Obtener fichas que tienen horario HOY con este instructor
            $sqlHorario = "SELECT DISTINCT id_ficha FROM horarios_formacion 
                          WHERE id_instructor = :id_instructor 
                          AND dia_semana = :dia_semana";
            $stmtHorario = $this->conn->prepare($sqlHorario);
            $stmtHorario->execute([
                ':id_instructor' => $id_instructor,
                ':dia_semana' => $diaSemana
            ]);
            $fichasHoy = $stmtHorario->fetchAll(PDO::FETCH_COLUMN);
            
            // Si no hay horario hoy, verificar si tiene asignaciones generales (fallback por compatibilidad)
            // O si queremos ser estrictos, retornamos 0.
            // Por ahora, si la tabla horarios_formacion está vacía (recién creada), 
            // mantenemos el comportamiento anterior para no romper nada mientras se llenan los datos.
            
            $sqlCheckHorarios = "SELECT COUNT(*) FROM horarios_formacion";
            $hasHorarios = $this->conn->query($sqlCheckHorarios)->fetchColumn() > 0;
            
            if ($hasHorarios && empty($fichasHoy)) {
                return $this->response(200, 'No tiene formación programada para hoy', [
                    'total_aprendices' => 0,
                    'total_asistencias' => 0,
                    'porcentaje' => 0,
                    'mensaje' => 'No hay clases programadas para hoy'
                ]);
            }
            
            // Si hay horarios definidos, usamos $fichasHoy. Si no, usamos todas las asignadas (fallback)
            $fichas = $hasHorarios ? $fichasHoy : [];
            
            if (!$hasHorarios) {
                // Fallback: Obtener todas las fichas asignadas
                $sqlFichas = "SELECT id_ficha FROM asignaciones_instructor_ficha WHERE id_instructor = :id_instructor";
                $stmtFichas = $this->conn->prepare($sqlFichas);
                $stmtFichas->execute([':id_instructor' => $id_instructor]);
                $fichas = $stmtFichas->fetchAll(PDO::FETCH_COLUMN);
            }
            
            if (empty($fichas)) {
                return $this->response(200, 'Sin fichas asignadas', [
                    'total_aprendices' => 0,
                    'total_asistencias' => 0,
                    'porcentaje' => 0
                ]);
            }
            
            // Convertir array a string para IN clause
            $fichasPlaceholders = implode(',', array_fill(0, count($fichas), '?'));
            
            // Contar total de aprendices activos en las fichas DE HOY
            $sqlTotal = "SELECT COUNT(*) as total 
                        FROM aprendices 
                        WHERE id_ficha IN ($fichasPlaceholders) 
                        AND estado = 1";
            $stmtTotal = $this->conn->prepare($sqlTotal);
            $stmtTotal->execute($fichas);
            $totalAprendices = $stmtTotal->fetch()['total'];
            
            if ($totalAprendices == 0) {
                return $this->response(200, 'Sin aprendices', [
                    'total_aprendices' => 0,
                    'total_asistencias' => 0,
                    'porcentaje' => 0
                ]);
            }
            
            // Contar asistencias de hoy
            $sqlAsistencias = "SELECT COUNT(DISTINCT a.id_aprendiz) as total
                              FROM asistencias a
                              JOIN aprendices ap ON a.id_aprendiz = ap.id_aprendiz
                              WHERE ap.id_ficha IN ($fichasPlaceholders)
                              AND a.fecha = ?
                              AND a.tipo IN ('entrada', 'completa')";
            
            $params = array_merge($fichas, [$hoy]);
            $stmtAsistencias = $this->conn->prepare($sqlAsistencias);
            $stmtAsistencias->execute($params);
            $totalAsistencias = $stmtAsistencias->fetch()['total'];
            
            // Calcular porcentaje
            $porcentaje = $totalAprendices > 0 ? round(($totalAsistencias / $totalAprendices) * 100, 1) : 0;
            
            return $this->response(200, 'Estadísticas obtenidas', [
                'fecha' => $hoy,
                'total_aprendices' => (int)$totalAprendices,
                'total_asistencias' => (int)$totalAsistencias,
                'porcentaje' => (float)$porcentaje,
                'fichas_hoy' => count($fichas)
            ]);
        } catch(PDOException $e) {
            error_log("Error en getStatsHoy: " . $e->getMessage());
            return $this->response(500, 'Error: ' . $e->getMessage());
        }
    }

    private function response($status, $message, $data = null) {
        http_response_code($status);
        $response = ['message' => $message];
        if ($data !== null) {
            $response['data'] = $data;
        }
        return json_encode($response);
    }
}
?>
