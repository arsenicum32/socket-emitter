# ws-emitter

Small TypeScript WebSocket infrastructure for applications that need predictable realtime behavior without adopting a full framework.

`ws-emitter` wraps the native `WebSocket` API with a compact event-driven interface, explicit lifecycle control, defensive payload parsing, and configurable reconnect behavior. The goal is not to hide WebSocket, but to remove the repetitive glue code that usually grows around it in production UI, SDK, and service layers.

## Why this exists

Native WebSocket is intentionally low-level. That is fine for a prototype, but production code quickly needs decisions around lifecycle, reconnection, parsing, shutdown semantics, and subscription cleanup.

This package turns those decisions into a small, inspectable abstraction:

- one client object owns the socket lifecycle;
- consumers subscribe through `on` / `once` and receive an unsubscribe function;
- unexpected closes can reconnect automatically;
- intentional closes can stop reconnects explicitly;
- incoming payloads are normalized before they reach application code;
- MessagePack support is opt-in instead of leaking binary protocol details into every consumer.

## Highlights

- **Small public API** — `connect`, `close`, `on`, `once`, and `emit`.
- **Predictable reconnect semantics** — temporary network failures and intentional shutdowns are treated differently.
- **Manual lifecycle mode** — disable auto-connect when the owner is a React effect, SDK initializer, test harness, or service bootstrap.
- **Defensive payload decoding** — JSON is parsed when possible; invalid or unsupported payloads fall back to raw values.
- **Optional MessagePack decoding** — binary event streams can be consumed through `msgpackr`.
- **TypeScript declarations** — the package is built for downstream library consumers, not only local application code.
- **Jest-covered core behavior** — event semantics and socket lifecycle behavior are tested.
- **No framework assumptions** — usable from browser UI code, shared SDK packages, or integration layers.

## Installation

```bash
npm install ws-emitter
```

```bash
yarn add ws-emitter
```

## Quick start

```ts
import { WsEmitter } from 'ws-emitter'

const socket = new WsEmitter('wss://example.com/events')

const unsubscribe = socket.on('message', (payload) => {
  console.log('message', payload)
})

socket.on('open', () => {
  console.log('connected')
})

socket.on('close', () => {
  console.log('connection closed')
})

unsubscribe()
```

## Lifecycle control

Use the default mode when the client should connect as soon as it is created.

```ts
const socket = new WsEmitter('wss://example.com/events')
```

Use manual mode when connection timing belongs to the host application. This is useful in UI effects, SDK bootstrapping, integration tests, or flows where authentication must complete first.

```ts
const socket = new WsEmitter('wss://example.com/events', {
  autoConnect: false,
  autoReconnect: true,
  reconnectTimeout: 1500,
})

socket.connect()

// Intentional shutdown: this close should not schedule a reconnect.
socket.close(true)
```

## API

### `new WsEmitter(url, options?, isMessagePack?)`

Creates a WebSocket wrapper and connects immediately unless `autoConnect` is disabled.

```ts
type OptionsType = {
  autoConnect?: boolean
  autoReconnect?: boolean
  reconnectTimeout?: number
}
```

| Option | Default | Description |
| --- | --- | --- |
| `autoConnect` | `true` | Open the socket during construction. |
| `autoReconnect` | `true` | Reconnect after an unexpected close event. |
| `reconnectTimeout` | `1000` | Delay in milliseconds before the next reconnect attempt. |

### `connect()`

Creates a new native `WebSocket` instance and attaches lifecycle handlers.

### `close(force = false)`

Closes the current socket. When `force` is `true`, reconnect is disabled for that close cycle.

### `on(eventName, listener)`

Subscribes to an event and returns an unsubscribe function.

```ts
const off = socket.on('message', handleMessage)
off()
```

### `once(eventName, listener)`

Subscribes to a single event delivery and removes the listener after the first call.

### `emit(eventName, payload)`

Triggers local listeners. This does not send data to the remote server.

## Events

| Event | Payload |
| --- | --- |
| `open` | Native WebSocket open event |
| `close` | Native WebSocket close event |
| `error` | Native WebSocket error event |
| `message` | Parsed JSON, decoded MessagePack object, or raw fallback |

## Development

```bash
npm install
npm test
npm run build
```

## License

MIT
