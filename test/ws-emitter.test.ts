import { WsEmitter } from '../src/ws-emitter'

describe('WsEmitter', () => {
  const url = 'ws://test.local'
  let socket: WebSocket & { close: jest.Mock }

  beforeEach(() => {
    const socketInstance = {
      binaryType: 'blob',
      close: jest.fn(),
    } as WebSocket & { close: jest.Mock }

    global.WebSocket = jest.fn(() => socketInstance) as unknown as typeof WebSocket
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  const setupSocket = () => {
    socket = (global.WebSocket as unknown as jest.Mock).mock.results[0].value
    return socket
  }

  it('connects by default', () => {
    new WsEmitter(url)

    expect(global.WebSocket).toHaveBeenCalledWith(url)
  })

  it('supports manual connection lifecycle', () => {
    const client = new WsEmitter(url, { autoConnect: false })

    expect(global.WebSocket).not.toHaveBeenCalled()

    client.connect()

    expect(global.WebSocket).toHaveBeenCalledWith(url)
  })

  it('forwards open, close and error events', () => {
    const client = new WsEmitter(url)
    const activeSocket = setupSocket()
    const onOpen = jest.fn()
    const onClose = jest.fn()
    const onError = jest.fn()

    client.on('open', onOpen)
    client.on('close', onClose)
    client.on('error', onError)

    activeSocket.onopen?.(new Event('open'))
    activeSocket.onclose?.(new CloseEvent('close'))
    activeSocket.onerror?.(new Event('error'))

    expect(onOpen).toHaveBeenCalled()
    expect(onClose).toHaveBeenCalled()
    expect(onError).toHaveBeenCalled()
  })

  it('parses json string messages', () => {
    const client = new WsEmitter(url)
    const activeSocket = setupSocket()
    const onMessage = jest.fn()

    client.on('message', onMessage)
    activeSocket.onmessage?.(new MessageEvent('message', { data: JSON.stringify({ ok: true }) }))

    expect(onMessage).toHaveBeenCalledWith({ ok: true })
  })

  it('closes active socket', () => {
    const client = new WsEmitter(url)
    const activeSocket = setupSocket()

    client.close()

    expect(activeSocket.close).toHaveBeenCalled()
  })
})
