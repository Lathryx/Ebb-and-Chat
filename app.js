const socket = io("http://localhost:3000"); 

socket.on("connect", () => {
    console.log("Connected!"); 
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
    let scrolled = msgList.scrollTop >= msgList.scrollHeight-msgList.scrollHeight*0.25; 
    // console.log("1", msgList.scrollTop, "2", msgList.scrollHeight); 
    // console.log(msgBox.style); 
    msgList.innerHTML = messages.map(msg => {
        return `<li><span class="msgTimestamp">${new Date(msg.timestamp).toLocaleTimeString()}</span> ${msg.name}: ${msg.msg}</li>`; 
    }).join(''); 
    if (scrolled) msgList.scrollTop = msgList.scrollHeight; 
    // console.log("1", msgList.scrollTop, "2", msgList.scrollHeight); 
}); 

socket.on("rooms", data => {
    console.log(data); 
    roomList.innerHTML = data.map(room => {
        return `<li data-room=${room}>#${room}</li>`; 
    }).join(''); 
}); 

let loadingModal = document.getElementById("loadingModal"); 
let roomName = document.getElementById("roomName"); 
let app = document.getElementById("appContainer"); 
let roomList = document.getElementById("roomList"); 
let msgList = document.getElementById("msgList"); 
let msgBox = document.getElementById("msgBox"); 
let sendBtn = document.getElementById("sendBtn"); 

let messages = []; 
let currentRoom = "general"; 
roomName.innerText = `#${currentRoom}`; 

document.addEventListener("keyup", e => {
    if (msgBox !== document.activeElement) {
        if (/^[a-z0-9]$/i.test(e.key)) {
            msgBox.focus(); 
            msgBox.value += e.key; 
        }
    }
}); 

// msgList.addEventListener("scroll", () => console.log(msgList.scrollTop, msgList.scrollHeight)); 

msgBox.addEventListener("keyup", sendMessage); 

sendBtn.addEventListener("click", sendMessage); 

roomList.addEventListener("click", e => {
    if (e.target.tagName === "LI") { 
        let room = e.target.dataset.room; 
        if (room === currentRoom) return; 

        socket.emit("switchRoom", {from: currentRoom, to: room}); 
        currentRoom = room; 
        roomName.innerText = `#${currentRoom}`; 
    } 
}); 

function sendMessage(e) {
    if (msgBox.value === "") return; 
    if (e.key === "Enter") {
        socket.emit("new_message", {msg: msgBox.value, to: currentRoom}); 
        msgBox.value = ""; 
    } 
} 

// setInterval(() => {
//     msgList.innerHTML = messages.map(msg => {
//         return `<li>${msg.name}: ${msg.msg}</li>`; 
//     }).join(''); 
// }); 