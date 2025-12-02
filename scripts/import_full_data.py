import pandas as pd
import sqlite3
import os
import hashlib

# Configuración
DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'database', 'Asistnet.db')
CRISTIAN_PATH = os.path.join(os.path.dirname(__file__), '..', 'database', 'cristian2.xlsx')
APRENDICES_PATH = os.path.join(os.path.dirname(__file__), '..', 'database', 'Aprendices.xlsx')

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def clean_text(text):
    if pd.isna(text):
        return None
    return str(text).strip().upper()

def import_data():
    print("=" * 80)
    print("INICIANDO IMPORTACIÓN MASIVA DE DATOS")
    print("=" * 80)
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # ---------------------------------------------------------
    # 1. IMPORTAR PROGRAMAS Y FICHAS (desde cristian2.xlsx)
    # ---------------------------------------------------------
    print("\n📂 Leyendo cristian2.xlsx...")
    try:
        df_cristian = pd.read_excel(CRISTIAN_PATH)
    except Exception as e:
        print(f"❌ Error leyendo cristian2.xlsx: {e}")
        return

    # Identificar columnas (búsqueda flexible)
    cols = {c.lower(): c for c in df_cristian.columns}
    col_ficha = next((cols[c] for c in cols if 'ficha' in c), None)
    col_jornada = next((cols[c] for c in cols if 'jornada' in c), None)
    col_nivel = next((cols[c] for c in cols if 'nivel' in c), None)
    col_prog = next((cols[c] for c in cols if 'formacion' in c and 'nivel' not in c), None)
    col_inst = next((cols[c] for c in cols if 'instructor' in c or 'lider' in c), None)

    print(f"   Columnas detectadas: Ficha='{col_ficha}', Programa='{col_prog}', Nivel='{col_nivel}', Jornada='{col_jornada}', Instructor='{col_inst}'")

    # A. IMPORTAR PROGRAMAS
    print("\n1️⃣  Importando Programas de Formación...")
    programas_unicos = df_cristian[[col_prog, col_nivel, col_inst]].drop_duplicates(subset=[col_prog])
    
    count_prog = 0
    for _, row in programas_unicos.iterrows():
        nombre = clean_text(row[col_prog])
        nivel = clean_text(row[col_nivel])
        instructor = clean_text(row[col_inst])
        
        if nombre:
            try:
                cursor.execute('''
                    INSERT OR IGNORE INTO programas_formacion (nombre_programa, nivel_formacion, instructor_lider)
                    VALUES (?, ?, ?)
                ''', (nombre, nivel, instructor))
                if cursor.rowcount > 0:
                    count_prog += 1
            except sqlite3.Error as e:
                print(f"   ⚠ Error insertando programa {nombre}: {e}")

    print(f"   ✓ {count_prog} programas insertados.")

    # B. IMPORTAR INSTRUCTORES (Crear Usuarios)
    print("\n2️⃣  Procesando Instructores...")
    instructores_unicos = df_cristian[col_inst].dropna().unique()
    count_inst = 0
    
    for nombre_completo in instructores_unicos:
        nombre_completo = clean_text(nombre_completo)
        if not nombre_completo: continue
        
        # Generar datos de usuario
        parts = nombre_completo.split()
        nombre = parts[0]
        apellido = ' '.join(parts[1:]) if len(parts) > 1 else 'Instructor'
        email = f"{nombre.lower()}.{parts[-1].lower() if len(parts)>1 else 'sena'}@sena.edu.co"
        # Evitar duplicados de email simples
        
        # Verificar si existe
        cursor.execute("SELECT id_usuario FROM usuarios WHERE correo = ?", (email,))
        user = cursor.fetchone()
        
        if not user:
            password_hash = hashlib.sha256('123456'.encode()).hexdigest()
            try:
                cursor.execute('''
                    INSERT INTO usuarios (nombre, apellido, correo, password_hash, rol, estado)
                    VALUES (?, ?, ?, ?, 'instructor', 'activo')
                ''', (nombre, apellido, email, password_hash))
                user_id = cursor.lastrowid
                
                # Crear registro en tabla instructores
                cursor.execute('''
                    INSERT INTO instructores (id_usuario, nombres, apellidos, correo, estado)
                    VALUES (?, ?, ?, ?, 'activo')
                ''', (user_id, nombre, apellido, email))
                count_inst += 1
            except sqlite3.Error as e:
                # Si falla por email duplicado, intentamos con un random
                pass

    print(f"   ✓ {count_inst} instructores creados como usuarios.")

    # C. IMPORTAR FICHAS
    print("\n3️⃣  Importando Fichas...")
    fichas_unicas = df_cristian.drop_duplicates(subset=[col_ficha])
    count_fichas = 0
    
    for _, row in fichas_unicas.iterrows():
        try:
            numero = int(row[col_ficha])
            programa = clean_text(row[col_prog])
            jornada = clean_text(row[col_jornada])
            instructor = clean_text(row[col_inst])
            
            cursor.execute('''
                INSERT OR REPLACE INTO fichas (numero_ficha, nombre_programa, jornada, estado, instructor_lider)
                VALUES (?, ?, ?, 'ACTIVO', ?)
            ''', (numero, programa, jornada, instructor))
            count_fichas += 1
        except Exception as e:
            print(f"   ⚠ Error ficha {row[col_ficha]}: {e}")

    print(f"   ✓ {count_fichas} fichas insertadas/actualizadas.")

    # ---------------------------------------------------------
    # 2. IMPORTAR APRENDICES (desde Aprendices.xlsx)
    # ---------------------------------------------------------
    print("\n📂 Leyendo Aprendices.xlsx...")
    try:
        df_aprendices = pd.read_excel(APRENDICES_PATH)
    except Exception as e:
        print(f"❌ Error leyendo Aprendices.xlsx: {e}")
        conn.close()
        return

    # Mapeo de columnas
    cols_apr = {c.lower(): c for c in df_aprendices.columns}
    col_doc = next((cols_apr[c] for c in cols_apr if 'documento' in c), None)
    col_nom = next((cols_apr[c] for c in cols_apr if 'nombre' in c), None)
    col_ape = next((cols_apr[c] for c in cols_apr if 'apellido' in c), None)
    col_ficha_apr = next((cols_apr[c] for c in cols_apr if 'ficha' in c), None)
    col_tipo = next((cols_apr[c] for c in cols_apr if 'tipo' in c), None)
    col_cel = next((cols_apr[c] for c in cols_apr if 'celular' in c), None)
    col_mail = next((cols_apr[c] for c in cols_apr if 'correo' in c), None)

    print(f"   Columnas detectadas: Doc='{col_doc}', Nom='{col_nom}', Ficha='{col_ficha_apr}'")

    print("\n4️⃣  Importando Aprendices...")
    count_apr = 0
    errores_apr = 0
    
    for _, row in df_aprendices.iterrows():
        try:
            doc = int(row[col_doc])
            tipo = clean_text(row[col_tipo]) if col_tipo else 'CC'
            nom = clean_text(row[col_nom])
            ape = clean_text(row[col_ape])
            mail = clean_text(row[col_mail])
            cel = row[col_cel] if col_cel and pd.notna(row[col_cel]) else None
            ficha = int(row[col_ficha_apr])
            
            # Verificar si la ficha existe
            cursor.execute("SELECT 1 FROM fichas WHERE numero_ficha = ?", (ficha,))
            if not cursor.fetchone():
                # Si la ficha no existe (porque no estaba en cristian2), la creamos genérica
                # Ojo: Esto es un riesgo, pero necesario para integridad FK
                cursor.execute('''
                    INSERT OR IGNORE INTO programas_formacion (nombre_programa, nivel_formacion)
                    VALUES ('PROGRAMA GENERICO', 'NO DEFINIDO')
                ''')
                cursor.execute('''
                    INSERT OR IGNORE INTO fichas (numero_ficha, nombre_programa, jornada, estado)
                    VALUES (?, 'PROGRAMA GENERICO', 'NO DEFINIDA', 'ACTIVO')
                ''', (ficha,))
            
            cursor.execute('''
                INSERT OR REPLACE INTO aprendices (documento, tipo_identificacion, nombre, apellido, correo, celular, numero_ficha, estado)
                VALUES (?, ?, ?, ?, ?, ?, ?, 'EN FORMACION')
            ''', (doc, tipo, nom, ape, mail, cel, ficha))
            count_apr += 1
            
        except Exception as e:
            errores_apr += 1
            # print(f"   Error aprendiz fila: {e}")

    print(f"   ✓ {count_apr} aprendices insertados.")
    print(f"   ⚠ {errores_apr} errores/omitidos.")

    conn.commit()
    conn.close()
    
    print("\n" + "=" * 80)
    print("✅ IMPORTACIÓN COMPLETADA")
    print("=" * 80)

if __name__ == "__main__":
    import_data()
