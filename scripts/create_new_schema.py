import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'database', 'Asistnet.db')

def create_new_schema():
    """Crea el nuevo esquema de la base de datos con PKs NO auto-incrementables"""
    
    print("=" * 80)
    print("CREANDO NUEVO ESQUEMA DE BASE DE DATOS")
    print("=" * 80)
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Habilitar foreign keys
    cursor.execute('PRAGMA foreign_keys = ON;')
    
    # 1. Tabla usuarios (sin cambios - base para instructores y administracion)
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
    
    # 2. Tabla programas_formacion - PK: nombre_programa (TEXT, NO AUTOINCREMENT)
    print("✓ Creando tabla: programas_formacion (PK: nombre_programa)")
    cursor.execute('''
    CREATE TABLE programas_formacion (
        nombre_programa TEXT PRIMARY KEY,
        nivel_formacion TEXT
    );
    ''')
    
    # 3. Tabla fichas - PK: numero_ficha (INTEGER, NO AUTOINCREMENT)
    print("✓ Creando tabla: fichas (PK: numero_ficha)")
    cursor.execute('''
    CREATE TABLE fichas (
        numero_ficha INTEGER PRIMARY KEY,
        nombre_programa TEXT NOT NULL,
        jornada TEXT NOT NULL,
        estado TEXT DEFAULT 'ACTIVO',
        FOREIGN KEY(nombre_programa) REFERENCES programas_formacion(nombre_programa)
    );
    ''')
    
    # 4. Tabla instructores - PK: id_usuario (INTEGER, NO AUTOINCREMENT, FK a usuarios)
    print("✓ Creando tabla: instructores (PK: id_usuario)")
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
    
    # 5. Tabla administracion - PK: id_usuario (INTEGER, NO AUTOINCREMENT, FK a usuarios)
    print("✓ Creando tabla: administracion (PK: id_usuario)")
    cursor.execute('''
    CREATE TABLE administracion (
        id_usuario INTEGER PRIMARY KEY,
        cargo TEXT,
        estado TEXT DEFAULT 'activo',
        FOREIGN KEY(id_usuario) REFERENCES usuarios(id_usuario)
    );
    ''')
    
    # 6. Tabla aprendices - PK: documento (INTEGER, NO AUTOINCREMENT)
    print("✓ Creando tabla: aprendices (PK: documento)")
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
    
    # 7. Tabla asignaciones_instructor_ficha (actualizada con nuevas FKs)
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
    
    # 8. Tabla horarios_formacion (actualizada con nuevas FKs)
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
    
    # 9. Tabla asistencias (actualizada con nuevas FKs)
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
    
    # 10. Tabla biometria_aprendices (actualizada con nuevas FKs)
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
    
    # 11. Tabla logs (sin cambios)
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
    print("ESQUEMA CREADO EXITOSAMENTE")
    print("=" * 80)
    print("\nTablas con PKs NO auto-incrementables:")
    print("  • administracion (PK: id_usuario)")
    print("  • aprendices (PK: documento)")
    print("  • fichas (PK: numero_ficha)")
    print("  • instructores (PK: id_usuario)")
    print("  • programas_formacion (PK: nombre_programa)")
    print("\nUsuario por defecto:")
    print("  • Email: admin@sena.edu.co")
    print("  • Password: 123456")

if __name__ == "__main__":
    create_new_schema()
