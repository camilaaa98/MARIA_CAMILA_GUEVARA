import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'database', 'Asistnet.db')

def list_usuarios():
    print("=" * 80)
    print("LISTADO DE USUARIOS EN BASE DE DATOS")
    print("=" * 80)
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Admin
    print("\n👤 ADMINISTRADORES:")
    cursor.execute("SELECT nombre, apellido, correo FROM usuarios WHERE rol = 'administrador'")
    for r in cursor.fetchall():
        print(f"  - {r[0]} {r[1]} ({r[2]}) | Password: 123456")
    
    # Instructores
    print("\n👨‍🏫 INSTRUCTORES:")
    cursor.execute("SELECT nombre, apellido, correo FROM usuarios WHERE rol = 'instructor' ORDER BY nombre LIMIT 20")
    instructores = cursor.fetchall()
    for r in instructores:
        print(f"  - {r[0]} {r[1]} ({r[2]}) | Password: 123456")
    
    cursor.execute("SELECT COUNT(*) FROM usuarios WHERE rol = 'instructor'")
    total = cursor.fetchone()[0]
    if total > 20:
        print(f"\n  ... y {total - 20} instructores más (Todos con contraseña: 123456)")
    
    print(f"\n✅ Total Usuarios: Administradores=1, Instructores={total}")
    print("\n🔑 CONTRASEÑA UNIVERSAL: 123456")

    conn.close()

if __name__ == "__main__":
    list_usuarios()
