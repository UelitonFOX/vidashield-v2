#!/usr/bin/env python3
"""
Script para testar a conexão com Supabase.
"""

import os
import sys
sys.path.append('.')

from sqlalchemy import create_engine, text
from dotenv import load_dotenv

def test_supabase_connection():
    """Testa a conexão e estrutura do Supabase."""
    
    load_dotenv()
    
    DATABASE_URL = os.getenv('DATABASE_URL')
    print(f'🔗 Conectando com: {DATABASE_URL[:50]}...')
    
    try:
        engine = create_engine(DATABASE_URL)
        
        with engine.connect() as conn:
            # Teste 1: Contar usuários
            result = conn.execute(text('SELECT COUNT(*) as count FROM users'))
            row = result.fetchone()
            print(f'✅ Conexão bem-sucedida! Usuários na base: {row.count}')
            
            # Teste 2: View do dashboard
            try:
                result = conn.execute(text('SELECT * FROM dashboard_stats'))
                stats = result.fetchone()
                print(f'📊 Dashboard Stats: {dict(stats._mapping)}')
            except Exception as e:
                print(f'⚠️  View dashboard_stats: {e}')
            
            # Teste 3: Listar tabelas
            result = conn.execute(text("""
                SELECT table_name, table_type 
                FROM information_schema.tables 
                WHERE table_schema = 'public' 
                ORDER BY table_name
            """))
            tables = result.fetchall()
            print(f'📋 Tabelas disponíveis ({len(tables)}):')
            for table in tables:
                print(f'   - {table.table_name} ({table.table_type})')
            
            # Teste 4: Verificar estrutura da tabela users
            result = conn.execute(text("""
                SELECT column_name, data_type, is_nullable 
                FROM information_schema.columns 
                WHERE table_name = 'users' 
                ORDER BY ordinal_position
            """))
            columns = result.fetchall()
            print(f'🏗️  Estrutura da tabela users ({len(columns)} colunas):')
            for col in columns:
                print(f'   - {col.column_name}: {col.data_type} (NULL: {col.is_nullable})')
            
            print('\n🎉 Todos os testes passaram! Supabase está funcionando corretamente.')
            
    except Exception as e:
        print(f'❌ Erro na conexão: {e}')
        return False
    
    return True

if __name__ == '__main__':
    test_supabase_connection() 