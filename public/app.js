const ip = "10.0.0.20"; 
// School: 10.214.163.139 
// Home: 10.0.0.20 
const socket = (ip) ? io(`http://${ip}:3000`) : io(); 
const device_id = Cookies.get("device_id"); 
let user; 

socket.on("connect", () => {
    console.log("Connected!"); 
    socket.emit("user_join", {id: device_id}, (user) => {
        if (!device_id) Cookies.set("device_id", user.id); 
        user = user; 
        console.log(user); 
    }); 


    socket.emit("switchRoom", {to: currentRoom}); 
    loadingModal.style.display = "none"; 
}); 

socket.on("disconnect", () => {
    console.log("Disconnected..."); 
    loadingModal.style.display = "flex"; 
}); 

socket.on("update", data => {
    console.log(data); 
    messages = data; 
    let scrolled = msgList.scrollTop >= msgList.scrollHeight/2; 
    // console.log("1", msgList.scrollTop, "2", msgList.scrollHeight); 
    // console.log(msgBox.style); 

    let prevMsg = messages[0]; 
    msgList.innerHTML = messages.map((msg, i) => {
        let msgHTML = `<li><span class="msgTimestamp">${new Date(msg.timestamp).toLocaleTimeString()}</span><p>${msg.msg}</p></li>`; 
        if (prevMsg) console.log(msg.id, prevMsg.id); 
        if (i === 0 || msg.id !== prevMsg.id) { 
            msgHTML = `<p class="msgUsername">${msg.name}</p>` + msgHTML; 
        } // else { 
        //     msgHTML = `<p class="msgUsername">${msg.name}</p><li><p><span class="msgTimestamp">${new Date(msg.timestamp).toLocaleTimeString()}</span> ${msg.msg}</p></li>`; 
        // } 
        prevMsg = msg; 
        return msgHTML; 
    }).join(''); 
    if (scrolled) msgList.scrollTop = msgList.scrollHeight; 
    // console.log("1", msgList.scrollTop, "2", msgList.scrollHeight); 
}); 

socket.on("rooms", data => {
    console.log(data); 
    roomList.innerHTML = data.map(room => {
        return `<li class="${(room === currentRoom) ? "activeRoom" : ""}" data-room="${room}">#${room}</li>`; 
    }).join(''); 
}); 

let loadingModal = document.getElementById("loadingModal"); 
let roomName = document.getElementById("roomName"); 
let app = document.getElementById("appContainer"); 
let roomList = document.getElementById("roomList"); 
let msgList = document.getElementById("msgList"); 
let msgBox = document.getElementById("msgBox"); 
let sendBtn = document.getElementById("sendBtn"); 

// msgList.scrollTop = msgList.scrollHeight; 
msgBox.style.height = "auto"; 
msgBox.style.height = (msgBox.scrollHeight)+"px"; 

let messages = []; 
let currentRoom = "general"; 
roomName.innerText = `#${currentRoom}`; 
// let prevKey = ""; 

// keymage('shift+enter', () => {
//     console.log("Shift+Enter"); 
// }); 

document.addEventListener("keydown", e => {
    // console.log(e); 
    msgBox.style.height = "auto"; 
    msgBox.style.height = (msgBox.scrollHeight)+"px"; 
    if (msgBox !== document.activeElement) {
        if (/^[a-z0-9]$/i.test(e.key) && !keyMap["Control"]) {
            msgBox.focus(); 
            // msgBox.value += e.key; 
        }
    }
    // console.log("doc", prevKey, e.key); 
    // prevKey = e.key; 
}); 

// msgList.addEventListener("scroll", () => console.log(msgList.scrollTop, msgList.scrollHeight)); 

// msgBox.addEventListener("keyup", sendMessage); 

sendBtn.addEventListener("click", () => sendMessage()); 

roomList.addEventListener("click", e => {
    if (e.target.tagName === "LI") { 
        let room = e.target.dataset.room; 
        if (room === currentRoom) return; 

        socket.emit("switchRoom", {from: currentRoom, to: room}); 
        currentRoom = room; 
        roomName.innerText = `#${currentRoom}`; 
        roomList.querySelector(".activeRoom").classList.remove("activeRoom"); 
        e.target.classList.add("activeRoom"); 
    } 
}); 

function sendMessage() {
    // e.preventDefault(); 
    // console.log(prevKey, e.key); 
    if (msgBox.value === "") return; 
    // msgBox.style.height = "1px"; 
    // msgBox.style.height = (msgBox.scrollHeight)+"px"; 

    socket.emit("new_message", {msg: msgBox.value, to: currentRoom}); 
    msgBox.value = ""; 
    msgBox.style.height = "auto"; 
    msgBox.style.height = (msgBox.scrollHeight)+"px"; 
} 

let keyMap = {}; 
onkeydown = onkeyup = function(e) {
    e = e || event; 
    keyMap[e.key] = e.type == 'keydown'; 
    if (keyMap["Shift"] && keyMap["Enter"]) {
        e.preventDefault(); 
        msgBox.value += "\n"; 
        msgBox.style.height = "auto"; 
        msgBox.style.height = (msgBox.scrollHeight)+"px";     
        return; 
    } 
    if (keyMap["Enter"]) {
        e.preventDefault(); 
        sendMessage(); 
        return; 
    } 
} 

// setInterval(() => {
//     msgList.innerHTML = messages.map(msg => {
//         return `<li>${msg.name}: ${msg.msg}</li>`; 
//     }).join(''); 
// }); 