import { WsEmitter } from '../src/ws-emitter'

describe('WsEmitter', () => {
  const url = 'ws://test.local'

  beforeEach(() => {
    const socket = {
      close: jest.fn(),
    }

    global.WebSocket = jest.fn(() => socket) as unknown as typeof WebSocket
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

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

  it('closes active socket', () => {
    const client = new WsEmitter(url)
    const socket = (global.WebSocket as unknown as jest.Mock).mock.results[0].value

    client.close()

    expect(socket.close).toHaveBeenCalled()
  })
})
