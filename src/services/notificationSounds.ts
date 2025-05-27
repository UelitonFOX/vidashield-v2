// Serviço para gerenciar sons de notificação
export interface NotificationSound {
  id: string
  name: string
  description: string
}

export const NOTIFICATION_SOUNDS: NotificationSound[] = [
  { id: 'beep', name: 'Beep', description: 'Som simples de beep' },
  { id: 'chime', name: 'Chime', description: 'Som de sino suave' },
  { id: 'ping', name: 'Ping', description: 'Som de ping rápido' },
  { id: 'ding', name: 'Ding', description: 'Som de campainha' },
  { id: 'pop', name: 'Pop', description: 'Som de bolha' },
  { id: 'none', name: 'Silencioso', description: 'Sem som' }
]

class NotificationSoundService {
  private audioContext: AudioContext | null = null

  private getAudioContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
    return this.audioContext
  }

  private createBeepSound(): void {
    const ctx = this.getAudioContext()
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)

    oscillator.frequency.setValueAtTime(800, ctx.currentTime)
    gainNode.gain.setValueAtTime(0.3, ctx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2)

    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + 0.2)
  }

  private createChimeSound(): void {
    const ctx = this.getAudioContext()
    
    // Criar múltiplas frequências para um som mais rico
    const frequencies = [523.25, 659.25, 783.99] // C5, E5, G5
    
    frequencies.forEach((freq, index) => {
      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(ctx.destination)

      oscillator.frequency.setValueAtTime(freq, ctx.currentTime)
      oscillator.type = 'sine'
      
      const startTime = ctx.currentTime + (index * 0.1)
      gainNode.gain.setValueAtTime(0, startTime)
      gainNode.gain.linearRampToValueAtTime(0.2, startTime + 0.1)
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 1)

      oscillator.start(startTime)
      oscillator.stop(startTime + 1)
    })
  }

  private createPingSound(): void {
    const ctx = this.getAudioContext()
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)

    oscillator.frequency.setValueAtTime(1200, ctx.currentTime)
    oscillator.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.1)
    
    gainNode.gain.setValueAtTime(0.4, ctx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1)

    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + 0.1)
  }

  private createDingSound(): void {
    const ctx = this.getAudioContext()
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)

    oscillator.frequency.setValueAtTime(1000, ctx.currentTime)
    oscillator.type = 'triangle'
    
    gainNode.gain.setValueAtTime(0.3, ctx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5)

    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + 0.5)
  }

  private createPopSound(): void {
    const ctx = this.getAudioContext()
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)

    oscillator.frequency.setValueAtTime(150, ctx.currentTime)
    oscillator.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.1)
    oscillator.type = 'square'
    
    gainNode.gain.setValueAtTime(0.2, ctx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1)

    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + 0.1)
  }

  public playSound(soundId: string): void {
    if (soundId === 'none') return

    try {
      switch (soundId) {
        case 'beep':
          this.createBeepSound()
          break
        case 'chime':
          this.createChimeSound()
          break
        case 'ping':
          this.createPingSound()
          break
        case 'ding':
          this.createDingSound()
          break
        case 'pop':
          this.createPopSound()
          break
        default:
          this.createBeepSound()
      }
    } catch (error) {
      console.warn('Erro ao reproduzir som de notificação:', error)
    }
  }

  public async testSound(soundId: string): Promise<void> {
    // Garantir que o AudioContext seja iniciado por interação do usuário
    if (this.audioContext?.state === 'suspended') {
      await this.audioContext.resume()
    }
    this.playSound(soundId)
  }
}

export const notificationSoundService = new NotificationSoundService() 