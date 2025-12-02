import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'database', 'Asistnet.db')

def verify_schema():
    """Verifica que el nuevo esquema esté correcto"""
    
    if not os.path.exists(DB_PATH):
        print(f"✗ Base de datos no encontrada en: {DB_PATH}")
        return False
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    print("=" * 80)
    print("VERIFICACIÓN DEL NUEVO ESQUEMA")
    print("=" * 80)
    
    # Tablas que NO deben estar en sqlite_sequence (porque sus PKs no son auto-incrementables)
    non_autoincrement_tables = ['administracion', 'aprendices', 'fichas', 'instructores', 'programas_formacion']
    
    print("\n1. Verificando PKs NO auto-incrementables:")
    cursor.execute("SELECT name FROM sqlite_sequence")
    autoincrement_tables = [row[0] for row in cursor.fetchall()]
    
    all_correct = True
    for table in non_autoincrement_tables:
        if table in autoincrement_tables:
            print(f"   ✗ {table} - TIENE AUTOINCREMENT (ERROR)")
            all_correct = False
        else:
            print(f"   ✓ {table} - SIN AUTOINCREMENT (correcto)")
    
    # Verificar estructura de cada tabla crítica
    print("\n2. Verificando estructura de tablas:")
    
    tables_to_check = {
        'programas_formacion': 'nombre_programa',
        'fichas': 'numero_ficha',
        'instructores': 'id_usuario',
        'administracion': 'id_usuario',
        'aprendices': 'documento'
    }
    
    for table, expected_pk in tables_to_check.items():
        cursor.execute(f"PRAGMA table_info({table})")
        columns = cursor.fetchall()
        pk_columns = [col[1] for col in columns if col[5] == 1]
        
        if pk_columns and pk_columns[0] == expected_pk:
            print(f"   ✓ {table} - PK correcta: {expected_pk}")
        else:
            print(f"   ✗ {table} - PK incorrecta. Esperada: {expected_pk}, Encontrada: {pk_columns}")
            all_correct = False
    
    # Verificar FKs
    print("\n3. Verificando Foreign Keys:")
    
    fk_checks = [
        ('fichas', 'nombre_programa', 'programas_formacion', 'nombre_programa'),
        ('aprendices', 'numero_ficha', 'fichas', 'numero_ficha'),
        ('instructores', 'id_usuario', 'usuarios', 'id_usuario'),
        ('administracion', 'id_usuario', 'usuarios', 'id_usuario'),
        ('asignaciones_instructor_ficha', 'id_usuario_instructor', 'instructores', 'id_usuario'),
        ('asignaciones_instructor_ficha', 'numero_ficha', 'fichas', 'numero_ficha'),
        ('horarios_formacion', 'id_usuario_instructor', 'instructores', 'id_usuario'),
        ('horarios_formacion', 'numero_ficha', 'fichas', 'numero_ficha'),
        ('asistencias', 'documento_aprendiz', 'aprendices', 'documento'),
        ('biometria_aprendices', 'documento_aprendiz', 'aprendices', 'documento'),
    ]
    
    for table, fk_column, ref_table, ref_column in fk_checks:
        cursor.execute(f"PRAGMA foreign_key_list({table})")
        fks = cursor.fetchall()
        fk_found = False
        
        for fk in fks:
            if fk[2] == ref_table and fk[3] == fk_column and fk[4] == ref_column:
                fk_found = True
                break
        
        if fk_found:
            print(f"   ✓ {table}.{fk_column} → {ref_table}.{ref_column}")
        else:
            print(f"   ✗ {table}.{fk_column} → {ref_table}.{ref_column} (NO ENCONTRADA)")
            all_correct = False
    
    conn.close()
    
    print("\n" + "=" * 80)
    if all_correct:
        print("✓ VERIFICACIÓN EXITOSA - Esquema correcto")
    else:
        print("✗ VERIFICACIÓN FALLIDA - Hay errores en el esquema")
    print("=" * 80)
    
    return all_correct

if __name__ == "__main__":
    verify_schema()
