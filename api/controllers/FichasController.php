<?php
require_once __DIR__ . '/../config/Database.php';

class FichasController {
    private $db;
    private $conn;

    public function __construct() {
        $this->db = new Database();
        $this->conn = $this->db->getConnection();
    }

    public function getAll() {
        try {
            // Consulta simplificada para asegurar que se muestren los datos
            $sql = "SELECT f.*, 
                    COALESCE(p.nivel_formacion, 'No definido') as nivel_formacion,
                    (SELECT COUNT(*) FROM aprendices WHERE id_ficha = f.id_ficha AND estado = 1) as total_aprendices
                    FROM fichas f
                    LEFT JOIN programas_formacion p ON f.nombre_programa = p.nombre_programa
                    ORDER BY f.numero_ficha DESC";
            $stmt = $this->conn->query($sql);
            $fichas = $stmt->fetchAll();

            return $this->response(200, 'Fichas obtenidas', $fichas);
        } catch(PDOException $e) {
            return $this->response(500, 'Error: ' . $e->getMessage());
        }
    }

    public function getById($id) {
        try {
            $sql = "SELECT f.*, p.nivel_formacion 
                    FROM fichas f
                    LEFT JOIN programas_formacion p ON f.nombre_programa = p.nombre_programa
                    WHERE f.id_ficha = :id";
            $stmt = $this->conn->prepare($sql);
            $stmt->execute([':id' => $id]);
            $ficha = $stmt->fetch();

            if ($ficha) {
                return $this->response(200, 'Ficha encontrada', $ficha);
            }
            return $this->response(404, 'Ficha no encontrada');
        } catch(PDOException $e) {
            return $this->response(500, 'Error: ' . $e->getMessage());
        }
    }

    public function create($data) {
        try {
            // 1. Validar si ya existe la ficha
            $checkSql = "SELECT id_ficha FROM fichas WHERE numero_ficha = :numero_ficha";
            $checkStmt = $this->conn->prepare($checkSql);
            $checkStmt->execute([':numero_ficha' => $data['numero_ficha']]);
            
            if ($checkStmt->fetch()) {
                return $this->response(409, 'El número de ficha ' . $data['numero_ficha'] . ' ya existe');
            }

            $sql = "INSERT INTO fichas (numero_ficha, nombre_programa, jornada, estado) 
                    VALUES (:numero_ficha, :nombre_programa, :jornada, :estado)";
            
            $stmt = $this->conn->prepare($sql);
            $result = $stmt->execute([
                ':numero_ficha' => $data['numero_ficha'],
                ':nombre_programa' => $data['nombre_programa'] ?? '',
                ':jornada' => $data['jornada'] ?? 'Diurna',
                ':estado' => $data['estado'] ?? 'Activa'
            ]);

            if ($result) {
                $id = $this->conn->lastInsertId();
                
                // --- SINCRONIZACIÓN CON PROGRAMAS_FORMACION ---
                if (!empty($data['nombre_programa'])) {
                    try {
                        $checkSql = "SELECT id_programa FROM programas_formacion WHERE nombre_programa = :nombre";
                        $checkStmt = $this->conn->prepare($checkSql);
                        $checkStmt->execute([':nombre' => $data['nombre_programa']]);
                        
                        if (!$checkStmt->fetch()) {
                            $insertProgSql = "INSERT INTO programas_formacion (nombre_programa, nivel_formacion) VALUES (:nombre, 'Tecnólogo')";
                            $insertProgStmt = $this->conn->prepare($insertProgSql);
                            $insertProgStmt->execute([':nombre' => $data['nombre_programa']]);
                        }
                    } catch (Exception $e) {
                        error_log("Nota: Error al sincronizar programa: " . $e->getMessage());
                    }
                }
                // ----------------------------------------------

                return $this->response(201, 'Ficha creada exitosamente', ['id_ficha' => $id]);
            }
            return $this->response(400, 'Error al crear ficha');
        } catch(PDOException $e) {
            if ($e->getCode() == 23000) {
                return $this->response(409, 'El número de ficha ya existe');
            }
            return $this->response(500, 'Error: ' . $e->getMessage());
        }
    }

    public function update($id, $data) {
        try {
            $sql = "UPDATE fichas SET numero_ficha = :numero_ficha, nombre_programa = :nombre_programa, 
                    jornada = :jornada, estado = :estado WHERE id_ficha = :id";
            
            $stmt = $this->conn->prepare($sql);
            $result = $stmt->execute([
                ':id' => $id,
                ':numero_ficha' => $data['numero_ficha'],
                ':nombre_programa' => $data['nombre_programa'],
                ':jornada' => $data['jornada'],
                ':estado' => $data['estado']
            ]);

            if ($result) {
                return $this->response(200, 'Ficha actualizada exitosamente');
            }
            return $this->response(400, 'Error al actualizar ficha');
        } catch(PDOException $e) {
            return $this->response(500, 'Error: ' . $e->getMessage());
        }
    }

    public function delete($id) {
        try {
            $sql = "UPDATE fichas SET estado = 0 WHERE id_ficha = :id";
            $stmt = $this->conn->prepare($sql);
            $result = $stmt->execute([':id' => $id]);

            if ($result) {
                return $this->response(200, 'Ficha eliminada exitosamente');
            }
            return $this->response(400, 'Error al eliminar ficha');
        } catch(PDOException $e) {
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
