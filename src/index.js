import express from 'express'
import path from 'path'
import hbs from 'hbs'
import http from 'http'
import socketio from 'socket.io'
import Filter from 'bad-words'
import { generateMessage, generateLocationMessage } from './utils/message'
import { addUser, removeUser, getUser, getUsersInRoom } from './utils/users'
const viewPath = path.join(__dirname, '../templates');
const app = express();
const server = http.createServer(app);
const io = socketio(server);


const port = 3000;
const publicDirectoryPath = path.join(__dirname, '../public')
app.use(express.static(publicDirectoryPath))

io.on('connection', (socket) => {

    socket.on('join', (options, callback) => {
        const { error, user } = addUser({ id: socket.id, ...options })

        if (error) {
            return callback(error)
        }

        socket.join(user.room)

        socket.emit('message', generateMessage('Admin','Welcome!'))
        socket.broadcast.to(user.room).emit('message', generateMessage('Admin',`${user.username} has joined!`))
        io.to(user.room).emit('roomUsers',{
            room:user.room,
            users:getUsersInRoom(user.room)
        })
        callback()
    })
    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id);

        const filter = new Filter();
        filter.addWords('hp', 'nojoda', 'gonorrea', 'monda')

        if (filter.isProfane(message)) {
            return callback('Profanity is not allowed')
        }


         console.log(user.room);
        io.to(user.room).emit('message', generateMessage(user.username,message));

         
        callback();
    })


    socket.on('sendLocation', (location, callback) => {
        const user = getUser(socket.id);

        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username,`https://google.com/maps?q=${location.latitude},${location.longitude}`))
        callback('Location delivered')
    })

    socket.on('disconnect', () => {
        let user= removeUser(socket.id)
        if(user){
            io.to(user.room).emit('message', generateMessage(user.username,`${user.username} has left`))
            io.to(user.room).emit('roomUsers',{
                room:user.room,
                users:getUsersInRoom(user.room)
            })
        }
    })
})

server.listen(port, () => {
    console.log('server is up on port ' + port)
})