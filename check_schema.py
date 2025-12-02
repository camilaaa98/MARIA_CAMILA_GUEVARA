import sqlite3
import json

# Conectar a la base de datos
conn = sqlite3.connect('database/Asistnet.db')
cursor = conn.cursor()

# Obtener todas las tablas
cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
tables = cursor.fetchall()

schema = {}
for table in tables:
    table_name = table[0]
    cursor.execute(f"PRAGMA table_info({table_name})")
    columns = cursor.fetchall()
    schema[table_name] = [{'name': col[1], 'type': col[2], 'notnull': col[3], 'pk': col[5]} for col in columns]

# Imprimir esquema
print(json.dumps(schema, indent=2))

conn.close()
