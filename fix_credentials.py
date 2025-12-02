import sqlite3

db_path = r'c:\wamp64\www\YanguasEjercicios\mockups-asist-net\database\Asistnet.db'

try:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Verificar usuarios con rol instructor
    cursor.execute("SELECT id_usuario, nombre, apellido, correo, rol FROM usuarios WHERE rol = 'instructor'")
    instructores = cursor.fetchall()
    
    print("Usuarios con rol 'instructor':")
    for inst in instructores:
        print(f"ID: {inst[0]}, Nombre: {inst[1]} {inst[2]}, Correo: {inst[3]}, Rol: {inst[4]}")
        
    # Actualizar passwords a '123456' sin hash para pruebas rápidas
    # (En producción deberías usar password_hash en PHP)
    print("\nActualizando passwords...")
    cursor.execute("UPDATE usuarios SET password_hash = '123456' WHERE id_usuario IN (36529252, 36579522)")
    conn.commit()
    print("Passwords actualizados a '123456' (sin hash)")
    
except sqlite3.Error as e:
    print(f"SQLite Error: {e}")
finally:
    if conn:
        conn.close()
