import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'database', 'Asistnet.db')

def test_insert_data():
    """Prueba insertar datos en las tablas con PKs no auto-incrementables"""
    
    print("=" * 80)
    print("PRUEBA DE INSERCIÓN DE DATOS")
    print("=" * 80)
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        # Habilitar foreign keys
        cursor.execute('PRAGMA foreign_keys = ON;')
        
        # 1. Insertar programa de formación (PK: nombre_programa)
        print("\n1. Insertando programa de formación...")
        cursor.execute('''
        INSERT INTO programas_formacion (nombre_programa, nivel_formacion)
        VALUES ('ADSO', 'Tecnólogo')
        ''')
        print("   ✓ Programa insertado: ADSO")
        
        # 2. Insertar ficha (PK: numero_ficha)
        print("\n2. Insertando ficha...")
        cursor.execute('''
        INSERT INTO fichas (numero_ficha, nombre_programa, jornada, estado)
        VALUES (2898754, 'ADSO', 'DIURNA', 'ACTIVO')
        ''')
        print("   ✓ Ficha insertada: 2898754")
        
        # 3. Crear usuario para instructor
        print("\n3. Creando usuario para instructor...")
        import hashlib
        password_hash = hashlib.sha256('test123'.encode()).hexdigest()
        cursor.execute('''
        INSERT INTO usuarios (nombre, apellido, correo, password_hash, rol)
        VALUES ('Juan', 'Pérez', 'juan.perez@sena.edu.co', ?, 'instructor')
        ''', (password_hash,))
        id_usuario_instructor = cursor.lastrowid
        print(f"   ✓ Usuario creado con ID: {id_usuario_instructor}")
        
        # 4. Insertar instructor (PK: id_usuario)
        print("\n4. Insertando instructor...")
        cursor.execute('''
        INSERT INTO instructores (id_usuario, nombres, apellidos, correo, telefono, estado)
        VALUES (?, 'Juan', 'Pérez', 'juan.perez@sena.edu.co', 3001234567, 'activo')
        ''', (id_usuario_instructor,))
        print(f"   ✓ Instructor insertado con ID: {id_usuario_instructor}")
        
        # 5. Insertar aprendiz (PK: documento)
        print("\n5. Insertando aprendiz...")
        cursor.execute('''
        INSERT INTO aprendices (documento, tipo_identificacion, nombre, apellido, correo, celular, numero_ficha, estado)
        VALUES (1234567890, 'CC', 'María', 'García', 'maria.garcia@sena.edu.co', 3009876543, 2898754, 'EN FORMACION')
        ''')
        print("   ✓ Aprendiz insertado con documento: 1234567890")
        
        # 6. Asignar instructor a ficha
        print("\n6. Asignando instructor a ficha...")
        cursor.execute('''
        INSERT INTO asignaciones_instructor_ficha (numero_ficha, id_usuario_instructor, es_lider)
        VALUES (2898754, ?, 1)
        ''', (id_usuario_instructor,))
        print("   ✓ Asignación creada")
        
        # 7. Crear horario de formación
        print("\n7. Creando horario de formación...")
        cursor.execute('''
        INSERT INTO horarios_formacion (numero_ficha, id_usuario_instructor, dia_semana, hora_inicio, hora_fin)
        VALUES (2898754, ?, 1, '08:00', '12:00')
        ''', (id_usuario_instructor,))
        print("   ✓ Horario creado")
        
        # 8. Registrar asistencia
        print("\n8. Registrando asistencia...")
        cursor.execute('''
        INSERT INTO asistencias (documento_aprendiz, id_usuario, fecha, hora_entrada, hora_salida, tipo)
        VALUES (1234567890, ?, date('now'), '08:05', '12:00', 'presente')
        ''', (id_usuario_instructor,))
        print("   ✓ Asistencia registrada")
        
        conn.commit()
        
        # Verificar datos insertados
        print("\n" + "=" * 80)
        print("VERIFICACIÓN DE DATOS INSERTADOS")
        print("=" * 80)
        
        cursor.execute("SELECT * FROM programas_formacion")
        print(f"\nProgramas: {cursor.fetchall()}")
        
        cursor.execute("SELECT * FROM fichas")
        print(f"Fichas: {cursor.fetchall()}")
        
        cursor.execute("SELECT id_usuario, nombres, apellidos FROM instructores")
        print(f"Instructores: {cursor.fetchall()}")
        
        cursor.execute("SELECT documento, nombre, apellido FROM aprendices")
        print(f"Aprendices: {cursor.fetchall()}")
        
        cursor.execute("SELECT * FROM asignaciones_instructor_ficha")
        print(f"Asignaciones: {cursor.fetchall()}")
        
        print("\n" + "=" * 80)
        print("✓ TODAS LAS PRUEBAS EXITOSAS")
        print("=" * 80)
        print("\nConclusiones:")
        print("  • Las PKs NO auto-incrementables funcionan correctamente")
        print("  • Todas las FKs se relacionan correctamente")
        print("  • No hay conflictos de integridad referencial")
        
    except sqlite3.IntegrityError as e:
        print(f"\n✗ Error de integridad: {e}")
        conn.rollback()
    except Exception as e:
        print(f"\n✗ Error: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    test_insert_data()
