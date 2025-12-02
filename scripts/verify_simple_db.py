import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'database', 'Asistnet.db')

def verify_simple_db():
    print("=" * 80)
    print("VERIFICACIÓN ESQUEMA SIMPLIFICADO")
    print("=" * 80)
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # 1. Verificar Estructura (PKs)
    tables = ['fichas', 'aprendices', 'programas_formacion', 'instructores']
    for t in tables:
        cursor.execute(f"PRAGMA table_info({t})")
        cols = cursor.fetchall()
        pk_col = next((c[1] for c in cols if c[5] == 1), None)
        print(f"Tabla '{t}': PK = {pk_col}")
        
    # 2. Muestra de Datos
    print("\nMuestra Fichas (numero_ficha):")
    cursor.execute("SELECT numero_ficha, nombre_programa FROM fichas LIMIT 3")
    for r in cursor.fetchall():
        print(f"  - {r[0]} ({r[1]})")
        
    print("\nMuestra Aprendices (documento):")
    cursor.execute("SELECT documento, nombre FROM aprendices LIMIT 3")
    for r in cursor.fetchall():
        print(f"  - {r[0]} ({r[1]})")

    conn.close()

if __name__ == "__main__":
    verify_simple_db()
