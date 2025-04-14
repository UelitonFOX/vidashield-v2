import sqlite3
import bcrypt
import streamlit as st
from logger import log_event

def login_user(username, password):
    """
    Verifica as credenciais do usuário no banco de dados SQLite.
    """
    conn = sqlite3.connect("data/database.db")
    cursor = conn.cursor()

    cursor.execute("SELECT password FROM users WHERE username = ?", (username,))
    row = cursor.fetchone()
    conn.close()

    if row:
        stored_hash = row[0]
        return bcrypt.checkpw(password.encode('utf-8'), stored_hash.encode('utf-8'))
    return False

def is_authenticated():
    return st.session_state.get("logged_in", False)
