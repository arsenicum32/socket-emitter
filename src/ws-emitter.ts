import EventEmitter from './event-emitter'

const CLOSE_EVENT = 'close'
const OPEN_EVENT = 'open'
const MESSAGE_EVENT = 'message'
const ERROR_EVENT = 'error'

export interface OptionsType {
  autoConnect?: boolean
}

const defaultOptions: Required<OptionsType> = {
  autoConnect: true,
}

export class WsEmitter extends EventEmitter {
  private readonly url: string
  private readonly options: Required<OptionsType>

  socket: WebSocket | undefined

  constructor(url: string, options?: OptionsType) {
    super()
    this.url = url
    this.options = { ...defaultOptions, ...options }

    if (this.options.autoConnect) {
      this.connect()
    }
  }

  connect(): void {
    this.socket = new WebSocket(this.url)

    this.socket.onopen = event => this.emit(OPEN_EVENT, event)
    this.socket.onclose = event => this.emit(CLOSE_EVENT, event)
    this.socket.onerror = event => this.emit(ERROR_EVENT, event)
    this.socket.onmessage = event => {
      const { data } = event

      try {
        this.emit(MESSAGE_EVENT, JSON.parse(data))
      } catch {
        this.emit(MESSAGE_EVENT, data)
      }
    }
  }

  close(): void {
    this.socket?.close()
  }
}
