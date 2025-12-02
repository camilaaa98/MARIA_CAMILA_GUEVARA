import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'database', 'Asistnet.db')

def create_clean_schema():
    """Esquema LIMPIO sin horarios_formacion"""
    
    print("=" * 80)
    print("CREANDO ESQUEMA LIMPIO (SIN horarios_formacion)")
    print("=" * 80)
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute('PRAGMA foreign_keys = ON;')
    
    # 1. usuarios
    print("\n✓ Creando tabla: usuarios")
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
    
    # 2. programas_formacion
    print("✓ Creando tabla: programas_formacion")
    cursor.execute('''
    CREATE TABLE programas_formacion (
        id_programa INTEGER UNIQUE,
        nombre_programa TEXT PRIMARY KEY,
        nivel_formacion TEXT,
        instructor_lider TEXT
    );
    ''')
    
    # 3. fichas (incluye jornada: DIURNA, TARDE, NOCTURNA)
    print("✓ Creando tabla: fichas")
    cursor.execute('''
    CREATE TABLE fichas (
        id_ficha INTEGER UNIQUE,
        numero_ficha INTEGER PRIMARY KEY,
        nombre_programa TEXT NOT NULL,
        jornada TEXT NOT NULL,
        estado TEXT DEFAULT 'ACTIVO',
        instructor_lider TEXT,
        FOREIGN KEY(nombre_programa) REFERENCES programas_formacion(nombre_programa)
    );
    ''')
    
    # 4. instructores
    print("✓ Creando tabla: instructores")
    cursor.execute('''
    CREATE TABLE instructores (
        id_instructor INTEGER UNIQUE,
        id_usuario INTEGER PRIMARY KEY,
        nombres TEXT NOT NULL,
        apellidos TEXT NOT NULL,
        correo TEXT NOT NULL,
        telefono NUMERIC,
        estado TEXT DEFAULT 'activo',
        FOREIGN KEY(id_usuario) REFERENCES usuarios(id_usuario)
    );
    ''')
    
    # 5. administracion
    print("✓ Creando tabla: administracion")
    cursor.execute('''
    CREATE TABLE administracion (
        id_admin INTEGER UNIQUE,
        id_usuario INTEGER PRIMARY KEY,
        cargo TEXT,
        estado TEXT DEFAULT 'activo',
        FOREIGN KEY(id_usuario) REFERENCES usuarios(id_usuario)
    );
    ''')
    
    # 6. aprendices
    print("✓ Creando tabla: aprendices")
    cursor.execute('''
    CREATE TABLE aprendices (
        id_aprendiz INTEGER UNIQUE,
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
    
    # 7. asignaciones_instructor_ficha (incluye es_lider)
    print("✓ Creando tabla: asignaciones_instructor_ficha")
    cursor.execute('''
    CREATE TABLE asignaciones_instructor_ficha (
        id_asignacion INTEGER PRIMARY KEY AUTOINCREMENT,
        numero_ficha INTEGER NOT NULL,
        id_usuario INTEGER NOT NULL,
        fecha_asignacion TEXT DEFAULT CURRENT_TIMESTAMP,
        es_lider INTEGER DEFAULT 0,
        FOREIGN KEY(id_usuario) REFERENCES instructores(id_usuario),
        FOREIGN KEY(numero_ficha) REFERENCES fichas(numero_ficha)
    );
    ''')
    
    # 8. asistencias
    print("✓ Creando tabla: asistencias")
    cursor.execute('''
    CREATE TABLE asistencias (
        id_asistencia INTEGER PRIMARY KEY AUTOINCREMENT,
        documento INTEGER NOT NULL,
        id_usuario INTEGER NOT NULL,
        fecha TEXT NOT NULL,
        hora_entrada TEXT,
        hora_salida TEXT,
        tipo TEXT DEFAULT 'presente',
        observaciones TEXT,
        archivo_soporte TEXT,
        FOREIGN KEY(id_usuario) REFERENCES usuarios(id_usuario),
        FOREIGN KEY(documento) REFERENCES aprendices(documento)
    );
    ''')
    
    # 9. biometria_aprendices
    print("✓ Creando tabla: biometria_aprendices")
    cursor.execute('''
    CREATE TABLE biometria_aprendices (
        id_biometria INTEGER PRIMARY KEY AUTOINCREMENT,
        documento INTEGER NOT NULL,
        datos_biometricos TEXT,
        tipo_biometria TEXT,
        fecha_registro TEXT DEFAULT CURRENT_TIMESTAMP,
        registrado_por INTEGER,
        FOREIGN KEY(registrado_por) REFERENCES usuarios(id_usuario),
        FOREIGN KEY(documento) REFERENCES aprendices(documento)
    );
    ''')
    
    # 10. logs
    print("✓ Creando tabla: logs")
    cursor.execute('''
    CREATE TABLE logs (
        id_log INTEGER PRIMARY KEY AUTOINCREMENT,
        id_usuario INTEGER,
        accion TEXT,
        fecha TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(id_usuario) REFERENCES usuarios(id_usuario)
    );
    ''')
    
    # Usuario admin
    print("\n✓ Insertando usuario administrador")
    import hashlib
    password_hash = hashlib.sha256('123456'.encode()).hexdigest()
    cursor.execute('''
    INSERT INTO usuarios (nombre, apellido, correo, password_hash, rol) 
    VALUES ('Admin', 'Sistema', 'admin@sena.edu.co', ?, 'administrador')
    ''', (password_hash,))
    
    conn.commit()
    conn.close()
    
    print("\n" + "=" * 80)
    print("✅ ESQUEMA LIMPIO CREADO")
    print("=" * 80)
    print("\nTablas creadas (SIN horarios_formacion):")
    print("  • usuarios, programas_formacion, fichas")
    print("  • instructores, administracion, aprendices")
    print("  • asignaciones_instructor_ficha (con es_lider)")
    print("  • asistencias, biometria_aprendices, logs")

if __name__ == "__main__":
    create_clean_schema()
