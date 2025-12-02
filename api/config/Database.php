<?php
/**
 * Clase de configuración de base de datos
 * Maneja la conexión con SQLite
 */
class Database {
    private $db_file = __DIR__ . '/../../database/Asistnet.db';
    private $conn = null;

    /**
     * Obtener la conexión a la base de datos
     */
    public function getConnection() {
        if ($this->conn === null) {
            try {
                // Verificar que el archivo de base de datos existe
                if (!file_exists($this->db_file)) {
                    $error_msg = "Base de datos no encontrada en: " . $this->db_file;
                    error_log($error_msg);
                    throw new Exception($error_msg);
                }

                // Verificar permisos de lectura
                if (!is_readable($this->db_file)) {
                    $error_msg = "No se puede leer la base de datos: " . $this->db_file;
                    error_log($error_msg);
                    throw new Exception($error_msg);
                }

                // Establecer conexión
                $this->conn = new PDO("sqlite:" . $this->db_file);
                $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
                $this->conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
                
                // Habilitar claves foráneas
                $this->conn->exec('PRAGMA foreign_keys = ON;');
                
                // Verificar que las tablas existen
                $this->verifyTables();
                
            } catch(PDOException $e) {
                $error_msg = "Error de conexión PDO: " . $e->getMessage();
                error_log($error_msg);
                throw new Exception($error_msg);
            } catch(Exception $e) {
                error_log("Error en Database: " . $e->getMessage());
                throw $e;
            }
        }
        
        return $this->conn;
    }

    /**
     * Verificar que las tablas necesarias existen
     */
    private function verifyTables() {
        $required_tables = ['programas_formacion', 'fichas', 'aprendices', 'asistencias'];
        
        foreach ($required_tables as $table) {
            $stmt = $this->conn->prepare("SELECT name FROM sqlite_master WHERE type='table' AND name=:table");
            $stmt->execute([':table' => $table]);
            $result = $stmt->fetch();
            
            if (!$result) {
                error_log("Tabla faltante: $table");
                // No crear tablas automáticamente, solo registrar el error
                // Las tablas deben existir de la migración
            }
        }
    }

    /**
     * Crear tabla de usuarios si no existe (para autenticación)
     * NOTA: La base de datos ha sido reestructurada con PKs NO auto-incrementables:
     * - administracion (PK: id_usuario)
     * - aprendices (PK: documento)
     * - fichas (PK: numero_ficha)
     * - instructores (PK: id_usuario)
     * - programas_formacion (PK: nombre_programa)
     */
    public function ensureUsersTable() {
        try {
            $sql = "
            CREATE TABLE IF NOT EXISTS usuarios (
                id_usuario INTEGER PRIMARY KEY AUTOINCREMENT,
                nombre TEXT NOT NULL,
                apellido TEXT NOT NULL,
                correo TEXT NOT NULL UNIQUE,
                password_hash TEXT NOT NULL,
                rol TEXT NOT NULL CHECK(rol IN ('administrador', 'instructor')),
                estado TEXT DEFAULT 'activo',
                creado_en TEXT DEFAULT CURRENT_TIMESTAMP
            );
            ";

            $this->conn->exec($sql);
            $this->seedDefaultUsers();
        } catch(PDOException $e) {
            error_log("Error al crear tabla usuarios: " . $e->getMessage());
        }
    }

    /**
     * Insertar usuarios por defecto si no existen
     */
    private function seedDefaultUsers() {
        try {
            // Verificar si ya existen usuarios
            $stmt = $this->conn->query("SELECT COUNT(*) as count FROM usuarios");
            $result = $stmt->fetch();
            
            if ($result['count'] == 0) {
                // Insertar usuarios de prueba
                // Insertar solo Admin por defecto
                $sql = "INSERT INTO usuarios (nombre, apellido, correo, password_hash, rol) VALUES
                    ('Admin', 'Sistema', 'admin@sena.edu.co', :password_admin, 'administrador')";
                
                $stmt = $this->conn->prepare($sql);
                $stmt->execute([
                    ':password_admin' => password_hash('123456', PASSWORD_DEFAULT)
                ]);
            }
        } catch(PDOException $e) {
            error_log("Error al insertar usuarios por defecto: " . $e->getMessage());
        }
    }
}
?>
