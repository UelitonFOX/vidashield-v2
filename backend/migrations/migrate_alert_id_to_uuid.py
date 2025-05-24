"""
Script de migração para converter a coluna id da tabela alert
de tipo INTEGER para UUID no PostgreSQL.

Este script deve ser executado diretamente no ambiente onde o banco de dados
PostgreSQL está em execução.
"""

import os
import sys
from dotenv import load_dotenv
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

# Adicionar diretório pai ao path para importações
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Carregar variáveis de ambiente
load_dotenv()
DATABASE_URL = os.getenv('DATABASE_URL')


def migrate():
    """Executa a migração para converter a coluna id para UUID."""
    print("Iniciando migração da tabela 'alert'...")

    # Conectar ao banco de dados
    conn = psycopg2.connect(DATABASE_URL)
    conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
    cursor = conn.cursor()

    try:
        # 1. Criar uma tabela temporária com a estrutura desejada
        print("1. Criando tabela temporária...")
        cursor.execute("""
        CREATE TABLE alert_temp (
            id UUID PRIMARY KEY,
            type VARCHAR(50) NOT NULL,
            severity VARCHAR(20) NOT NULL,
            details JSON,
            timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
            resolved BOOLEAN NOT NULL DEFAULT FALSE,
            resolved_time TIMESTAMP WITH TIME ZONE,
            user_id UUID NOT NULL REFERENCES "user"(id),
            resolved_by UUID REFERENCES "user"(id)
        );
        """)

        # 2. Copiar os dados, convertendo o id para UUID
        print("2. Copiando dados com conversão de ID para UUID...")
        cursor.execute("""
        INSERT INTO alert_temp (
            id, type, severity, details, timestamp, resolved,
            resolved_time, user_id, resolved_by
        )
        SELECT
            uuid_generate_v4() as id,
            type, severity, details, timestamp, resolved,
            resolved_time, user_id, resolved_by
        FROM alert;
        """)

        # 3. Verificar quantas linhas foram migradas
        cursor.execute("SELECT COUNT(*) FROM alert;")
        count_original = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(*) FROM alert_temp;")
        count_new = cursor.fetchone()[0]

        print(f"Migração: {count_new}/{count_original} linhas transferidas.")

        if count_original != count_new:
            raise Exception("Número de linhas diferente após a migração!")

        # 4. Salvar IDs antigos para referência, se necessário
        print("3. Salvando mapeamento de IDs antigos para novos...")
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS migration_log (
            table_name VARCHAR(100),
            old_id INTEGER,
            new_id UUID,
            migrated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
        """)

        cursor.execute("""
        INSERT INTO migration_log (table_name, old_id, new_id)
        SELECT 'alert', a.id, at.id
        FROM alert a
        JOIN alert_temp at ON (
            a.type = at.type AND
            a.severity = at.severity AND
            a.timestamp = at.timestamp AND
            a.user_id = at.user_id
        );
        """)

        # 5. Substituir a tabela original
        print("4. Substituindo tabela original...")
        cursor.execute("DROP TABLE alert CASCADE;")
        cursor.execute("ALTER TABLE alert_temp RENAME TO alert;")

        # 6. Recriar índices e chaves estrangeiras
        print("5. Recriando índices...")
        cursor.execute("""
        CREATE INDEX idx_alert_user_id ON alert(user_id);
        CREATE INDEX idx_alert_timestamp ON alert(timestamp);
        CREATE INDEX idx_alert_resolved ON alert(resolved);
        """)

        print("Migração concluída com sucesso!")

    except Exception as e:
        conn.rollback()
        print(f"Erro durante a migração: {e}")
        raise
    finally:
        cursor.close()
        conn.close()


if __name__ == "__main__":
    # Verificar se a extensão uuid-ossp está disponível
    conn = psycopg2.connect(DATABASE_URL)
    cursor = conn.cursor()

    try:
        cursor.execute("CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";")
        conn.commit()
    except Exception as e:
        print(f"Erro ao criar extensão uuid-ossp: {e}")
    finally:
        cursor.close()
        conn.close()

    # Executar migração
    migrate()
