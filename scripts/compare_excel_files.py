import pandas as pd
import os

APRENDICES_PATH = r'C:\wamp64\www\YanguasEjercicios\mockups-asist-net\database\Aprendices.xlsx'
CRISTIAN_PATH = r'C:\wamp64\www\YanguasEjercicios\mockups-asist-net\database\cristian2.xlsx'

def compare_files():
    """Compara ambos archivos y muestra qué cambios se harían"""
    
    print("=" * 80)
    print("ANÁLISIS DE ARCHIVOS EXCEL")
    print("=" * 80)
    
    # Leer Aprendices.xlsx
    print("\n📂 Leyendo Aprendices.xlsx...")
    df_aprendices = pd.read_excel(APRENDICES_PATH)
    print(f"   Registros: {len(df_aprendices)}")
    print(f"   Columnas: {list(df_aprendices.columns)}")
    
    # Leer cristian2.xlsx
    print("\n📂 Leyendo cristian2.xlsx...")
    df_cristian = pd.read_excel(CRISTIAN_PATH)
    print(f"   Registros: {len(df_cristian)}")
    print(f"   Columnas: {list(df_cristian.columns)}")
    
    # Mostrar primeras filas de cada uno
    print("\n" + "=" * 80)
    print("MUESTRA DE DATOS - Aprendices.xlsx (primeras 3 filas)")
    print("=" * 80)
    print(df_aprendices.head(3).to_string())
    
    print("\n" + "=" * 80)
    print("MUESTRA DE DATOS - cristian2.xlsx (primeras 3 filas)")
    print("=" * 80)
    print(df_cristian.head(3).to_string())
    
    # Identificar columna de ficha en ambos archivos
    print("\n" + "=" * 80)
    print("IDENTIFICANDO COLUMNAS CLAVE")
    print("=" * 80)
    
    # Buscar columna de ficha
    ficha_cols_aprendices = [col for col in df_aprendices.columns if 'ficha' in col.lower()]
    ficha_cols_cristian = [col for col in df_cristian.columns if 'ficha' in col.lower()]
    
    print(f"Columnas con 'ficha' en Aprendices.xlsx: {ficha_cols_aprendices}")
    print(f"Columnas con 'ficha' en cristian2.xlsx: {ficha_cols_cristian}")
    
    # Buscar columnas de jornada, nivel, instructor
    jornada_cols_cristian = [col for col in df_cristian.columns if 'jornada' in col.lower()]
    nivel_cols_cristian = [col for col in df_cristian.columns if 'nivel' in col.lower() or 'formacion' in col.lower()]
    instructor_cols_cristian = [col for col in df_cristian.columns if 'instructor' in col.lower() or 'lider' in col.lower()]
    
    print(f"\nColumnas de jornada en cristian2.xlsx: {jornada_cols_cristian}")
    print(f"Columnas de nivel en cristian2.xlsx: {nivel_cols_cristian}")
    print(f"Columnas de instructor en cristian2.xlsx: {instructor_cols_cristian}")
    
    # Valores únicos de ficha en cristian2
    if ficha_cols_cristian:
        fichas_cristian = df_cristian[ficha_cols_cristian[0]].unique()
        print(f"\n📋 Fichas en cristian2.xlsx ({len(fichas_cristian)} únicas):")
        print(f"   {sorted(fichas_cristian)}")

if __name__ == "__main__":
    compare_files()
