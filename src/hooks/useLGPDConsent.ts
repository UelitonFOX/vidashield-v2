import { useState, useEffect } from 'react'
import { LGPDService } from '../services/lgpdService'

interface LGPDConsentState {
  needsConsent: boolean
  loading: boolean
  error: string | null
}

export const useLGPDConsent = () => {
  const [state, setState] = useState<LGPDConsentState>({
    needsConsent: false,
    loading: true,
    error: null
  })

  useEffect(() => {
    checkConsentStatus().catch(console.error)
  }, [])

  const checkConsentStatus = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))
      
      const needsUpdate = await LGPDService.needsConsentUpdate()
      
      setState({
        needsConsent: needsUpdate,
        loading: false,
        error: null
      })
    } catch (error) {
      console.error('Erro ao verificar status do consentimento:', error)
      setState({
        needsConsent: false,
        loading: false,
        error: 'Erro ao verificar consentimento'
      })
    }
  }

  const markConsentGiven = () => {
    setState(prev => ({ ...prev, needsConsent: false }))
  }

  return {
    ...state,
    checkConsentStatus,
    markConsentGiven
  }
} 