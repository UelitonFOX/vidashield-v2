import React, { createContext, useContext, ReactNode } from 'react'
import { useRealTimeNotifications, RealTimeNotification, NotificationStats } from '../hooks/useRealTimeNotifications'

interface NotificationContextType {
  notifications: RealTimeNotification[]
  stats: NotificationStats
  loading: boolean
  connected: boolean
  markAsRead: (id: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  clearOldNotifications: () => Promise<void>
  refreshNotifications: () => Promise<void>
  runDiagnostic: () => Promise<any>
  testDelete: () => Promise<void>
  testCreateAndDelete: () => Promise<void>
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

interface NotificationProviderProps {
  children: ReactNode
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const notificationData = useRealTimeNotifications()

  return (
    <NotificationContext.Provider value={notificationData}>
      {children}
    </NotificationContext.Provider>
  )
}

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
} 