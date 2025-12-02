import sqlite3
import os
import time

DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'database', 'Asistnet.db')

def force_delete_database():
    """Fuerza el cierre de conexiones y elimina la base de datos"""
    if os.path.exists(DB_PATH):
        max_attempts = 5
        for attempt in range(max_attempts):
            try:
                # Intentar conectar y cerrar para forzar la liberación
                conn = sqlite3.connect(DB_PATH)
                conn.close()
                
                # Intentar eliminar
                os.remove(DB_PATH)
                print(f"✓ Base de datos eliminada: {DB_PATH}")
                return True
            except Exception as e:
                if attempt < max_attempts - 1:
                    print(f"⚠ Intento {attempt + 1} fallido, reintentando...")
                    time.sleep(0.5)
                else:
                    print(f"✗ No se pudo eliminar después de {max_attempts} intentos: {e}")
                    print("\n⚠ SOLUCIÓN: Cierra todos los programas que puedan estar usando la BD")
                    print("   (DB Browser, scripts Python, navegador con PHP, etc.)")
                    return False
    else:
        print(f"⚠ Base de datos no existe en: {DB_PATH}")
        return True

if __name__ == "__main__":
    print("=" * 80)
    print("ELIMINANDO BASE DE DATOS (FORZADO)")
    print("=" * 80)
    force_delete_database()
