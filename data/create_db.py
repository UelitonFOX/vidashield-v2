import sqlite3
import bcrypt

def create_tables():
    conn = sqlite3.connect("data/database.db")
    cursor = conn.cursor()

    # Tabela de logs
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event TEXT NOT NULL,
        timestamp TEXT NOT NULL
    )
    """)

    # Tabela de usuários
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
    )
    """)

    conn.commit()
    conn.close()

def create_default_admin():
    """
    Cria um usuário admin de exemplo, caso não exista.
    """
    conn = sqlite3.connect("data/database.db")
    cursor = conn.cursor()

    username = "admin"
    plain_password = "admin123"

    cursor.execute("SELECT id FROM users WHERE username = ?", (username,))
    row = cursor.fetchone()
    if row is None:
        # Cria hash
        hashed = bcrypt.hashpw(plain_password.encode('utf-8'), bcrypt.gensalt())
        cursor.execute("INSERT INTO users (username, password) VALUES (?, ?)", (username, hashed.decode('utf-8')))
        conn.commit()

    conn.close()

if __name__ == "__main__":
    create_tables()
    create_default_admin()
    print("Banco criado e admin cadastrado com sucesso!")
