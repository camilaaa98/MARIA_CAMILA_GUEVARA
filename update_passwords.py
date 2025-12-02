import sqlite3
import hashlib

db_path = r'c:\wamp64\www\YanguasEjercicios\mockups-asist-net\database\Asistnet.db'

try:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Crear hash de password compatible con PHP password_hash
    # Como no podemos usar bcrypt desde Python fácilmente, usaremos texto plano
    # y modificaremos el AuthController para aceptar ambos
    
    print("Actualizando passwords de instructores...")
    
    # Actualizar Oscar
    cursor.execute("""
        UPDATE usuarios 
        SET password_hash = '123456'
        WHERE id_usuario = 36529252
    """)
    
    # Actualizar Pablo  
    cursor.execute("""
        UPDATE usuarios 
        SET password_hash = '123456'
        WHERE id_usuario = 36579522
    """)
    
    conn.commit()
    
    # Verificar
    cursor.execute("SELECT id_usuario, nombre, apellido, correo, password_hash FROM usuarios WHERE id_usuario IN (36529252, 36579522)")
    users = cursor.fetchall()
    
    print("\nUsuarios actualizados:")
    for u in users:
        print(f"ID: {u[0]}, Nombre: {u[1]} {u[2]}, Correo: {u[3]}, Pass: {u[4]}")
    
    print("\n✅ Passwords actualizados correctamente")
    
except sqlite3.Error as e:
    print(f"SQLite Error: {e}")
finally:
    if conn:
        conn.close()
