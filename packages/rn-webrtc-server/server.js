const express = require('express')
const fs = require('fs')
const path = require('path')
const open = require('open')
const https = require('https')
const http = require('http')
const IO = require('socket.io')

const app = express()
const options = {
  key: fs.readFileSync('./fake-keys/privatekey.pem'),
  cert: fs.readFileSync('./fake-keys/certificate.pem'),
}

const serverPort = process.env.PORT || 4443

let server
if (process.env.LOCAL) {
  server = https.createServer(options, app)
} else {
  server = http.createServer(app)
}
const io = new IO(server)

app.use(express.static(path.join(__dirname, 'public')))

server.listen(serverPort, () => {
  console.log('server up and running at %s port', serverPort)
  if (process.env.LOCAL) {
    open('https://localhost:' + serverPort)
  }
})

function socketIdsInRoom(name) {
  const room = io.nsps['/'].adapter.rooms[name]
  if (room) {
    return Object.keys(room.sockets)
  }
  return []
}

io.on('connection', socket => {
  console.log('connection')
  socket.on('disconnect', () => {
    console.log('disconnect')
    if (socket.room) {
      const { room } = socket
      io.to(room).emit('leave', socket.id)
      socket.leave(room)
    }
  })

  socket.on('join', (name, callback) => {
    console.log('join', name)
    const socketIds = socketIdsInRoom(name)
    callback(socketIds)
    socket.join(name)
    socket.room = name
  })

  socket.on('exchange', data => {
    console.log('exchange', data)
    data.from = socket.id
    const to = io.sockets.connected[data.to]
    if (to) {
      to.emit('exchange', data)
    }
  })
})
