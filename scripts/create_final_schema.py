import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'database', 'Asistnet.db')

def create_final_schema():
    """
    Crea el esquema FINAL correcto:
    - Cada tabla tiene su ID autoincrement al inicio (para conteo)
    - La PK real es el segundo campo (identificación)
    - Se mantienen TODOS los campos originales
    - Nombres de FK consistentes
    """
    
    print("=" * 80)
    print("CREANDO ESQUEMA FINAL CORRECTO")
    print("=" * 80)
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Habilitar foreign keys
    cursor.execute('PRAGMA foreign_keys = ON;')
    
    # 1. Tabla usuarios (SIN CAMBIOS - base para instructores y administracion)
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
    
    # 2. Tabla programas_formacion
    # ID autoincrement: id_programa
    # PK: nombre_programa
    # + todos los campos originales
    print("✓ Creando tabla: programas_formacion")
    cursor.execute('''
    CREATE TABLE programas_formacion (
        id_programa INTEGER UNIQUE,
        nombre_programa TEXT PRIMARY KEY,
        nivel_formacion TEXT
    );
    ''')
    
    # 3. Tabla fichas
    # ID autoincrement: id_ficha
    # PK: numero_ficha
    # FK: nombre_programa → programas_formacion
    print("✓ Creando tabla: fichas")
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
    
    # 4. Tabla instructores
    # ID autoincrement: id_instructor
    # PK: id_usuario
    # FK: id_usuario → usuarios
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
    
    # 5. Tabla administracion
    # ID autoincrement: id_admin
    # PK: id_usuario
    # FK: id_usuario → usuarios
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
    
    # 6. Tabla aprendices
    # ID autoincrement: id_aprendiz
    # PK: documento
    # FK: numero_ficha → fichas
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
    
    # 7. Tabla asignaciones_instructor_ficha
    # FK: id_usuario → instructores (CONSISTENTE - usa id_usuario no id_usuario_instructor)
    # FK: numero_ficha → fichas
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
    
    # 8. Tabla horarios_formacion
    # FK: id_usuario → instructores (CONSISTENTE - usa id_usuario no id_usuario_instructor)
    # FK: numero_ficha → fichas
    print("✓ Creando tabla: horarios_formacion")
    cursor.execute('''
    CREATE TABLE horarios_formacion (
        id_horario INTEGER PRIMARY KEY AUTOINCREMENT,
        numero_ficha INTEGER NOT NULL,
        id_usuario INTEGER NOT NULL,
        dia_semana INTEGER NOT NULL,
        hora_inicio TEXT NOT NULL,
        hora_fin TEXT NOT NULL,
        FOREIGN KEY(id_usuario) REFERENCES instructores(id_usuario),
        FOREIGN KEY(numero_ficha) REFERENCES fichas(numero_ficha)
    );
    ''')
    
    # 9. Tabla asistencias
    # FK: documento → aprendices (CONSISTENTE - usa documento no documento_aprendiz)
    # FK: id_usuario → usuarios
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
    
    # 10. Tabla biometria_aprendices
    # FK: documento → aprendices (CONSISTENTE)
    # FK: registrado_por → usuarios
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
    print("ESQUEMA FINAL CREADO CORRECTAMENTE")
    print("=" * 80)
    print("\nEstructura de tablas principales:")
    print("  • programas_formacion: id_programa (conteo) + nombre_programa (PK)")
    print("  • fichas: id_ficha (conteo) + numero_ficha (PK)")
    print("  • instructores: id_instructor (conteo) + id_usuario (PK)")
    print("  • administracion: id_admin (conteo) + id_usuario (PK)")
    print("  • aprendices: id_aprendiz (conteo) + documento (PK)")
    print("\nFKs consistentes:")
    print("  • horarios_formacion.id_usuario → instructores.id_usuario")
    print("  • asignaciones_instructor_ficha.id_usuario → instructores.id_usuario")
    print("  • asistencias.documento → aprendices.documento")

if __name__ == "__main__":
    create_final_schema()
