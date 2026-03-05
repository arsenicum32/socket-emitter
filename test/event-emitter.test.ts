import EventEmitter from '../src/event-emitter'

describe('EventEmitter', () => {
  it('emits events to subscribed listeners', () => {
    const emitter = new EventEmitter()
    const listener = jest.fn()

    emitter.on('message', listener)
    emitter.emit('message', { ok: true })

    expect(listener).toHaveBeenCalledWith({ ok: true })
  })

  it('does not emit unrelated events', () => {
    const emitter = new EventEmitter()
    const listener = jest.fn()

    emitter.on('message', listener)
    emitter.emit('other')

    expect(listener).not.toHaveBeenCalled()
  })

  it('unsubscribes listeners', () => {
    const emitter = new EventEmitter()
    const listener = jest.fn()
    const unsubscribe = emitter.on('message', listener)

    emitter.emit('message')
    unsubscribe()
    emitter.emit('message')

    expect(listener).toHaveBeenCalledTimes(1)
  })
})
