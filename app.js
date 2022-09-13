const socket = io("http://localhost:3000"); 

socket.on("connect", () => {
    console.log("Connected!"); 
}); 

socket.on("disconnect", () => {
    console.log("Disconnected..."); 
}); 

socket.on("update", data => {
    console.log(data); 
    messages = data; 
    let scrolled = msgList.scrollTop >= msgList.scrollHeight-msgList.scrollHeight*0.25; 
    // console.log("1", msgList.scrollTop, "2", msgList.scrollHeight); 
    // console.log(msgBox.style); 
    msgList.innerHTML = messages.map(msg => {
        return `<li>${msg.name}: ${msg.msg}</li>`; 
    }).join(''); 
    if (scrolled) msgList.scrollTop = msgList.scrollHeight; 
    // console.log("1", msgList.scrollTop, "2", msgList.scrollHeight); 
}); 


let app = document.getElementById("appContainer"); 
let msgList = document.getElementById("msgList"); 
let msgBox = document.getElementById("msgBox"); 
let sendBtn = document.getElementById("sendBtn"); 

let messages = []; 

document.addEventListener("keyup", e => {
    if (msgBox !== document.activeElement) {
        if (/^[a-z0-9]$/i.test(e.key)) {
            msgBox.focus(); 
            msgBox.value += e.key; 
        }
    }
}); 

// msgList.addEventListener("scroll", () => console.log(msgList.scrollTop, msgList.scrollHeight)); 

msgBox.addEventListener("keyup", e => {
    if (msgBox.value === "") return; 
    if (e.key === "Enter") {
        socket.emit("new_message", {msg: msgBox.value}); 
        msgBox.value = ""; 
    }
})

sendBtn.addEventListener("click", e => {
    if (msgBox.value === "") return; 
    socket.emit("new_message", {msg: msgBox.value}); 
    msgBox.value = ""; 
}); 

// setInterval(() => {
//     msgList.innerHTML = messages.map(msg => {
//         return `<li>${msg.name}: ${msg.msg}</li>`; 
//     }).join(''); 
// }); 