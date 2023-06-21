const express=require('express');
const path=require('path')
const socketio=require('socket.io');
const http=require('http');
const Filter=require('bad-words');
const {generateMessage,generateLocationMessage}=require('./utils/messages');
const {addUser,removeUser,getUser,getUsersInRoom}=require('./utils/users')
const app=express();
const server=http.createServer(app);
const io=socketio(server);

const port=process.env.PORT || 3000;

const publicDirectoryPath=path.join(__dirname,'../public')
app.use(express.static(publicDirectoryPath))


let count=0;

//socket connection
io.on('connection',(socket)=>{
    console.log('New websocket connection');
    
    

    //handling disconnect event
    socket.on('disconnect',()=>{
        const user=removeUser(socket.id);
        if(user){
            io.to(user.room).emit('message',generateMessage('Admin',`${user.username} has left!`))
            io.to(user.room).emit('roomData',{
                room:user.room,
                users:getUsersInRoom(user.room)
            })
        }
        
    })

    //listening for messaege
    socket.on('sendMessage',(message,callback)=>{

        const filter=new Filter();
        if(filter.isProfane(message))
        return callback('Profanity is not allowed');

        const user=getUser(socket.id);
        



        io.to(user.room).emit('message',generateMessage(user.username,message))
        callback();
    })

    //listening for location
    socket.on('sendLocation',(location,callback)=>{

        const user=getUser(socket.id);
    

        io.to(user.room).emit('locationMessage',generateLocationMessage(user.username,location))
        callback()
    })

    //listening for join requests
    socket.on('join',({username,room},callback)=>{

        //add User
        const {error,user}=addUser({
            id:socket.id,
            username,
            room
        })
        if(error)
            return callback(error);

        //join room
        socket.join(user.room)

        //sedning message to all in the room
        socket.emit('message',generateMessage('Admin',`Welcome ${user.username}`));

        //sending message to all except newly joined
        socket.broadcast.to(user.room).emit('message',generateMessage('Admin',`${user.username} has joined!`))

        io.to(user.room).emit('roomData',{
            room:user.room,
            users:getUsersInRoom(user.room)
        })

        callback();
    })


})


server.listen(port,()=>{
    console.log('Server up on port 3000')
})

