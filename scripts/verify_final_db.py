import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'database', 'Asistnet.db')

def verify_final_state():
    print("=" * 80)
    print("VERIFICACIÓN ESTADO FINAL BD")
    print("=" * 80)
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # 1. Verificar Fichas (Muestra)
    print("Muestra de Fichas (id vs numero):")
    cursor.execute("SELECT id_ficha, numero_ficha, nombre_programa, instructor_lider FROM fichas LIMIT 5")
    rows = cursor.fetchall()
    for r in rows:
        print(f"  ID: {r[0]} | Num: {r[1]} | Prog: {r[2][:30]}... | Inst: {r[3]}")
        
    # 2. Verificar Instructores
    cursor.execute("SELECT COUNT(*) FROM instructores")
    count_inst = cursor.fetchone()[0]
    print(f"\nTotal Instructores: {count_inst}")
    
    # 3. Verificar Aprendices
    cursor.execute("SELECT COUNT(*) FROM aprendices")
    count_apr = cursor.fetchone()[0]
    print(f"Total Aprendices: {count_apr}")

    conn.close()

if __name__ == "__main__":
    verify_final_state()
