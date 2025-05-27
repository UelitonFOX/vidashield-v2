import React from 'react'
import { useAuth } from '../hooks/useAuth'

const AuthDebug: React.FC = () => {
  const { user, session, loading } = useAuth()

  return (
    <div className="fixed bottom-4 right-4 bg-zinc-800 border border-zinc-700 rounded-lg p-4 text-xs text-zinc-300 max-w-sm">
      <h3 className="font-bold text-green-400 mb-2">🔍 Auth Debug</h3>
      <div className="space-y-1">
        <div><strong>Loading:</strong> {loading ? 'true' : 'false'}</div>
        <div><strong>User:</strong> {user ? user.email : 'null'}</div>
        <div><strong>Session:</strong> {session ? 'ativa' : 'null'}</div>
        <div><strong>URL:</strong> {window.location.pathname}</div>
        <div><strong>Supabase URL:</strong> {import.meta.env.VITE_SUPABASE_URL}</div>
        <div><strong>Has Anon Key:</strong> {import.meta.env.VITE_SUPABASE_ANON_KEY ? 'sim' : 'não'}</div>
      </div>
    </div>
  )
}

export default AuthDebug 