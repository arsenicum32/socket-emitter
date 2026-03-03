type EventListener<T = unknown> = (data?: T) => void

export default class EventEmitter {
  private listeners: Record<string, EventListener[]> = {}

  emit<T = unknown>(name: string, message?: T): void {
    const listeners = this.listeners[name] || []

    listeners.forEach(listener => {
      listener(message)
    })
  }

  on<T = unknown>(name: string, listener: EventListener<T>): () => void {
    if (!this.listeners[name]) {
      this.listeners[name] = []
    }

    this.listeners[name].push(listener as EventListener)

    return () => {
      this.listeners[name] = this.listeners[name].filter(cb => cb !== listener)
    }
  }
}
