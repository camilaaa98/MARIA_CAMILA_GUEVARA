import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'database', 'Asistnet.db')

def verify_counts():
    print("=" * 80)
    print("VERIFICACIÓN DE DATOS EN BASE DE DATOS")
    print("=" * 80)
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    tables = ['programas_formacion', 'fichas', 'usuarios', 'instructores', 'aprendices']
    
    for table in tables:
        cursor.execute(f"SELECT COUNT(*) FROM {table}")
        count = cursor.fetchone()[0]
        print(f"📋 Tabla '{table}': {count} registros")
        
        # Mostrar muestra
        if count > 0:
            cursor.execute(f"SELECT * FROM {table} LIMIT 3")
            rows = cursor.fetchall()
            print(f"   Muestra:")
            for row in rows:
                print(f"   - {row}")
        print("-" * 40)

    conn.close()

if __name__ == "__main__":
    verify_counts()
