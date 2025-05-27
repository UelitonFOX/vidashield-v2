import React, { useState, useEffect, useRef } from 'react'
import { Search, X, Clock, Star, ArrowRight, Command } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface SearchResult {
  id: string
  type: 'page' | 'user' | 'alert' | 'ip' | 'log' | 'setting'
  title: string
  description: string
  url: string
  icon: React.ReactNode
  category: string
  priority: number
  lastAccessed?: Date
}

interface GlobalSearchProps {
  onClose?: () => void
  isOpen?: boolean
}

const GlobalSearch: React.FC<GlobalSearchProps> = ({ onClose, isOpen = false }) => {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  // Dados de exemplo para busca
  const searchData: SearchResult[] = [
    {
      id: '1',
      type: 'page',
      title: 'Dashboard Premium',
      description: 'Painel principal com métricas e analytics',
      url: '/dashboard',
      icon: <div className="w-4 h-4 bg-green-500 rounded" />,
      category: 'Páginas',
      priority: 10
    },
    {
      id: '2',
      type: 'page',
      title: 'Segurança Avançada',
      description: 'Monitoramento de ameaças e IPs bloqueados',
      url: '/security',
      icon: <div className="w-4 h-4 bg-red-500 rounded" />,
      category: 'Páginas',
      priority: 9
    },
    {
      id: '3',
      type: 'page',
      title: 'Gerenciamento de Usuários',
      description: 'Administrar usuários e permissões',
      url: '/usuarios',
      icon: <div className="w-4 h-4 bg-blue-500 rounded" />,
      category: 'Páginas',
      priority: 8
    },
    {
      id: '4',
      type: 'page',
      title: 'Central de Alertas',
      description: 'Visualizar e gerenciar alertas do sistema',
      url: '/alertas',
      icon: <div className="w-4 h-4 bg-yellow-500 rounded" />,
      category: 'Páginas',
      priority: 7
    },
    {
      id: '5',
      type: 'page',
      title: 'Analytics Premium',
      description: 'Relatórios detalhados e métricas avançadas',
      url: '/analytics',
      icon: <div className="w-4 h-4 bg-purple-500 rounded" />,
      category: 'Páginas',
      priority: 6
    },
    {
      id: '6',
      type: 'setting',
      title: 'Configurações do Sistema',
      description: 'Ajustar configurações gerais',
      url: '/configuracoes',
      icon: <div className="w-4 h-4 bg-gray-500 rounded" />,
      category: 'Configurações',
      priority: 5
    },
    {
      id: '7',
      type: 'page',
      title: 'Meu Perfil',
      description: 'Gerenciar perfil e preferências',
      url: '/perfil',
      icon: <div className="w-4 h-4 bg-indigo-500 rounded" />,
      category: 'Conta',
      priority: 4
    }
  ]

  // Buscar resultados
  const performSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([])
      return
    }

    setIsLoading(true)
    
    // Simular delay de busca
    setTimeout(() => {
      const filtered = searchData
        .filter(item => 
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.category.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .sort((a, b) => {
          // Priorizar por relevância e depois por priority
          const aRelevance = a.title.toLowerCase().includes(searchQuery.toLowerCase()) ? 10 : 0
          const bRelevance = b.title.toLowerCase().includes(searchQuery.toLowerCase()) ? 10 : 0
          
          if (aRelevance !== bRelevance) return bRelevance - aRelevance
          return b.priority - a.priority
        })
        .slice(0, 8)

      setResults(filtered)
      setSelectedIndex(0)
      setIsLoading(false)
    }, 200)
  }

  // Navegar para resultado
  const navigateToResult = (result: SearchResult) => {
    navigate(result.url)
    
    // Adicionar à lista de buscas recentes
    const newRecentSearches = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5)
    setRecentSearches(newRecentSearches)
    localStorage.setItem('vidashield_recent_searches', JSON.stringify(newRecentSearches))
    
    // Fechar busca
    setQuery('')
    setResults([])
    onClose?.()
  }

  // Carregar buscas recentes
  useEffect(() => {
    const saved = localStorage.getItem('vidashield_recent_searches')
    if (saved) {
      setRecentSearches(JSON.parse(saved))
    }
  }, [])

  // Focar input quando abrir
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  // Buscar quando query mudar
  useEffect(() => {
    performSearch(query)
  }, [query])

  // Navegação por teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex(prev => Math.min(prev + 1, results.length - 1))
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex(prev => Math.max(prev - 1, 0))
          break
        case 'Enter':
          e.preventDefault()
          if (results[selectedIndex]) {
            navigateToResult(results[selectedIndex])
          }
          break
        case 'Escape':
          e.preventDefault()
          onClose?.()
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, results, selectedIndex])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
      <div className="flex items-start justify-center pt-20 px-4">
        <div className="w-full max-w-2xl bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-3 p-4 border-b border-zinc-700">
            <Search className="w-5 h-5 text-zinc-400" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar páginas, usuários, configurações..."
              className="flex-1 bg-transparent text-white placeholder-zinc-400 outline-none"
            />
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-zinc-800 text-zinc-400 text-xs rounded border border-zinc-600">
                <Command className="w-3 h-3 inline mr-1" />
                K
              </kbd>
              <button
                onClick={onClose}
                className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white transition-colors"
                title="Fechar busca"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin w-6 h-6 border-2 border-green-400 border-t-transparent rounded-full mx-auto mb-2" />
                <p className="text-zinc-400 text-sm">Buscando...</p>
              </div>
            ) : query && results.length === 0 ? (
              <div className="p-8 text-center text-zinc-400">
                <Search className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Nenhum resultado encontrado para "{query}"</p>
                <p className="text-sm mt-1">Tente termos como: dashboard, usuários, alertas</p>
              </div>
            ) : query && results.length > 0 ? (
              <div className="p-2">
                {results.map((result, index) => (
                  <button
                    key={result.id}
                    onClick={() => navigateToResult(result)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                      index === selectedIndex 
                        ? 'bg-green-600/20 border border-green-500/30' 
                        : 'hover:bg-zinc-800/50'
                    }`}
                  >
                    <div className="flex-shrink-0">
                      {result.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-white font-medium truncate">{result.title}</h3>
                        <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded">
                          {result.category}
                        </span>
                      </div>
                      <p className="text-zinc-400 text-sm truncate">{result.description}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-zinc-500 flex-shrink-0" />
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-4">
                {/* Buscas recentes */}
                {recentSearches.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-zinc-400 text-sm font-medium mb-2 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Buscas recentes
                    </h3>
                    <div className="space-y-1">
                      {recentSearches.map((search, index) => (
                        <button
                          key={index}
                          onClick={() => setQuery(search)}
                          className="w-full text-left p-2 hover:bg-zinc-800/50 rounded text-zinc-300 text-sm transition-colors"
                        >
                          {search}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sugestões */}
                <div>
                  <h3 className="text-zinc-400 text-sm font-medium mb-2 flex items-center gap-2">
                    <Star className="w-4 h-4" />
                    Páginas populares
                  </h3>
                  <div className="space-y-1">
                    {searchData.slice(0, 4).map((item) => (
                      <button
                        key={item.id}
                        onClick={() => navigateToResult(item)}
                        className="w-full flex items-center gap-3 p-2 hover:bg-zinc-800/50 rounded transition-colors"
                      >
                        {item.icon}
                        <span className="text-zinc-300 text-sm">{item.title}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-zinc-700 bg-zinc-800/50">
            <div className="flex items-center justify-between text-xs text-zinc-500">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-zinc-700 rounded">↑↓</kbd>
                  navegar
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-zinc-700 rounded">↵</kbd>
                  selecionar
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-zinc-700 rounded">esc</kbd>
                  fechar
                </span>
              </div>
              <span>{results.length} resultados</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GlobalSearch 