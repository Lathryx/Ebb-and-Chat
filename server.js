const { Server } = require("socket.io"); 

const io = new Server({
    cors: {
        origin: "*", 
        methods: ["GET", "POST"], 
    }
}); 

let messages = {general: [], room1: [], room2: []}; 
let usernames = {}; 

// setInterval(() => {
//     io.emit("heartbeat", messages); 
// }); 

io.on("connection", socket => {
    usernames[socket.id] = socket.id; 
    // socket.join("general"); 
    // socket.emit("update", messages["general"]); 
    socket.emit("rooms", Object.keys(messages)); 

    socket.on("new_message", data => {
        console.log(data); 
        if (data.msg.startsWith("/nickname")) {
            usernames[socket.id] = data.msg.trim().split(' ')[1]; 
            messages[data.to] = messages[data.to].map(msg => {
                let newMsg = msg; 
                if (msg.id === socket.id) {
                    newMsg.name = usernames[socket.id]; 
                }
                return newMsg; 
            }); 
        } else {
            data.id = socket.id; 
            data.name = usernames[socket.id]; 
            data.timestamp = Date.now(); 
            data.timestampFormatted = new Date(data.timestamp).toLocaleTimeString(); 
            messages[data.to].push(data); 
        }

        io.to(data.to).emit("update", messages[data.to]); 
    }); 

    socket.on("switchRoom", data => {
        if (data.from) socket.leave(data.from); 
        socket.join(data.to); 
        socket.emit("update", messages[data.to]); 
        console.log(`Switched user ${socket.id} to room #${data.to}... `); 
    }); 
}); 

io.listen(3000); 
console.log("Listening on port 3000!"); 