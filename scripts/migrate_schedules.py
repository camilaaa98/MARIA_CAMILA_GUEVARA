import openpyxl
import sqlite3
import re

def parse_schedule(schedule_str):
    """
    Parses a schedule string like "LUNES A SABADO \n 12:00-20:00"
    Returns a list of dictionaries with day (1-7), start_time, end_time
    """
    if not schedule_str:
        return []
        
    schedule_str = str(schedule_str).upper().strip()
    
    # Extract time range
    time_match = re.search(r'(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})', schedule_str)
    if not time_match:
        return []
        
    start_time = time_match.group(1)
    end_time = time_match.group(2)
    
    # Extract days
    days = []
    
    # Map days to numbers
    day_map = {
        'LUNES': 1, 'MARTES': 2, 'MIERCOLES': 3, 'JUEVES': 4, 'VIERNES': 5, 'SABADO': 6, 'DOMINGO': 7
    }
    
    if 'LUNES A SABADO' in schedule_str:
        days = [1, 2, 3, 4, 5, 6]
    elif 'LUNES A VIERNES' in schedule_str:
        days = [1, 2, 3, 4, 5]
    else:
        # Try to find individual days
        for name, num in day_map.items():
            if name in schedule_str:
                days.append(num)
                
    return [{'dia': d, 'inicio': start_time, 'fin': end_time} for d in days]

def normalize_text(text):
    """
    Normalizes text for comparison (uppercase, remove accents, etc)
    """
    if not text:
        return ""
    text = str(text).upper().strip()
    replacements = (
        ("Á", "A"), ("É", "E"), ("Í", "I"), ("Ó", "O"), ("Ú", "U"),
        ("Ñ", "N"), (".", ""), (",", "")
    )
    for a, b in replacements:
        text = text.replace(a, b)
    return text

def get_programa_id(cursor, nombre_programa):
    """
    Finds program ID by name (fuzzy match)
    """
    if not nombre_programa:
        return None
        
    normalized_search = normalize_text(nombre_programa)
    
    cursor.execute("SELECT id_programa, nombre_programa FROM programas_formacion")
    programas = cursor.fetchall()
    
    for prog_id, prog_nombre in programas:
        if normalize_text(prog_nombre) == normalized_search:
            return prog_id
            
    # Try partial match
    for prog_id, prog_nombre in programas:
        if normalized_search in normalize_text(prog_nombre) or normalize_text(prog_nombre) in normalized_search:
            return prog_id
            
    return None

def get_ficha_id(cursor, numero_ficha):
    """
    Finds ficha ID by number
    """
    cursor.execute("SELECT id_ficha FROM fichas WHERE numero_ficha = ?", (numero_ficha,))
    result = cursor.fetchone()
    return result[0] if result else None

def create_ficha(cursor, numero_ficha, nombre_programa, jornada='MIXTA'):
    """
    Creates a new ficha using nombre_programa (TEXT) as the table has it
    """
    try:
        cursor.execute(
            "INSERT INTO fichas (numero_ficha, nombre_programa, jornada, estado) VALUES (?, ?, ?, ?)", 
            (numero_ficha, nombre_programa, jornada, 'Formacion')
        )
        return cursor.lastrowid
    except sqlite3.Error as e:
        print(f"Error creating ficha {numero_ficha}: {e}")
        return None

def get_instructor_id(cursor, name):
    """
    Finds instructor ID by name (case insensitive)
    """
    if not name:
        return None
    
    name_parts = str(name).split()
    if len(name_parts) < 2:
        return None
        
    # Try to match first name and last name
    cursor.execute("SELECT id_instructor, nombres, apellidos FROM instructores")
    instructors = cursor.fetchall()
    
    for inst_id, nom, ape in instructors:
        full_name = f"{nom} {ape}".upper()
        search_name = str(name).upper()
        
        if search_name in full_name or full_name in search_name:
            return inst_id
            
    return None

def assign_instructor_to_ficha(cursor, id_ficha, id_instructor, es_lider=0):
    """
    Creates assignment in asignaciones_instructor_ficha
    """
    try:
        # Check if assignment already exists
        cursor.execute(
            "SELECT id_asignacion FROM asignaciones_instructor_ficha WHERE id_ficha = ? AND id_instructor = ?",
            (id_ficha, id_instructor)
        )
        if cursor.fetchone():
            # Update es_lider if needed
            if es_lider:
                cursor.execute(
                    "UPDATE asignaciones_instructor_ficha SET es_lider = ? WHERE id_ficha = ? AND id_instructor = ?",
                    (es_lider, id_ficha, id_instructor)
                )
            return True
        
        # Create new assignment
        cursor.execute(
            "INSERT INTO asignaciones_instructor_ficha (id_ficha, id_instructor, es_lider) VALUES (?, ?, ?)",
            (id_ficha, id_instructor, es_lider)
        )
        return True
    except sqlite3.Error as e:
        print(f"Error assigning instructor: {e}")
        return False

def migrate():
    db_path = 'database/Asistnet.db'
    excel_path = 'database/cristian2.xlsx'
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    wb = openpyxl.load_workbook(excel_path)
    sheet = wb.active
    
    print("Starting migration...")
    
    count = 0
    created_fichas = 0
    
    for row in sheet.iter_rows(min_row=2, values_only=True):
        # Columns: 0:Nivel, 1:Formacion, 2:Ficha, 3:Horario, 4:Jornada, 5:Instructor lider
        formacion_name = row[1]
        ficha_num = row[2]
        schedule_str = row[3]
        jornada = row[4] if row[4] else 'MIXTA'
        instructor_lider_name = row[5]
        
        if not ficha_num or not schedule_str or not formacion_name:
            continue
            
        # 1. Get or Create Ficha
        ficha_id = get_ficha_id(cursor, ficha_num)
        if not ficha_id:
            # Create ficha using nombre_programa directly
            print(f"Creating Ficha {ficha_num} for '{formacion_name}' - Jornada: {jornada}")
            ficha_id = create_ficha(cursor, ficha_num, formacion_name, jornada)
            if ficha_id:
                created_fichas += 1
                print(f"  -> Created Ficha ID: {ficha_id}")
            else:
                print(f"  -> Failed to create Ficha {ficha_num}")
                continue
        
        if not ficha_id:
            continue
            
        # 2. Get Instructor Lider ID
        instructor_lider_id = get_instructor_id(cursor, instructor_lider_name)
        if not instructor_lider_id:
            print(f"Skipping: Instructor Líder '{instructor_lider_name}' not found in DB")
            continue
        
        # 3. Assign Instructor as Lider
        if assign_instructor_to_ficha(cursor, ficha_id, instructor_lider_id, es_lider=1):
            print(f"Assigned {instructor_lider_name} as Líder for Ficha {ficha_num}")
            
        # 4. Parse Schedule
        schedules = parse_schedule(schedule_str)
        if not schedules:
            print(f"Skipping: Could not parse schedule '{schedule_str}'")
            continue
        
        # 5. Insert Schedule into DB
        for sched in schedules:
            try:
                cursor.execute("""
                    INSERT INTO horarios_formacion (id_ficha, id_instructor, dia_semana, hora_inicio, hora_fin)
                    VALUES (?, ?, ?, ?, ?)
                """, (ficha_id, instructor_lider_id, sched['dia'], sched['inicio'], sched['fin']))
                count += 1
            except sqlite3.Error as e:
                print(f"Error inserting schedule: {e}")
            
    conn.commit()
    conn.close()
    print(f"Migration complete. Created {created_fichas} fichas. Inserted {count} schedule records.")

if __name__ == "__main__":
    migrate()
