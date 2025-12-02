<?php
require_once __DIR__ . '/../config/Database.php';

class AprendicesController {
    private $db;
    private $conn;

    public function __construct() {
        $this->db = new Database();
        $this->conn = $this->db->getConnection();
    }

    /**
     * Obtener todos los aprendices
     */
    public function getAll() {
        try {
            $sql = "SELECT a.*, f.numero_ficha, p.nombre_programa 
                    FROM aprendices a
                    LEFT JOIN fichas f ON a.id_ficha = f.id_ficha
                    LEFT JOIN programas_formacion p ON f.id_programa = p.id_programa
                    ORDER BY a.nombre ASC";
            $stmt = $this->conn->query($sql);
            $aprendices = $stmt->fetchAll();

            return $this->response(200, 'Aprendices obtenidos', $aprendices);
        } catch(PDOException $e) {
            return $this->response(500, 'Error: ' . $e->getMessage());
        }
    }

    /**
     * Obtener aprendiz por ID
     */
    public function getById($id) {
        try {
            $sql = "SELECT a.*, f.numero_ficha, p.nombre_programa 
                    FROM aprendices a
                    LEFT JOIN fichas f ON a.id_ficha = f.id_ficha
                    LEFT JOIN programas_formacion p ON f.id_programa = p.id_programa
                    WHERE a.id_aprendiz = :id";
            $stmt = $this->conn->prepare($sql);
            $stmt->execute([':id' => $id]);
            $aprendiz = $stmt->fetch();

            if ($aprendiz) {
                return $this->response(200, 'Aprendiz encontrado', $aprendiz);
            }
            return $this->response(404, 'Aprendiz no encontrado');
        } catch(PDOException $e) {
            return $this->response(500, 'Error: ' . $e->getMessage());
        }
    }

    /**
     * Obtener aprendices por ficha
     */
    public function getByFicha($id_ficha) {
        try {
            $sql = "SELECT * FROM aprendices WHERE id_ficha = :id_ficha AND estado = 1 ORDER BY nombre ASC";
            $stmt = $this->conn->prepare($sql);
            $stmt->execute([':id_ficha' => $id_ficha]);
            $aprendices = $stmt->fetchAll();

            return $this->response(200, 'Aprendices obtenidos', $aprendices);
        } catch(PDOException $e) {
            return $this->response(500, 'Error: ' . $e->getMessage());
        }
    }

    /**
     * Crear nuevo aprendiz
     */
    public function create($data) {
        try {
            $sql = "INSERT INTO aprendices (tipo_identificacion, documento, nombre, apellido, correo, celular, id_ficha, estado) 
                    VALUES (:tipo_identificacion, :documento, :nombre, :apellido, :correo, :celular, :id_ficha, :estado)";
            
            $stmt = $this->conn->prepare($sql);
            $result = $stmt->execute([
                ':tipo_identificacion' => $data['tipo_identificacion'] ?? 'CC',
                ':documento' => $data['documento'],
                ':nombre' => $data['nombre'],
                ':apellido' => $data['apellido'],
                ':correo' => $data['correo'] ?? null,
                ':celular' => $data['celular'] ?? null,
                ':id_ficha' => $data['numero_ficha'], // El form envía numero_ficha
                ':estado' => $data['estado'] ?? 'En Formación'
            ]);

            if ($result) {
                $id = $this->conn->lastInsertId();
                return $this->response(201, 'Aprendiz creado exitosamente', ['id_aprendiz' => $id]);
            }
            return $this->response(400, 'Error al crear aprendiz');
        } catch(PDOException $e) {
            if ($e->getCode() == 23000) {
                return $this->response(409, 'El documento ya está registrado');
            }
            return $this->response(500, 'Error: ' . $e->getMessage());
        }
    }

    /**
     * Actualizar aprendiz
     */
    public function update($id, $data) {
        try {
            $sql = "UPDATE aprendices SET documento = :documento, nombre = :nombre, 
                    apellido = :apellido, correo = :correo, id_ficha = :id_ficha, 
                    estado = :estado WHERE id_aprendiz = :id";
            
            $stmt = $this->conn->prepare($sql);
            $result = $stmt->execute([
                ':id' => $id,
                ':documento' => $data['documento'],
                ':nombre' => $data['nombre'],
                ':apellido' => $data['apellido'],
                ':correo' => $data['correo'] ?? null,
                ':id_ficha' => $data['id_ficha'],
                ':estado' => $data['estado']
            ]);

            if ($result) {
                return $this->response(200, 'Aprendiz actualizado exitosamente');
            }
            return $this->response(400, 'Error al actualizar aprendiz');
        } catch(PDOException $e) {
            return $this->response(500, 'Error: ' . $e->getMessage());
        }
    }

    /**
     * Eliminar aprendiz (soft delete)
     */
    public function delete($id) {
        try {
            $sql = "UPDATE aprendices SET estado = 0 WHERE id_aprendiz = :id";
            $stmt = $this->conn->prepare($sql);
            $result = $stmt->execute([':id' => $id]);

            if ($result) {
                return $this->response(200, 'Aprendiz eliminado exitosamente');
            }
            return $this->response(400, 'Error al eliminar aprendiz');
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
