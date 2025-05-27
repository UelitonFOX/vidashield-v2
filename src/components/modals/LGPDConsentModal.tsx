import React, { useState, useEffect } from 'react'
import { Shield, Check, X, FileText, Eye, Download, AlertTriangle } from 'lucide-react'
import { LGPDService, LGPDTermsVersion } from '../../services/lgpdService'

interface LGPDConsentModalProps {
  isOpen: boolean
  onClose: () => void
  onConsent: (accepted: boolean) => void
  forced?: boolean // Se true, usuário não pode fechar sem aceitar
}

export const LGPDConsentModal: React.FC<LGPDConsentModalProps> = ({
  isOpen,
  onClose,
  onConsent,
  forced = false
}) => {
  const [terms, setTerms] = useState<LGPDTermsVersion | null>(null)
  const [loading, setLoading] = useState(true)
  const [showFullTerms, setShowFullTerms] = useState(false)
  const [consents, setConsents] = useState({
    essential: true, // Sempre true, não pode ser desmarcado
    marketing: false,
    analytics: false,
    cookies: false
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (isOpen) {
      loadTerms()
    }
  }, [isOpen])

  const loadTerms = async () => {
    setLoading(true)
    try {
      const activeTerms = await LGPDService.getActiveTerms('consent_form')
      if (activeTerms.length > 0) {
        setTerms(activeTerms[0])
      }
    } catch (error) {
      console.error('Erro ao carregar termos LGPD:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAccept = async () => {
    if (!terms) return

    setIsSubmitting(true)
    try {
      // Registrar consentimento essencial
      await LGPDService.registerConsent(
        'registration',
        true,
        undefined,
        navigator.userAgent
      )

      // Registrar consentimentos opcionais
      if (consents.marketing) {
        await LGPDService.registerConsent('marketing', true)
      }
      if (consents.analytics) {
        await LGPDService.registerConsent('analytics', true)
      }
      if (consents.cookies) {
        await LGPDService.registerConsent('cookies', true)
      }

      onConsent(true)
      onClose()
    } catch (error) {
      console.error('Erro ao registrar consentimento:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReject = async () => {
    if (forced) return // Não pode rejeitar se for obrigatório

    setIsSubmitting(true)
    try {
      await LGPDService.registerConsent(
        'registration',
        false,
        undefined,
        navigator.userAgent
      )

      onConsent(false)
      onClose()
    } catch (error) {
      console.error('Erro ao registrar rejeição:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const downloadTerms = () => {
    if (!terms) return

    const blob = new Blob([terms.content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `LGPD_Termos_${terms.version}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-800 rounded-2xl border border-green-500/20 shadow-2xl max-h-[85vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-700/50 bg-gradient-to-r from-green-500/5 to-blue-500/5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-500 to-blue-500 flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Consentimento LGPD</h2>
              <p className="text-sm text-zinc-400">Proteção de Dados Pessoais - Lei 13.709/2018</p>
            </div>
          </div>
          
          {!forced && (
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-zinc-800 hover:bg-zinc-700 transition-colors flex items-center justify-center text-zinc-400 hover:text-white"
              title="Fechar modal"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-green-500/30 border-t-green-500 rounded-full animate-spin"></div>
            </div>
          ) : terms ? (
            <div className="space-y-6">
              
              {/* Resumo do Consentimento */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20">
                <h3 className="text-lg font-semibold text-blue-300 mb-3">📋 Resumo do Consentimento</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-zinc-300">Autenticação e controle de acesso</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-zinc-300">Detecção de ameaças e vulnerabilidades</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-zinc-300">Logs de auditoria e segurança</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-zinc-300">Comunicação sobre atualizações</span>
                  </div>
                </div>
              </div>

              {/* Seus Direitos */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-green-500/10 to-teal-500/10 border border-green-500/20">
                <h3 className="text-lg font-semibold text-green-300 mb-3">⚖️ Seus Direitos (LGPD Art. 18)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-zinc-300">
                  <div>• Confirmação da existência de tratamento</div>
                  <div>• Acesso aos seus dados pessoais</div>
                  <div>• Correção de dados incompletos/incorretos</div>
                  <div>• Anonimização ou eliminação de dados</div>
                  <div>• Portabilidade dos dados</div>
                  <div>• Revogação do consentimento a qualquer momento</div>
                </div>
                <div className="mt-3 p-3 bg-green-500/5 rounded-lg">
                  <p className="text-xs text-green-200">
                    💡 <strong>Dica:</strong> Você pode exercer esses direitos a qualquer momento através do menu "Meus Dados" no seu perfil.
                  </p>
                </div>
              </div>

              {/* Consentimentos */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Consentimentos</h3>
                
                {/* Consentimento Essencial */}
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded border-2 border-red-400 bg-red-400 flex items-center justify-center mt-0.5">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-red-300">Consentimento Essencial (Obrigatório)</h4>
                      <p className="text-sm text-zinc-300 mt-1">
                        Processamento dos seus dados para funcionamento do serviço de segurança digital, 
                        autenticação e detecção de ameaças. Este consentimento é necessário para o funcionamento da plataforma.
                      </p>
                      <p className="text-xs text-red-200 mt-2">
                        <AlertTriangle className="w-3 h-3 inline mr-1" />
                        Base legal: Execução de contrato (LGPD Art. 7, V) e Legítimo interesse para segurança (Art. 7, IX)
                      </p>
                    </div>
                  </div>
                </div>

                {/* Consentimentos Opcionais */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-zinc-300">Consentimentos Opcionais:</h4>
                  
                  <label className="flex items-start gap-3 p-3 rounded-lg bg-zinc-800/50 hover:bg-zinc-800/70 transition-colors cursor-pointer">
                    <input
                      type="checkbox"
                      checked={consents.marketing}
                      onChange={(e) => setConsents(prev => ({ ...prev, marketing: e.target.checked }))}
                      className="w-4 h-4 mt-1 rounded border-2 border-zinc-600 bg-zinc-700 text-green-500 focus:ring-green-500 focus:ring-2"
                    />
                    <div className="flex-1">
                      <span className="text-sm font-medium text-zinc-200">Comunicações de Marketing</span>
                      <p className="text-xs text-zinc-400 mt-1">
                        Receber emails sobre novos recursos, atualizações e ofertas especiais.
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-3 rounded-lg bg-zinc-800/50 hover:bg-zinc-800/70 transition-colors cursor-pointer">
                    <input
                      type="checkbox"
                      checked={consents.analytics}
                      onChange={(e) => setConsents(prev => ({ ...prev, analytics: e.target.checked }))}
                      className="w-4 h-4 mt-1 rounded border-2 border-zinc-600 bg-zinc-700 text-green-500 focus:ring-green-500 focus:ring-2"
                    />
                    <div className="flex-1">
                      <span className="text-sm font-medium text-zinc-200">Analytics e Melhorias</span>
                      <p className="text-xs text-zinc-400 mt-1">
                        Usar dados de uso para melhorar a plataforma e criar estatísticas agregadas.
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-3 rounded-lg bg-zinc-800/50 hover:bg-zinc-800/70 transition-colors cursor-pointer">
                    <input
                      type="checkbox"
                      checked={consents.cookies}
                      onChange={(e) => setConsents(prev => ({ ...prev, cookies: e.target.checked }))}
                      className="w-4 h-4 mt-1 rounded border-2 border-zinc-600 bg-zinc-700 text-green-500 focus:ring-green-500 focus:ring-2"
                    />
                    <div className="flex-1">
                      <span className="text-sm font-medium text-zinc-200">Cookies não Essenciais</span>
                      <p className="text-xs text-zinc-400 mt-1">
                        Permitir cookies para personalização e análise de comportamento.
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Termos Completos */}
              <div className="border border-zinc-700 rounded-xl overflow-hidden">
                <button
                  onClick={() => setShowFullTerms(!showFullTerms)}
                  className="w-full p-4 text-left bg-zinc-800/30 hover:bg-zinc-800/50 transition-colors flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-zinc-400" />
                    <span className="font-medium text-zinc-200">
                      {showFullTerms ? 'Ocultar' : 'Ver'} Termos Completos
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      onClick={(e) => {
                        e.stopPropagation()
                        downloadTerms()
                      }}
                      className="p-1 rounded bg-zinc-700 hover:bg-zinc-600 transition-colors cursor-pointer"
                      title="Baixar termos"
                    >
                      <Download className="w-4 h-4 text-zinc-400" />
                    </div>
                    <Eye className="w-4 h-4 text-zinc-400" />
                  </div>
                </button>
                
                {showFullTerms && (
                  <div className="p-4 border-t border-zinc-700 bg-zinc-900/20 max-h-60 overflow-y-auto">
                    <pre className="text-xs text-zinc-300 whitespace-pre-wrap font-mono leading-relaxed">
                      {terms.content}
                    </pre>
                  </div>
                )}
              </div>

              {/* Informações Adicionais */}
              <div className="text-xs text-zinc-400 space-y-2 p-4 bg-zinc-800/20 rounded-lg">
                <p><strong>Versão:</strong> {terms.version}</p>
                <p><strong>Data de vigência:</strong> {new Date(terms.effective_date).toLocaleDateString('pt-BR')}</p>
                <p><strong>Contato para privacidade:</strong> privacidade@vidashield.com.br</p>
                <p><strong>Prazo de resposta:</strong> até 15 dias úteis</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <p className="text-zinc-300">Erro ao carregar termos de consentimento</p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex-shrink-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-6 border-t border-zinc-700/50 bg-zinc-900/50">
          <div className="text-xs text-zinc-400 hidden sm:block">
            <p>Ao clicar "Aceito", você confirma ter lido e concordado com os termos.</p>
          </div>
          
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            {!forced && (
              <button
                onClick={handleReject}
                disabled={isSubmitting}
                className="px-4 sm:px-6 py-3 rounded-lg bg-zinc-700 hover:bg-zinc-600 transition-colors text-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                Recusar
              </button>
            )}
            
            <button
              onClick={handleAccept}
              disabled={isSubmitting || !terms}
              className="px-6 sm:px-8 py-3 rounded-lg bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 transition-all text-white font-medium shadow-lg shadow-green-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 min-w-[140px] justify-center"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Processando...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Aceito os Termos
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 