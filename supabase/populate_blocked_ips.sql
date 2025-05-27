-- Script rápido para popular a tabela blocked_ips com dados realistas
-- Execute este SQL no Supabase SQL Editor

-- 1. Adicionar colunas se não existirem
ALTER TABLE blocked_ips 
ADD COLUMN IF NOT EXISTS ip_address TEXT,
ADD COLUMN IF NOT EXISTS pais TEXT,
ADD COLUMN IF NOT EXISTS cidade TEXT,
ADD COLUMN IF NOT EXISTS tentativas_bloqueadas INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS ultima_tentativa TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 2. Atualizar dados existentes (se houver)
UPDATE blocked_ips 
SET 
  ip_address = COALESCE(ip_address, host(ip)::TEXT),
  pais = CASE 
    WHEN ip_address LIKE '192.%' THEN 'Brasil'
    WHEN ip_address LIKE '203.%' THEN 'Estados Unidos'
    WHEN ip_address LIKE '198.%' THEN 'China'
    WHEN ip_address LIKE '172.%' THEN 'Rússia'
    WHEN ip_address LIKE '10.%' THEN 'Brasil'
    ELSE 'Desconhecido'
  END,
  cidade = CASE 
    WHEN ip_address LIKE '192.%' THEN 'São Paulo'
    WHEN ip_address LIKE '203.%' THEN 'Nova York'
    WHEN ip_address LIKE '198.%' THEN 'Beijing'
    WHEN ip_address LIKE '172.%' THEN 'Moscou'
    WHEN ip_address LIKE '10.%' THEN 'Rio de Janeiro'
    ELSE 'Desconhecida'
  END,
  tentativas_bloqueadas = (random() * 20 + 1)::integer,
  ultima_tentativa = NOW() - (random() * interval '7 days'),
  updated_at = NOW()
WHERE ip_address IS NOT NULL;

-- 3. Limpar e inserir dados de demonstração
DELETE FROM blocked_ips;

INSERT INTO blocked_ips (
  ip_address, motivo, pais, cidade, data_bloqueio, ativo, 
  tentativas_bloqueadas, ultima_tentativa, created_at, updated_at
) VALUES
  ('203.0.113.45', 'Tentativas de força bruta detectadas', 'Estados Unidos', 'Nova York', NOW() - INTERVAL '2 hours', true, 15, NOW() - INTERVAL '30 minutes', NOW() - INTERVAL '2 hours', NOW()),
  ('198.51.100.23', 'Scanner de vulnerabilidades', 'China', 'Beijing', NOW() - INTERVAL '6 hours', true, 8, NOW() - INTERVAL '1 hour', NOW() - INTERVAL '6 hours', NOW()),
  ('172.16.0.99', 'Bot malicioso detectado', 'Rússia', 'Moscou', NOW() - INTERVAL '1 day', true, 23, NOW() - INTERVAL '3 hours', NOW() - INTERVAL '1 day', NOW()),
  ('10.0.0.45', 'Múltiplas tentativas de login falhadas', 'Brasil', 'São Paulo', NOW() - INTERVAL '3 days', true, 12, NOW() - INTERVAL '5 hours', NOW() - INTERVAL '3 days', NOW()),
  ('85.209.176.33', 'Atividade de phishing detectada', 'Holanda', 'Amsterdam', NOW() - INTERVAL '4 hours', true, 7, NOW() - INTERVAL '2 hours', NOW() - INTERVAL '4 hours', NOW()),
  ('192.168.1.100', 'Tentativas de acesso não autorizado', 'Brasil', 'Rio de Janeiro', NOW() - INTERVAL '5 days', false, 6, NOW() - INTERVAL '1 day', NOW() - INTERVAL '5 days', NOW()),
  ('172.16.0.33', 'Comportamento suspeito resolvido', 'França', 'Paris', NOW() - INTERVAL '1 week', false, 4, NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 week', NOW()),
  ('198.51.100.15', 'Teste de penetração autorizado', 'Reino Unido', 'Londres', NOW() - INTERVAL '3 weeks', false, 1, NOW() - INTERVAL '2 weeks', NOW() - INTERVAL '3 weeks', NOW()); 