import io from 'socket.io-client'
import config from '../config'

export const createSignalClient = ({ onEvent }) => {
  const socket = io.connect(config.signalServer.url, {
    transports: ['websocket'],
  })

  socket.on('exchange', data => onEvent('exchange', data))
  socket.on('leave', id => onEvent('leave', id))
  socket.on('connect', data => onEvent('connect', data))

  return {
    _socket: socket,
    join(id) {
      socket.emit('join', id, socketIds =>
        onEvent('join', { id, list: socketIds }),
      )
    },
    exchange(id, data) {
      socket.emit('exchange', { to: id, ...data })
    },
    close() {
      socket.close()
      onEvent('close')
    },
  }
}
