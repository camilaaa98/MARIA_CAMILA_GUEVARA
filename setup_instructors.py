import sqlite3
import os

db_path = r'c:\wamp64\www\YanguasEjercicios\mockups-asist-net\database\Asistnet.db'

try:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # 1. Create instructores table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS instructores (
        id_instructor INTEGER PRIMARY KEY AUTOINCREMENT,
        id_usuario INTEGER NOT NULL UNIQUE,
        nombres TEXT NOT NULL,
        apellidos TEXT,
        correo TEXT,
        telefono NUMERIC NOT NULL,
        estado TEXT NOT NULL,
        FOREIGN KEY(id_usuario) REFERENCES usuarios(id_usuario) ON UPDATE NO ACTION ON DELETE CASCADE
    )
    ''')
    print("Table 'instructores' created or already exists.")

    # 2. Insert/Update Users in 'usuarios' table
    # Schema: id_usuario, nombre, apellido, correo, password_hash, rol, estado (int)
    # Modified emails to be unique
    
    users_data = [
        (36529252, 'Oscar', 'Yanguas', 'oscar.adsoflorencia@gmail.com', '123456', 'instructor', 1),
        (36579522, 'Pablo', 'Meneses', 'pablo.adsoflorencia@gmail.com', '123456', 'instructor', 1)
    ]

    for uid, nom, ape, email, pwd, rol, est in users_data:
        # Check if user exists
        cursor.execute("SELECT id_usuario FROM usuarios WHERE id_usuario = ?", (uid,))
        if cursor.fetchone():
            print(f"User {uid} already exists. Updating...")
            cursor.execute('''
                UPDATE usuarios 
                SET nombre = ?, apellido = ?, correo = ?, password_hash = ?, rol = ?, estado = ?
                WHERE id_usuario = ?
            ''', (nom, ape, email, pwd, rol, est, uid))
        else:
            print(f"Creating user {uid}...")
            cursor.execute('''
                INSERT INTO usuarios (id_usuario, nombre, apellido, correo, password_hash, rol, estado)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ''', (uid, nom, ape, email, pwd, rol, est))

    # 3. Insert/Update Instructors
    # Using the original email in instructores table if that table doesn't have unique constraint on correo?
    # The schema provided by user for instructores: correo TEXT (no unique constraint mentioned).
    # So I can use the original email there if I want, or the unique one.
    # User said: "correo:adsoflorencia@gmail.com" for both.
    # I'll use the original email for the `instructores` table, but unique for `usuarios` table.
    
    instructors_data = [
        (36529252, 'Oscar', 'Yanguas', 'adsoflorencia@gmail.com', 3168321482, 'activo'),
        (36579522, 'Pablo', 'Meneses', 'adsoflorencia@gmail.com', 3102459266, 'activo')
    ]

    for uid, nom, ape, email, tel, est in instructors_data:
        cursor.execute("SELECT id_instructor FROM instructores WHERE id_usuario = ?", (uid,))
        if cursor.fetchone():
            print(f"Instructor for user {uid} already exists. Updating...")
            cursor.execute('''
                UPDATE instructores 
                SET nombres = ?, apellidos = ?, correo = ?, telefono = ?, estado = ?
                WHERE id_usuario = ?
            ''', (nom, ape, email, tel, est, uid))
        else:
            print(f"Creating instructor for user {uid}...")
            cursor.execute('''
                INSERT INTO instructores (id_usuario, nombres, apellidos, correo, telefono, estado)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (uid, nom, ape, email, tel, est))

    conn.commit()
    print("Database updated successfully.")

except sqlite3.Error as e:
    print(f"SQLite Error: {e}")
finally:
    if conn:
        conn.close()
