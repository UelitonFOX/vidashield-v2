-- =================================================
-- VERIFICAÇÃO DAS TABELAS LGPD - VIDASHIELD
-- Script para verificar se o sistema LGPD está configurado
-- =================================================

-- Verificar se as tabelas LGPD existem
SELECT 
  'TABELAS LGPD - STATUS DE INSTALAÇÃO' as verificacao,
  '===========================================' as separador;

-- Verificar tabelas existentes
SELECT 
  table_name,
  CASE 
    WHEN table_name IN (
      'lgpd_consent_logs', 
      'lgpd_data_requests', 
      'lgpd_audit_trail', 
      'lgpd_terms_versions'
    ) THEN '✅ EXISTE'
    ELSE '❌ NÃO ENCONTRADA'
  END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name LIKE 'lgpd_%'
ORDER BY table_name;

-- Verificar se user_profiles tem campos LGPD
SELECT 
  'Campos LGPD em user_profiles:' as verificacao,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'user_profiles' 
      AND column_name = 'lgpd_consent_date'
    ) THEN '✅ CAMPOS LGPD ADICIONADOS'
    ELSE '❌ CAMPOS LGPD FALTANDO'
  END as status;

-- Verificar funções LGPD
SELECT 
  'Funções LGPD:' as verificacao,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.routines 
      WHERE routine_name = 'register_lgpd_consent'
    ) THEN '✅ FUNÇÕES EXISTEM'
    ELSE '❌ FUNÇÕES FALTANDO'
  END as status;

-- Verificar dados de exemplo
SELECT 
  'Dados de demonstração:' as verificacao,
  '- Logs de consentimento: ' || COALESCE((SELECT COUNT(*)::text FROM lgpd_consent_logs), '0') as consent_logs,
  '- Solicitações de dados: ' || COALESCE((SELECT COUNT(*)::text FROM lgpd_data_requests), '0') as data_requests,
  '- Trilha de auditoria: ' || COALESCE((SELECT COUNT(*)::text FROM lgpd_audit_trail), '0') as audit_trail,
  '- Versões dos termos: ' || COALESCE((SELECT COUNT(*)::text FROM lgpd_terms_versions), '0') as terms_versions;

-- Resumo final
SELECT 
  '🎯 SISTEMA LGPD VIDASHIELD' as titulo,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'lgpd_consent_logs')
     AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'lgpd_consent_date')
     AND EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'register_lgpd_consent')
    THEN '✅ SISTEMA COMPLETO E FUNCIONAL'
    ELSE '⚠️ INSTALAÇÃO INCOMPLETA - EXECUTE setup-lgpd-tables.sql'
  END as status; 