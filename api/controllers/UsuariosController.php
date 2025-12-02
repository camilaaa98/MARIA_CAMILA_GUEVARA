<?php
require_once __DIR__ . '/../config/Database.php';

class UsuariosController {
    private $db;
    private $conn;

    public function __construct() {
        $this->db = new Database();
        $this->conn = $this->db->getConnection();
    }

    /**
     * Obtener todos los usuarios
     */
    public function getAll() {
        try {
            $sql = "SELECT id_usuario, nombre, apellido, correo, rol, estado, creado_en 
                    FROM usuarios ORDER BY creado_en DESC";
            $stmt = $this->conn->query($sql);
            $usuarios = $stmt->fetchAll();

            return $this->response(200, 'Usuarios obtenidos', $usuarios);
        } catch(PDOException $e) {
            return $this->response(500, 'Error: ' . $e->getMessage());
        }
    }

    /**
     * Obtener un usuario por ID
     */
    public function getById($id) {
        try {
            $sql = "SELECT id_usuario, nombre, apellido, correo, rol, estado, creado_en 
                    FROM usuarios WHERE id_usuario = :id";
            $stmt = $this->conn->prepare($sql);
            $stmt->execute([':id' => $id]);
            $usuario = $stmt->fetch();

            if ($usuario) {
                return $this->response(200, 'Usuario encontrado', $usuario);
            }
            return $this->response(404, 'Usuario no encontrado');
        } catch(PDOException $e) {
            return $this->response(500, 'Error: ' . $e->getMessage());
        }
    }

    /**
     * Crear nuevo usuario
     */
    public function create($data) {
        try {
            $sql = "INSERT INTO usuarios (nombre, apellido, correo, password_hash, rol, estado) 
                    VALUES (:nombre, :apellido, :correo, :password_hash, :rol, :estado)";
            
            $stmt = $this->conn->prepare($sql);
            $result = $stmt->execute([
                ':nombre' => $data['nombre'],
                ':apellido' => $data['apellido'],
                ':correo' => $data['correo'],
                ':password_hash' => password_hash($data['password'], PASSWORD_DEFAULT),
                ':rol' => $data['rol'],
                ':estado' => $data['estado'] ?? 1
            ]);

            if ($result) {
                $id_usuario = $this->conn->lastInsertId();

                // Si es instructor, insertar también en la tabla instructores
                if (strtolower($data['rol']) === 'instructor') {
                    try {
                        $sqlInstructor = "INSERT INTO instructores (id_usuario, nombres, apellidos, correo, telefono, estado) 
                                          VALUES (:id_usuario, :nombres, :apellidos, :correo, :telefono, :estado)";
                        $stmtInstructor = $this->conn->prepare($sqlInstructor);
                        $stmtInstructor->execute([
                            ':id_usuario' => $id_usuario,
                            ':nombres' => $data['nombre'],
                            ':apellidos' => $data['apellido'],
                            ':correo' => $data['correo'],
                            ':telefono' => $data['telefono'] ?? '',
                            ':estado' => 'activo'
                        ]);
                    } catch (PDOException $e) {
                        // Log error pero no fallar la creación del usuario principal
                        error_log("Error creando instructor: " . $e->getMessage());
                    }
                }

                return $this->response(201, 'Usuario creado exitosamente', ['id_usuario' => $id_usuario]);
            }
            return $this->response(400, 'Error al crear usuario');
        } catch(PDOException $e) {
            if ($e->getCode() == 23000) {
                return $this->response(409, 'El correo ya está registrado');
            }
            return $this->response(500, 'Error: ' . $e->getMessage());
        }
    }

    /**
     * Actualizar usuario
     */
    public function update($id, $data) {
        try {
            $sql = "UPDATE usuarios SET nombre = :nombre, apellido = :apellido, 
                    correo = :correo, rol = :rol, estado = :estado WHERE id_usuario = :id";
            
            $stmt = $this->conn->prepare($sql);
            $result = $stmt->execute([
                ':id' => $id,
                ':nombre' => $data['nombre'],
                ':apellido' => $data['apellido'],
                ':correo' => $data['correo'],
                ':rol' => $data['rol'],
                ':estado' => $data['estado']
            ]);

            if ($result) {
                return $this->response(200, 'Usuario actualizado exitosamente');
            }
            return $this->response(400, 'Error al actualizar usuario');
        } catch(PDOException $e) {
            return $this->response(500, 'Error: ' . $e->getMessage());
        }
    }

    /**
     * Eliminar usuario (soft delete)
     */
    public function delete($id) {
        try {
            $sql = "UPDATE usuarios SET estado = 0 WHERE id_usuario = :id";
            $stmt = $this->conn->prepare($sql);
            $result = $stmt->execute([':id' => $id]);

            if ($result) {
                return $this->response(200, 'Usuario eliminado exitosamente');
            }
            return $this->response(400, 'Error al eliminar usuario');
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
