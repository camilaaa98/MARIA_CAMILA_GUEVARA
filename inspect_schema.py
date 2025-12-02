import sqlite3
import sys

db_path = r'c:\wamp64\www\YanguasEjercicios\mockups-asist-net\database\Asistnet.db'

try:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    cursor.execute("PRAGMA table_info(usuarios)")
    columns = cursor.fetchall()
    
    with open('schema_utf8.txt', 'w', encoding='utf-8') as f:
        f.write("Columns in 'usuarios':\n")
        for col in columns:
            f.write(str(col) + "\n")
            
    print("Schema written to schema_utf8.txt")
        
except sqlite3.Error as e:
    print(f"SQLite Error: {e}")
finally:
    if conn:
        conn.close()
