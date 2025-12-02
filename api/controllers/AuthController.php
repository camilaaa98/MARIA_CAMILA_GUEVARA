<?php
require_once __DIR__ . '/../config/Database.php';

class AuthController {
    private $db;
    private $conn;

    public function __construct() {
        try {
            $this->db = new Database();
            $this->conn = $this->db->getConnection();
        } catch (Exception $e) {
            error_log("Error en AuthController constructor: " . $e->getMessage());
            throw new Exception("Error al inicializar el sistema de autenticación");
        }
    }

    /**
     * Iniciar sesión
     */
    public function login($data) {
        try {
            if (!isset($data['correo']) || !isset($data['password'])) {
                return $this->response(400, 'Correo y contraseña son requeridos');
            }

            $sql = "SELECT * FROM usuarios WHERE correo = :correo AND estado = 1";
            $stmt = $this->conn->prepare($sql);
            $stmt->execute([':correo' => $data['correo']]);
            
            $usuario = $stmt->fetch();

            if ($usuario) {
                // Verificar password - aceptar tanto hash como texto plano (para desarrollo)
                $passwordValido = password_verify($data['password'], $usuario['password_hash']) || 
                                 $data['password'] === $usuario['password_hash'];
                
                if ($passwordValido) {
                    // Si es instructor, obtener su id_instructor
                    if ($usuario['rol'] === 'instructor') {
                        $sqlInstructor = "SELECT id_instructor FROM instructores WHERE id_usuario = :id_usuario";
                        $stmtInstructor = $this->conn->prepare($sqlInstructor);
                        $stmtInstructor->execute([':id_usuario' => $usuario['id_usuario']]);
                        $instructor = $stmtInstructor->fetch();
                        
                        if ($instructor) {
                            $usuario['id_instructor'] = $instructor['id_instructor'];
                        }
                    }
                    
                    // Registrar log de inicio de sesión
                    $this->registrarLog($usuario['id_usuario'], 'Inicio de sesión');

                    // Retornar datos del usuario (sin el password)
                    unset($usuario['password_hash']);
                    return $this->response(200, 'Login exitoso', $usuario);
                }
            }

            return $this->response(401, 'Credenciales inválidas');

        } catch(PDOException $e) {
            return $this->response(500, 'Error en el servidor: ' . $e->getMessage());
        }
    }

    /**
     * Registrar log de acción
     */
    private function registrarLog($id_usuario, $accion) {
        $sql = "INSERT INTO logs (id_usuario, accion) VALUES (:id_usuario, :accion)";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([
            ':id_usuario' => $id_usuario,
            ':accion' => $accion
        ]);
    }

    /**
     * Generar respuesta JSON
     */
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
