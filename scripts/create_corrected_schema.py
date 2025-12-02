import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'database', 'Asistnet.db')

def create_corrected_schema():
    """Crea el esquema CORRECTO manteniendo campos autoincrement + PKs no autoincrement"""
    
    print("=" * 80)
    print("CREANDO ESQUEMA CORREGIDO")
    print("=" * 80)
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Habilitar foreign keys
    cursor.execute('PRAGMA foreign_keys = ON;')
    
    # 1. Tabla usuarios (sin cambios)
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
    
    # 2. Tabla programas_formacion - PK: nombre_programa
    print("✓ Creando tabla: programas_formacion (PK: nombre_programa)")
    cursor.execute('''
    CREATE TABLE programas_formacion (
        nombre_programa TEXT PRIMARY KEY,
        nivel_formacion TEXT
    );
    ''')
    
    # 3. Tabla fichas - MANTIENE id_ficha autoincrement, PK: numero_ficha
    print("✓ Creando tabla: fichas (id_ficha auto + PK: numero_ficha)")
    cursor.execute('''
    CREATE TABLE fichas (
        id_ficha INTEGER UNIQUE,
        numero_ficha INTEGER PRIMARY KEY,
        nombre_programa TEXT NOT NULL,
        jornada TEXT NOT NULL,
        estado TEXT DEFAULT 'ACTIVO',
        FOREIGN KEY(nombre_programa) REFERENCES programas_formacion(nombre_programa)
    );
    ''')
    
    # 4. Tabla instructores - MANTIENE id_instructor autoincrement, PK: id_usuario
    print("✓ Creando tabla: instructores (id_instructor + PK: id_usuario)")
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
    
    # 5. Tabla administracion - MANTIENE id_admin, PK: id_usuario
    print("✓ Creando tabla: administracion (id_admin + PK: id_usuario)")
    cursor.execute('''
    CREATE TABLE administracion (
        id_admin INTEGER UNIQUE,
        id_usuario INTEGER PRIMARY KEY,
        cargo TEXT,
        estado TEXT DEFAULT 'activo',
        FOREIGN KEY(id_usuario) REFERENCES usuarios(id_usuario)
    );
    ''')
    
    # 6. Tabla aprendices - MANTIENE id_aprendiz autoincrement, PK: documento
    print("✓ Creando tabla: aprendices (id_aprendiz auto + PK: documento)")
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
    
    # 7. Tabla asignaciones_instructor_ficha
    print("✓ Creando tabla: asignaciones_instructor_ficha")
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
    
    # 8. Tabla horarios_formacion
    print("✓ Creando tabla: horarios_formacion")
    cursor.execute('''
    CREATE TABLE horarios_formacion (
        id_horario INTEGER PRIMARY KEY AUTOINCREMENT,
        numero_ficha INTEGER NOT NULL,
        id_usuario_instructor INTEGER NOT NULL,
        dia_semana INTEGER NOT NULL,
        hora_inicio TEXT NOT NULL,
        hora_fin TEXT NOT NULL,
        FOREIGN KEY(id_usuario_instructor) REFERENCES instructores(id_usuario),
        FOREIGN KEY(numero_ficha) REFERENCES fichas(numero_ficha)
    );
    ''')
    
    # 9. Tabla asistencias
    print("✓ Creando tabla: asistencias")
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
    
    # 10. Tabla biometria_aprendices
    print("✓ Creando tabla: biometria_aprendices")
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
    
    # 11. Tabla logs
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
    
    # Insertar usuario administrador por defecto
    print("\n✓ Insertando usuario administrador por defecto")
    import hashlib
    password_hash = hashlib.sha256('123456'.encode()).hexdigest()
    
    cursor.execute('''
    INSERT INTO usuarios (nombre, apellido, correo, password_hash, rol) 
    VALUES ('Admin', 'Sistema', 'admin@sena.edu.co', ?, 'administrador')
    ''', (password_hash,))
    
    conn.commit()
    conn.close()
    
    print("\n" + "=" * 80)
    print("ESQUEMA CORREGIDO CREADO EXITOSAMENTE")
    print("=" * 80)
    print("\nTablas con AMBOS campos (auto-increment + PK):")
    print("  • fichas: id_ficha (auto) + numero_ficha (PK)")
    print("  • aprendices: id_aprendiz (auto) + documento (PK)")
    print("  • instructores: id_instructor (auto) + id_usuario (PK)")
    print("  • administracion: id_admin (auto) + id_usuario (PK)")

if __name__ == "__main__":
    create_corrected_schema()
