import sqlite3
from datetime import datetime

def log_event(event):
    conn = sqlite3.connect("data/database.db")
    cursor = conn.cursor()
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    cursor.execute("INSERT INTO logs (event, timestamp) VALUES (?, ?)", (event, timestamp))
    conn.commit()
    conn.close()

def get_recent_logs(limit=10):
    conn = sqlite3.connect("data/database.db")
    cursor = conn.cursor()
    cursor.execute("SELECT event, timestamp FROM logs ORDER BY id DESC LIMIT ?", (limit,))
    logs = cursor.fetchall()
    conn.close()
    return logs
