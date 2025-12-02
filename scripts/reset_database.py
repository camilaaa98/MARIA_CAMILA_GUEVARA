import os

DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'database', 'Asistnet.db')

def reset_database():
    """Elimina la base de datos actual"""
    if os.path.exists(DB_PATH):
        try:
            os.remove(DB_PATH)
            print(f"✓ Base de datos eliminada: {DB_PATH}")
            return True
        except Exception as e:
            print(f"✗ Error al eliminar base de datos: {e}")
            return False
    else:
        print(f"⚠ Base de datos no existe en: {DB_PATH}")
        return True

if __name__ == "__main__":
    print("=" * 80)
    print("ELIMINANDO BASE DE DATOS ACTUAL")
    print("=" * 80)
    reset_database()
