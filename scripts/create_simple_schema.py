import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'database', 'Asistnet.db')

def create_simple_schema():
    if os.path.exists(DB_PATH):
        os.remove(DB_PATH)
        print(f"🗑 Base de datos eliminada: {DB_PATH}")

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute("PRAGMA foreign_keys = ON;")
    
    print("🔨 Creando esquema SIMPLIFICADO (PKs Naturales)...")

    # 1. USUARIOS (Se mantiene ID para relacionar, pero es la única con AutoInc interno)
    cursor.execute('''
    CREATE TABLE usuarios (
        id_usuario INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        apellido TEXT NOT NULL,
        correo TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        rol TEXT NOT NULL CHECK(rol IN ('administrador', 'instructor')),
        estado TEXT DEFAULT 'activo',
        creado_en TEXT DEFAULT CURRENT_TIMESTAMP
    );
    ''')

    # 2. PROGRAMAS DE FORMACION (PK = nombre_programa)
    cursor.execute('''
    CREATE TABLE programas_formacion (
        nombre_programa TEXT PRIMARY KEY,
        nivel_formacion TEXT,
        instructor_lider TEXT
    );
    ''')

    # 3. FICHAS (PK = numero_ficha)
    cursor.execute('''
    CREATE TABLE fichas (
        numero_ficha INTEGER PRIMARY KEY,
        nombre_programa TEXT NOT NULL,
        jornada TEXT NOT NULL,
        estado TEXT DEFAULT 'ACTIVO',
        instructor_lider TEXT,
        FOREIGN KEY(nombre_programa) REFERENCES programas_formacion(nombre_programa)
    );
    ''')

    # 4. INSTRUCTORES (PK = id_usuario)
    cursor.execute('''
    CREATE TABLE instructores (
        id_usuario INTEGER PRIMARY KEY,
        nombres TEXT NOT NULL,
        apellidos TEXT NOT NULL,
        correo TEXT NOT NULL,
        telefono NUMERIC,
        estado TEXT DEFAULT 'activo',
        FOREIGN KEY(id_usuario) REFERENCES usuarios(id_usuario)
    );
    ''')

    # 5. ADMINISTRACION (PK = id_usuario)
    cursor.execute('''
    CREATE TABLE administracion (
        id_usuario INTEGER PRIMARY KEY,
        cargo TEXT,
        estado TEXT DEFAULT 'activo',
        FOREIGN KEY(id_usuario) REFERENCES usuarios(id_usuario)
    );
    ''')

    # 6. APRENDICES (PK = documento)
    cursor.execute('''
    CREATE TABLE aprendices (
        documento INTEGER PRIMARY KEY,
        tipo_identificacion TEXT NOT NULL,
        nombre TEXT NOT NULL,
        apellido TEXT NOT NULL,
        correo TEXT,
        celular INTEGER,
        numero_ficha INTEGER NOT NULL,
        estado TEXT DEFAULT 'EN FORMACION',
        FOREIGN KEY(numero_ficha) REFERENCES fichas(numero_ficha)
    );
    ''')

    # 7. TABLAS DEPENDIENTES
    cursor.execute('''
    CREATE TABLE asignaciones_instructor_ficha (
        id_asignacion INTEGER PRIMARY KEY AUTOINCREMENT,
        numero_ficha INTEGER NOT NULL,
        id_usuario_instructor INTEGER NOT NULL,
        fecha_asignacion TEXT DEFAULT CURRENT_TIMESTAMP,
        es_lider INTEGER DEFAULT 0,
        FOREIGN KEY(id_usuario_instructor) REFERENCES instructores(id_usuario),
        FOREIGN KEY(numero_ficha) REFERENCES fichas(numero_ficha)
    );
    ''')

    cursor.execute('''
    CREATE TABLE asistencias (
        id_asistencia INTEGER PRIMARY KEY AUTOINCREMENT,
        documento_aprendiz INTEGER NOT NULL,
        id_usuario INTEGER NOT NULL,
        fecha TEXT NOT NULL,
        hora_entrada TEXT,
        hora_salida TEXT,
        tipo TEXT DEFAULT 'presente',
        observaciones TEXT,
        archivo_soporte TEXT,
        FOREIGN KEY(id_usuario) REFERENCES usuarios(id_usuario),
        FOREIGN KEY(documento_aprendiz) REFERENCES aprendices(documento)
    );
    ''')
    
    cursor.execute('''
    CREATE TABLE biometria_aprendices (
        id_biometria INTEGER PRIMARY KEY AUTOINCREMENT,
        documento_aprendiz INTEGER NOT NULL,
        datos_biometricos TEXT,
        tipo_biometria TEXT,
        fecha_registro TEXT DEFAULT CURRENT_TIMESTAMP,
        registrado_por INTEGER,
        FOREIGN KEY(registrado_por) REFERENCES usuarios(id_usuario),
        FOREIGN KEY(documento_aprendiz) REFERENCES aprendices(documento)
    );
    ''')

    cursor.execute('''
    CREATE TABLE logs (
        id_log INTEGER PRIMARY KEY AUTOINCREMENT,
        id_usuario INTEGER,
        accion TEXT,
        fecha TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(id_usuario) REFERENCES usuarios(id_usuario)
    );
    ''')

    # Admin por defecto
    cursor.execute("INSERT INTO usuarios (nombre, apellido, correo, password_hash, rol) VALUES ('Admin', 'Sistema', 'admin@sena.edu.co', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'administrador')")
    admin_uid = cursor.lastrowid
    cursor.execute("INSERT INTO administracion (id_usuario, cargo) VALUES (?, 'Administrador General')", (admin_uid,))

    conn.commit()
    conn.close()
    print("✅ Esquema SIMPLIFICADO creado exitosamente.")

if __name__ == "__main__":
    create_simple_schema()
