const ip = require("ip").address(); 
console.log("Server's Local Network IP:", ip); 

const { Server } = require("socket.io"); 
const express = require("express"); 
const app = express(); 
const uuidv4 = require("uuid").v4; 
const fs = require("fs"); 

const users = require("./users.json").users; 
let messages = require("./messages.json"); 

app.use(express.static("public")); 

const io = new Server({
    cors: {
        origin: "*", 
        methods: ["GET", "POST"], 
    }
}); 

// let messages = {general: [], room1: [], room2: []}; 
let usernames = {}; 
// let users = []; 

// setInterval(() => {
//     io.emit("heartbeat", messages); 
// }); 

io.on("connection", socket => {
    usernames[socket.id] = socket.id; 
    let currentUser; 
    // socket.join("general"); 
    // socket.emit("update", messages["general"]); 
    socket.emit("rooms", Object.keys(messages)); 

    socket.on("user_join", (data, callback) => {
        let user; 

        if (!data.id) {
            // new user 
            let new_id = uuidv4(); 
            user = {
                id: new_id, 
                socket_id: socket.id, 
                name: `user_${new_id.slice(0, 4)}` 
            }; 

            users.push(user); 
            fs.writeFileSync("./users.json", JSON.stringify({users: users})); 
        } else {
            // existing user 
            user = users.find(user => user.id === data.id); 
            if (!user) {
                user = {
                    id: data.id, 
                    socket_id: socket.id, 
                    name: `user_${data.id.slice(0, 4)}` 
                }; 
                users.push(user); 
                fs.writeFileSync("./users.json", JSON.stringify({users: users})); 
            } 
        } 

        currentUser = user; 
        callback(user); 
    }); 

    socket.on("new_message", data => {
        console.log(data); 

        if (data.msg.startsWith("/nickname")) {
            currentUser.name = data.msg.trim().split(' ')[1]; 
            messages[data.to] = messages[data.to].map(msg => {
                let newMsg = msg; 
                if (msg.id === currentUser.id) {
                    newMsg.name = currentUser.name; 
                }
                return newMsg; 
            }); 

            users.find(user => user.id === currentUser.id).name = currentUser.name; 
            fs.writeFileSync("./users.json", JSON.stringify({users: users})); 
        } else if (data.msg.startsWith("/whisper")) { 
            data.to = users.find(user => user.name === data.msg.trim().split(' ')[1]).socket_id; 
            data.msg = data.msg.trim().split(' ').slice(2).join(' '); 

            data.id = currentUser.id; 
            data.name = currentUser.name; 
            data.timestamp = Date.now(); 

            // if (!messages[data.to]) messages[data.to] = []; 
            // messages[data.to].push(data); 
            // refactor later: client to have list of PMs exclusive to list of messages, then concat them, and sort by timestamp (chronological order) :+1: 
            // (do the same for system/server messages too) 
        } else {
            if (data.msg.includes("#")) {
                let positions = []; 

                let re = /\B\#\w\w+\b/g; // /(\b#\S+\b)/ig; 
                let matches = [...data.msg.matchAll(re)]; 
                console.log(matches); 
                matches.forEach(match => {
                    console.log("yup match", Object.keys(messages).includes(match[0].slice(1)), Object.keys(messages), match[0].slice(1)); 
                    if (Object.keys(messages).includes(match[0].slice(1))) {
                        positions.push([match.index, match.index+match[0].length, match[0].slice(1)]); 
                    }
                }); 

                let newMsg = data.msg.split(''); 
                positions.reverse().forEach(pos => {
                    newMsg.splice(pos[1], 0, "</span>"); 
                    newMsg.splice(pos[0], 0, `<span class="roomLink" data-room="${pos[2]}">`); 

                    // console.log(data.msg.split('').splice(0, pos[1], "</span>").join('')); 
                    // data.msg = `<span class="hashtag">${data.msg[pos[0]]}`; 
                }); 

                data.msg = newMsg.join(''); 
                console.log(data.msg); 
            }
            data.id = currentUser.id; 
            data.name = currentUser.name; 
            data.timestamp = Date.now(); 
            // data.timestampFormatted = new Date(data.timestamp).toLocaleTimeString(); 
            messages[data.to].push(data); 
        }

        fs.writeFileSync("./messages.json", JSON.stringify(messages)); 
        io.to(data.to).emit("update", messages[data.to]); 
    }); 

    socket.on("switchRoom", (data, callback) => {
        if (data.from) socket.leave(data.from); 
        socket.join(data.to); 
        socket.emit("update", messages[data.to]); 
        console.log(`Switched user ${currentUser.id} to room #${data.to}... `); 

        if (callback) callback(); 
    }); 
}); 

io.listen(3000); 
app.listen(8080); 
console.log("Listening on port 3000!"); 