import sqlite3
import os

db_path = 'db.sqlite3'
if not os.path.exists(db_path):
    print(f"Error: {db_path} not found.")
else:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    # Query to get the SQL creation statement for each table starting with 'api_'
    cursor.execute("SELECT name, sql FROM sqlite_master WHERE type='table' AND name LIKE 'api_%';")
    tables = cursor.fetchall()
    
    print("Database Structure (Schema) for API tables:\n")
    for name, sql in tables:
        print(f"--- Table: {name} ---")
        print(f"{sql}\n")
    
    conn.close()
