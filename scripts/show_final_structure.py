import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'database', 'Asistnet.db')

def show_final_structure():
    """Muestra la estructura final de forma clara"""
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    print("=" * 80)
    print("ESTRUCTURA FINAL DE LA BASE DE DATOS")
    print("=" * 80)
    
    tables_info = [
        ('programas_formacion', 'id_programa', 'nombre_programa'),
        ('fichas', 'id_ficha', 'numero_ficha'),
        ('instructores', 'id_instructor', 'id_usuario'),
        ('administracion', 'id_admin', 'id_usuario'),
        ('aprendices', 'id_aprendiz', 'documento'),
    ]
    
    for table, id_field, pk_field in tables_info:
        print(f"\n📊 TABLA: {table}")
        cursor.execute(f"PRAGMA table_info({table})")
        columns = cursor.fetchall()
        
        for col in columns:
            col_name = col[1]
            col_type = col[2]
            is_pk = " [PRIMARY KEY]" if col[5] == 1 else ""
            
            if col_name == id_field:
                print(f"   1️⃣ {col_name} ({col_type}) - ID para conteo")
            elif col_name == pk_field:
                print(f"   🔑 {col_name} ({col_type}){is_pk} - Identificación única")
            else:
                print(f"      {col_name} ({col_type}){is_pk}")
        
        # Mostrar FKs
        cursor.execute(f"PRAGMA foreign_key_list({table})")
        fks = cursor.fetchall()
        if fks:
            print(f"   🔗 Foreign Keys:")
            for fk in fks:
                print(f"      • {fk[3]} → {fk[2]}({fk[4]})")
    
    print("\n" + "=" * 80)
    print("TABLAS DEPENDIENTES - FOREIGN KEYS")
    print("=" * 80)
    
    dependent_tables = [
        'asignaciones_instructor_ficha',
        'horarios_formacion',
        'asistencias',
        'biometria_aprendices'
    ]
    
    for table in dependent_tables:
        print(f"\n📋 {table}:")
        cursor.execute(f"PRAGMA foreign_key_list({table})")
        fks = cursor.fetchall()
        for fk in fks:
            print(f"   • {fk[3]} → {fk[2]}.{fk[4]}")
    
    print("\n" + "=" * 80)
    print("✅ VERIFICACIÓN DE CONSISTENCIA")
    print("=" * 80)
    
    # Verificar que horarios_formacion usa id_usuario (no id_usuario_instructor)
    cursor.execute("PRAGMA table_info(horarios_formacion)")
    cols = [col[1] for col in cursor.fetchall()]
    
    if 'id_usuario' in cols and 'id_usuario_instructor' not in cols:
        print("✓ horarios_formacion usa 'id_usuario' (consistente)")
    else:
        print("✗ horarios_formacion tiene nombre inconsistente")
    
    # Verificar que asignaciones usa id_usuario
    cursor.execute("PRAGMA table_info(asignaciones_instructor_ficha)")
    cols = [col[1] for col in cursor.fetchall()]
    
    if 'id_usuario' in cols and 'id_usuario_instructor' not in cols:
        print("✓ asignaciones_instructor_ficha usa 'id_usuario' (consistente)")
    else:
        print("✗ asignaciones_instructor_ficha tiene nombre inconsistente")
    
    # Verificar que asistencias usa documento
    cursor.execute("PRAGMA table_info(asistencias)")
    cols = [col[1] for col in cursor.fetchall()]
    
    if 'documento' in cols and 'documento_aprendiz' not in cols:
        print("✓ asistencias usa 'documento' (consistente)")
    else:
        print("✗ asistencias tiene nombre inconsistente")
    
    conn.close()

if __name__ == "__main__":
    show_final_structure()
