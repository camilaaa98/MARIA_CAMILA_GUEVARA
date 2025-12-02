import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'database', 'Asistnet.db')

def verify_import_status():
    print("=" * 80)
    print("VERIFICACIÓN POST-IMPORTACIÓN")
    print("=" * 80)
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # 1. Conteos generales
    tables = ['programas_formacion', 'fichas', 'aprendices', 'instructores', 'usuarios']
    for t in tables:
        cursor.execute(f"SELECT COUNT(*) FROM {t}")
        print(f"Tabla {t}: {cursor.fetchone()[0]}")
        
    # 2. Verificar instructor_lider en fichas
    print("\nMuestra de Fichas (instructor_lider):")
    cursor.execute("SELECT numero_ficha, instructor_lider FROM fichas LIMIT 10")
    rows = cursor.fetchall()
    for r in rows:
        print(f"  Ficha {r[0]}: '{r[1]}'")
        
    # 3. Verificar si hay instructores en fichas que no estan en usuarios
    print("\nInstructores únicos en fichas:")
    cursor.execute("SELECT DISTINCT instructor_lider FROM fichas WHERE instructor_lider IS NOT NULL AND instructor_lider != ''")
    instructores = cursor.fetchall()
    for i in instructores:
        print(f"  - {i[0]}")

    conn.close()

if __name__ == "__main__":
    verify_import_status()
