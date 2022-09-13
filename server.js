const { Server } = require("socket.io"); 

const io = new Server({
    cors: {
        origin: "*", 
        methods: ["GET", "POST"], 
    }
}); 

let messages = []; 
let usernames = {}; 

// setInterval(() => {
//     io.emit("heartbeat", messages); 
// }); 

io.on("connection", socket => {
    usernames[socket.id] = socket.id; 
    socket.emit("update", messages); 

    socket.on("new_message", data => {
        console.log(data); 
        if (data.msg.startsWith("/nickname")) {
            usernames[socket.id] = data.msg.trim().split(' ')[1]; 
            messages = messages.map(msg => {
                let newMsg = msg; 
                if (msg.id === socket.id) {
                    newMsg.name = usernames[socket.id]; 
                }
                return newMsg; 
            }); 
        } else {
            data.id = socket.id; 
            data.name = usernames[socket.id]; 
            messages.push(data); 
        }

        io.emit("update", messages); 
    }); 
}); 

io.listen(3000); 
console.log("Listening on port 3000!"); 