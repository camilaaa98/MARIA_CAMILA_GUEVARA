<?php
require_once __DIR__ . '/../config/Database.php';

class ProgramasController {
    private $db;
    private $conn;

    public function __construct() {
        $this->db = new Database();
        $this->conn = $this->db->getConnection();
    }

    public function getAll() {
        try {
            $sql = "SELECT * FROM programas_formacion ORDER BY nombre_programa ASC";
            $stmt = $this->conn->query($sql);
            $programas = $stmt->fetchAll();

            return $this->response(200, 'Programas obtenidos', $programas);
        } catch(PDOException $e) {
            return $this->response(500, 'Error: ' . $e->getMessage());
        }
    }

    public function getById($id) {
        try {
            $sql = "SELECT * FROM programas_formacion WHERE id_programa = :id";
            $stmt = $this->conn->prepare($sql);
            $stmt->execute([':id' => $id]);
            $programa = $stmt->fetch();

            if ($programa) {
                return $this->response(200, 'Programa encontrado', $programa);
            }
            return $this->response(404, 'Programa no encontrado');
        } catch(PDOException $e) {
            return $this->response(500, 'Error: ' . $e->getMessage());
        }
    }

    public function create($data) {
        try {
            $sql = "INSERT INTO programas_formacion (codigo_programa, nombre_programa, nivel_formacion, jornada, estado) 
                    VALUES (:codigo_programa, :nombre_programa, :nivel_formacion, :jornada, :estado)";
            
            $stmt = $this->conn->prepare($sql);
            $result = $stmt->execute([
                ':codigo_programa' => $data['codigo_programa'],
                ':nombre_programa' => $data['nombre_programa'],
                ':nivel_formacion' => $data['nivel_formacion'],
                ':jornada' => $data['jornada'] ?? 'Mixta',
                ':estado' => $data['estado'] ?? 'Activo'
            ]);

            if ($result) {
                $id = $this->conn->lastInsertId();
                return $this->response(201, 'Programa creado exitosamente', ['id_programa' => $id]);
            }
            return $this->response(400, 'Error al crear programa');
        } catch(PDOException $e) {
            return $this->response(500, 'Error: ' . $e->getMessage());
        }
    }

    public function update($id, $data) {
        try {
            $sql = "UPDATE programas_formacion SET nombre_programa = :nombre_programa, 
                    nivel_formacion = :nivel_formacion WHERE id_programa = :id";
            
            $stmt = $this->conn->prepare($sql);
            $result = $stmt->execute([
                ':id' => $id,
                ':nombre_programa' => $data['nombre_programa'],
                ':nivel_formacion' => $data['nivel_formacion']
            ]);

            if ($result) {
                return $this->response(200, 'Programa actualizado exitosamente');
            }
            return $this->response(400, 'Error al actualizar programa');
        } catch(PDOException $e) {
            return $this->response(500, 'Error: ' . $e->getMessage());
        }
    }

    public function delete($id) {
        try {
            $sql = "DELETE FROM programas_formacion WHERE id_programa = :id";
            $stmt = $this->conn->prepare($sql);
            $result = $stmt->execute([':id' => $id]);

            if ($result) {
                return $this->response(200, 'Programa eliminado exitosamente');
            }
            return $this->response(400, 'Error al eliminar programa');
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
