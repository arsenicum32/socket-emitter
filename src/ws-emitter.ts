import EventEmitter from './event-emitter'

const CLOSE_EVENT = 'close'
const OPEN_EVENT = 'open'
const MESSAGE_EVENT = 'message'
const ERROR_EVENT = 'error'

export interface OptionsType {
  autoConnect?: boolean
  autoReconnect?: boolean
  reconnectTimeout?: number
}

const defaultOptions: Required<OptionsType> = {
  autoConnect: true,
  autoReconnect: true,
  reconnectTimeout: 1000,
}

export class WsEmitter extends EventEmitter {
  private readonly url: string
  private readonly options: Required<OptionsType>
  private reconnectTimeout = 0

  socket: WebSocket | undefined

  constructor(url: string, options?: OptionsType) {
    super()
    this.url = url
    this.options = { ...defaultOptions, ...options }

    this.on(CLOSE_EVENT, () => {
      if (this.options.autoReconnect) {
        setTimeout(this.connect.bind(this), this.reconnectTimeout)
        this.reconnectTimeout = this.options.reconnectTimeout
      }
    })

    this.on(OPEN_EVENT, () => {
      this.reconnectTimeout = 0
    })

    this.on(ERROR_EVENT, () => {
      this.socket?.close()
    })

    if (this.options.autoConnect) {
      this.connect()
    }
  }

  connect(): void {
    this.socket = new WebSocket(this.url)
    this.socket.binaryType = 'blob'

    this.socket.onopen = event => this.emit(OPEN_EVENT, event)
    this.socket.onclose = event => this.emit(CLOSE_EVENT, event)
    this.socket.onerror = event => this.emit(ERROR_EVENT, event)

    this.socket.onmessage = async event => {
      let { data } = event

      if (typeof data !== 'string') {
        data = await new Response(data).text()
      }

      try {
        this.emit(MESSAGE_EVENT, JSON.parse(data))
      } catch {
        this.emit(MESSAGE_EVENT, data)
      }
    }
  }

  close(force = false): void {
    if (force) {
      const prevReconnectValue = this.options.autoReconnect

      this.options.autoReconnect = false

      this.once(CLOSE_EVENT, () => {
        this.options.autoReconnect = prevReconnectValue
      })
    }

    this.socket?.close()
  }
}
