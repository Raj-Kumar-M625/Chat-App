const express = require('express')
const path = require('path')
const http = require('http')
const socketio = require('socket.io')
const { generateMessage } = require('./utils/messages')
const { generateLocationMessage } = require('./utils/messages')
const { addUser, getUser, removeUser, getUsersInRooom } = require('./utils/users')

app = express()
const port = process.env.PORT || 3000
const server = http.createServer(app)
const publicDirectory = path.join(__dirname, '../public')
app.use(express.static(publicDirectory))
const io = socketio(server)


io.on('connection', (socket) => {
    console.log('new web socket connection')
    socket.on('join', (options, callback) => {

        const { error, user } = addUser({ id: socket.id, ...options })

        if (error) {
            return callback(error)
        }

        socket.join(user.room)

        socket.emit('message', generateMessage(user.username, 'welcome!'))
        socket.broadcast.to(user.room).emit('message', generateMessage(user.username, user.username + " has joined!"))
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRooom(user.room)
        })
        callback()
    })

    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id)
        io.to(user.room).emit('message', generateMessage(user.username, message))
        callback('Delivered')
    })

    socket.on('sendLocation', (coords, callback) => {
        const user = getUser(socket.id)
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, 'https://google.com/maps?q=' + coords.latitude + "," + coords.longitude))
        callback()
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)
        if (user) {
            io.to(user.room).emit('message', generateMessage(user.username, user.username + ' has left!'))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRooom(user.room)
            })
        }
    })
})

server.listen(port, () => {
    console.log('server is upon the port ', port)
})

