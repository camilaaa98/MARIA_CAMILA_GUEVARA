import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'database', 'Asistnet.db')

def create_definitive_schema():
    if os.path.exists(DB_PATH):
        os.remove(DB_PATH)
        print(f"🗑 Base de datos eliminada: {DB_PATH}")

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Habilitar FKs
    cursor.execute("PRAGMA foreign_keys = ON;")
    
    print("🔨 Creando tablas con estructura: Col1=AutoInc, Col2=BusinessKey...")

    # 1. USUARIOS (Base para instructores/admin)
    # id_usuario es AutoInc y también BusinessKey en este caso particular, pero seguiremos el patrón
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

    # 2. PROGRAMAS DE FORMACION
    # Col1: id_programa (Auto), Col2: nombre_programa (Unique/Ref)
    cursor.execute('''
    CREATE TABLE programas_formacion (
        id_programa INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre_programa TEXT UNIQUE NOT NULL,
        nivel_formacion TEXT,
        instructor_lider TEXT
    );
    ''')

    # 3. FICHAS
    # Col1: id_ficha (Auto), Col2: numero_ficha (Unique/Ref)
    cursor.execute('''
    CREATE TABLE fichas (
        id_ficha INTEGER PRIMARY KEY AUTOINCREMENT,
        numero_ficha INTEGER UNIQUE NOT NULL,
        nombre_programa TEXT NOT NULL,
        jornada TEXT NOT NULL,
        estado TEXT DEFAULT 'ACTIVO',
        instructor_lider TEXT,
        FOREIGN KEY(nombre_programa) REFERENCES programas_formacion(nombre_programa)
    );
    ''')

    # 4. INSTRUCTORES
    # Col1: id_instructor (Auto), Col2: id_usuario (Unique/Ref)
    cursor.execute('''
    CREATE TABLE instructores (
        id_instructor INTEGER PRIMARY KEY AUTOINCREMENT,
        id_usuario INTEGER UNIQUE NOT NULL,
        nombres TEXT NOT NULL,
        apellidos TEXT NOT NULL,
        correo TEXT NOT NULL,
        telefono NUMERIC,
        estado TEXT DEFAULT 'activo',
        FOREIGN KEY(id_usuario) REFERENCES usuarios(id_usuario)
    );
    ''')

    # 5. ADMINISTRACION
    # Col1: id_admin (Auto), Col2: id_usuario (Unique/Ref)
    cursor.execute('''
    CREATE TABLE administracion (
        id_admin INTEGER PRIMARY KEY AUTOINCREMENT,
        id_usuario INTEGER UNIQUE NOT NULL,
        cargo TEXT,
        estado TEXT DEFAULT 'activo',
        FOREIGN KEY(id_usuario) REFERENCES usuarios(id_usuario)
    );
    ''')

    # 6. APRENDICES
    # Col1: id_aprendiz (Auto), Col2: documento (Unique/Ref)
    cursor.execute('''
    CREATE TABLE aprendices (
        id_aprendiz INTEGER PRIMARY KEY AUTOINCREMENT,
        documento INTEGER UNIQUE NOT NULL,
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

    # 7. TABLAS DEPENDIENTES (Asistencias, etc)
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

    # Usuario Admin por defecto
    cursor.execute("INSERT INTO usuarios (nombre, apellido, correo, password_hash, rol) VALUES ('Admin', 'Sistema', 'admin@sena.edu.co', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'administrador')")
    admin_uid = cursor.lastrowid
    cursor.execute("INSERT INTO administracion (id_usuario, cargo) VALUES (?, 'Administrador General')", (admin_uid,))

    conn.commit()
    conn.close()
    print("✅ Esquema definitivo creado exitosamente.")

if __name__ == "__main__":
    create_definitive_schema()
