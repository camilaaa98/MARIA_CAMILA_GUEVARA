import openpyxl
import sys

try:
    # Load workbook
    wb = openpyxl.load_workbook('database/cristian2.xlsx')
    sheet = wb.active
    
    # Get headers
    headers = []
    for cell in sheet[1]:
        headers.append(cell.value)
    
    print("Columns:")
    for i, h in enumerate(headers):
        print(f"{i}: {h}")
    
    # Print first row
    print("\nFirst data row:")
    for row in sheet.iter_rows(min_row=2, max_row=2, values_only=True):
        for i, val in enumerate(row):
            print(f"{i}: {val}")

except Exception as e:
    print(f"Error reading excel: {e}")
