import sqlite3
import os

DB_PATH = os.path.join('..', 'database', 'Asistnet.db')

def check_schema():
    if not os.path.exists(DB_PATH):
        print(f"Database not found at {DB_PATH}")
        return
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Get all tables
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;")
    tables = cursor.fetchall()
    
    print("=" * 80)
    print("TABLAS ACTUALES EN LA BASE DE DATOS:")
    print("=" * 80)
    
    for table in tables:
        table_name = table[0]
        print(f"\n\n--- TABLA: {table_name} ---")
        
        # Get table schema
        cursor.execute(f"PRAGMA table_info({table_name});")
        columns = cursor.fetchall()
        
        print("\nColumnas:")
        for col in columns:
            pk_marker = " [PK]" if col[5] == 1 else ""
            print(f"  - {col[1]} ({col[2]}){pk_marker}")
        
        # Get foreign keys
        cursor.execute(f"PRAGMA foreign_key_list({table_name});")
        fks = cursor.fetchall()
        
        if fks:
            print("\nForeign Keys:")
            for fk in fks:
                print(f"  - {fk[3]} -> {fk[2]}({fk[4]})")
    
    conn.close()

if __name__ == "__main__":
    check_schema()
