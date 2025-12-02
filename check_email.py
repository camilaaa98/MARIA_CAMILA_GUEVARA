import sqlite3

db_path = r'c:\wamp64\www\YanguasEjercicios\mockups-asist-net\database\Asistnet.db'

try:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    email = 'adsoflorencia@gmail.com'
    cursor.execute("SELECT id_usuario, nombre, apellido FROM usuarios WHERE correo = ?", (email,))
    users = cursor.fetchall()
    
    print(f"Users with email {email}:")
    for u in users:
        print(u)
        
except sqlite3.Error as e:
    print(f"SQLite Error: {e}")
finally:
    if conn:
        conn.close()
