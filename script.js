const username = "The SDF Master";
const socket = new WebSocket("wss://special-space-rotary-phone-w64954xxjjv2vv7w-8080.app.github.dev/");
document.body.innerHTML = "";
document.title = "PCA";
const favicon = document.querySelector("link[rel~='icon']");
if (favicon) {
    favicon.remove();
}
if ("Notification" in window && Notification.permission !== "granted") {
    Notification.requestPermission().then((permission) => {
        console.log(`Notification permission: ${permission}`);
    });
}
let canReceiveNotifications = false;
setTimeout(() => {
    canReceiveNotifications = true;
}, 10000);
function showNotification(title, message) {
    // Ignore empty or whitespace messages in notifications
    if (!message.trim()) {
        return;
    }
    if (Notification.permission === "granted" && canReceiveNotifications) {
        new Notification(title, {
            body: message,
            icon: "",
        });
    }
}
const style = document.createElement("style");
style.textContent = `
    * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
    }
    body {
        margin: 0;
        font-family: 'Arial', sans-serif;
        background: #1E1E2F;
        color: #FFFFFF;
        display: flex;
        flex-direction: column;
        height: 100vh;
        overflow-x: hidden;
    }
    #messageContainer {
        flex-grow: 1;
        overflow-y: auto;
        overflow-x: hidden;
        padding: 10px;
        background: #1A1A2E;
    }
    #messageContainer p {
        margin: 5px 0;
        padding: 10px;
        background: #2A2A4E;
        color: #DCDCFF;
        border-radius: 5px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.2);
        transition: background 0.3s, transform 0.3s;
    }
    #messageContainer p:hover {
        background: #3E3E6E;
        transform: scale(1.01);
    }
    form {
        display: flex;
        padding: 10px;
        background: #1E1E2F;
        border-top: 2px solid #3A3A5E;
    }
    form input[type="text"] {
        flex-grow: 1;
        padding: 10px;
        font-size: 16px;
        border: 1px solid #3A3A5E;
        border-radius: 5px;
        background: #2A2A4E;
        color: #DCDCFF;
        outline: none;
    }
    form input[type="text"]::placeholder {
        color: #7A7A9E;
    }
    form button {
        padding: 10px 15px;
        font-size: 16px;
        color: #FFFFFF;
        background: #5A5A8E;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        margin-left: 10px;
        transition: background 0.3s, transform 0.3s;
    }
    form button:hover {
        background: #7A7AAE;
        transform: scale(1.05);
    }
`;
document.head.appendChild(style);
const messageContainer = document.createElement("div");
messageContainer.id = "messageContainer";
document.body.appendChild(messageContainer);
const form = document.createElement("form");
const inputElement = document.createElement("input");
inputElement.type = "text";
inputElement.placeholder = "Envoyer un message";
const submitButton = document.createElement("button");
submitButton.textContent = "Submit";
form.appendChild(inputElement);
form.appendChild(submitButton);
document.body.appendChild(form);
form.addEventListener("submit", (event) => {
    event.preventDefault();
    const enteredText = inputElement.value.trim();
    if (!enteredText) {
        return;
    }
    const time = getCurrentTime();
    socket.send(JSON.stringify({
        "action": "chat",
        "username": username,
        "message": enteredText,
        "time": time
    }));
    inputElement.value = "";
});
let messages = [];
let loadingMessages = false;
let lastMessageTime = 0;
let recentMessages = [];
socket.onopen = function () {
    socket.send(JSON.stringify({
        "action": "join",
        "username": username,
        "password":"123456"
    }));
};
socket.onmessage = function (event) {
    const data = JSON.parse(event.data);
    // Ignore empty or whitespace messages
    if (!data.message.trim()) {
        return;
    }
    // Ignore certain actions
    if (data.action === "pong" || data.action === "leave") {
        return;
    }
    const message = `${data.username}: ${data.message}`;
    // Spam prevention: Check for repeated messages or similar letter patterns (e.g., "aaaa", "bbbb")
    const timeElapsed = new Date().getTime() - lastMessageTime;
    if (timeElapsed < 5000) {
        recentMessages.push(data.message);
        const similarMessages = recentMessages.filter(msg => msg === data.message).length;
        const similarPattern = /([a-zA-Z])\1{3,}/.test(data.message); // Detect repetitive letters
        if (similarMessages > 2 || similarPattern) {
            return; // Ignore this message as potential spam
        }
    } else {
        recentMessages = [];
    }
    // Record the last time a message was received
    lastMessageTime = new Date().getTime();
    messages.push({ username: data.username, message: data.message });
    if (messages.length > 25) {
        messages.shift();
    }
    renderMessages();
    if (data.username !== username) {
        showNotification("New Message", message);
    }
};
messageContainer.addEventListener('scroll', () => {
    if (messageContainer.scrollTop === 0 && !loadingMessages) {
        loadingMessages = true;
        loadMoreMessages();
    }
});
function loadMoreMessages() {
    const start = Math.max(messages.length - 50, 0);
    const newMessages = messages.slice(start, messages.length - 25);
    newMessages.forEach(msg => {
        const paragraph = document.createElement("p");
        paragraph.innerHTML = `${msg.username}: ${msg.message}`;
        messageContainer.insertBefore(paragraph, messageContainer.firstChild);
    });
    loadingMessages = false;
}
function renderMessages() {
    messageContainer.innerHTML = "";
    const messagesToDisplay = messages.slice(-25);
    messagesToDisplay.forEach(msg => {
        const paragraph = document.createElement("p");
        paragraph.innerHTML = `${msg.username}: ${msg.message}`;
        messageContainer.appendChild(paragraph);
    });
    messageContainer.scrollTop = messageContainer.scrollHeight;
}
function getCurrentTime() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    const hour = now.getHours();
    return `${year}-${month < 10 ? '0' + month : month}-${day < 10 ? '0' + day : day} ${hour < 10 ? '0' + hour : hour}h`;
}
