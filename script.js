// Start with an initial username and socket connection
let username = "The SDF Master";  // Initially set username
let textColor = "FFFFFF"; // Initially set text color
const socket = new WebSocket("wss://special-space-rotary-phone-w64954xxjjv2vv7w-8080.app.github.dev/");
document.title = "PCA";

// Request notification permission
let canReceiveNotifications = false;

if ("Notification" in window) {
    if (Notification.permission === "granted") {
        canReceiveNotifications = true;
    } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then((permission) => {
            if (permission === "granted") {
                canReceiveNotifications = true;
            }
        });
    }
}

function showNotification(title, message) {
    if (!message.trim()) return;  // Don't show if message is empty

    if (Notification.permission === "granted" && canReceiveNotifications) {
        new Notification(title, {
            body: message,
            icon: "",  // You can provide a URL to an icon if you want
        });
    }
}

// Add style to the page
const style = document.createElement("style");
style.textContent = `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { margin: 0; font-family: 'Poppins', sans-serif; background: #490566; color: ${textColor}; display: flex; flex-direction: column; height: 100vh; overflow-x: hidden; }
    #messageContainer { flex-grow: 1; overflow-y: auto; padding: 10px; background: #1A1A2E; }
    #messageContainer p { margin: 5px 0; padding: 10px; background: #140136; color: #DCDCFF; border-radius: 5px; box-shadow: 0 1px 3px rgba(0,0,0,0.2); transition: background 0.3s, transform 0.3s; }
    #messageContainer p:hover { background: #4f0303; text-color: black; transform: scale(1.01); }
    form { display: flex; padding: 10px; background: #1E1E2F; border-top: 2px solid #3A3A5E; }
    form input[type="text"] { flex-grow: 1; padding: 10px; font-size: 16px; border: 1px solid #3A3A5E; border-radius: 5px; background: #2A2A4E; color: #DCDCFF; outline: none; }
    form input[type="text"]::placeholder { color: #7A7A9E; }
    form button { padding: 10px 15px; font-size: 16px; color: #FFFFFF; background: #5A5A8E; border: none; border-radius: 5px; cursor: pointer; margin-left: 10px; transition: background 0.3s, transform 0.3s; }
    form button:hover { background: #7A7AAE; transform: scale(2); }

    #loadingScreen { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.8); color: white; display: flex; flex-direction: column; justify-content: center; align-items: center; font-size: 24px; z-index: 1000; }
    #loadingScreen .progress-bar { width: 80%; height: 20px; background-color: #444; border-radius: 10px; margin-top: 20px; overflow: hidden; position: relative; }
    #loadingScreen .progress-bar .progress { height: 100%; background-color: #5A5A8E; width: 0; transition: width 0.2s ease-in-out; }
    #loadingScreen .text { margin-bottom: 10px; }

    #sideMenu { position: fixed; top: 0; left: 0; width: 250px; height: 100%; background: #2A2A4E; color: #fff; padding: 20px; z-index: 1001; transform: translateX(-100%); transition: transform 0.3s ease; }
    #sideMenu.open { transform: translateX(0); }
    #sideMenu h3 { margin-bottom: 20px; }
    #sideMenu label { display: block; margin: 10px 0; font-size: 16px; }
    #sideMenu input { width: 100%; padding: 10px; margin-top: 5px; background: #1E1E2F; color: #fff; border: 1px solid #3A3A5E; border-radius: 5px; }
    #sideMenu button { margin-top: 20px; padding: 10px 15px; background: #5A5A8E; border: none; border-radius: 5px; cursor: pointer; color: #fff; transition: background 0.3s ease; }
    #sideMenu button:hover { background: #7A7AAE; }
    #menuToggle { position: absolute; top: 20px; left: 20px; background: #5A5A8E; color: #fff; border: none; padding: 10px 15px; cursor: pointer; border-radius: 5px; z-index: 1002; }
    #menuToggle:hover { background: #7A7AAE; }
`;

document.head.appendChild(style);

// Create side menu
const sideMenu = document.createElement("div");
sideMenu.id = "sideMenu";
sideMenu.innerHTML =`
    <h3>Settings</h3>
    <label for="textColor">Text Color:</label>
    <input type="color" id="textColorInput" value="${textColor}">
    <label for="bgColor">Background Color:</label>
    <input type="color" id="bgColorInput" value="#490566">
    <button id="saveSettingsButton">Save Settings</button>
`;

document.body.appendChild(sideMenu);

// Create menu toggle button
const menuToggle = document.createElement("button");
menuToggle.id = "menuToggle";
menuToggle.textContent = "Settings";
document.body.appendChild(menuToggle);

// Toggle side menu visibility
menuToggle.addEventListener("click", () => {
    sideMenu.classList.toggle("open");
});

// Save settings and update the page
const saveSettingsButton = document.getElementById("saveSettingsButton");
saveSettingsButton.addEventListener("click", () => {
    const newTextColor = document.getElementById("textColorInput").value;
    const newBgColor = document.getElementById("bgColorInput").value;
    
    // Update text color
    textColor = newTextColor;
    
    // Update body style dynamically
    document.body.style.color = textColor;

    // Change background color
    document.body.style.backgroundColor = newBgColor;
    
    // Close the side menu after saving settings
    sideMenu.classList.remove("open");
});

// Create loading screen
const loadingScreen = document.createElement("div");
loadingScreen.id = "loadingScreen";
loadingScreen.innerHTML = `
    <div class="text">Loading, please wait...</div>
    <div class="progress-bar">
        <div class="progress"></div>
    </div>
`;

document.body.appendChild(loadingScreen);

// Progress bar update function
let loadingProgress = 0;
let loadingComplete = false;  // Flag to track loading completion

function updateLoadingProgress() {
    if (loadingProgress < 100 && !loadingComplete) {
        loadingProgress += Math.random() * 2 + 1; // Randomize step to make it less linear
        loadingProgress = Math.min(loadingProgress, 100); // Prevent exceeding 100%
        
        const progressBar = loadingScreen.querySelector(".progress");
        progressBar.style.width = `${loadingProgress}%`;

        // Keep animating the progress bar smoothly
        requestAnimationFrame(updateLoadingProgress);
    } else if (loadingProgress === 100 && !loadingComplete) {
        loadingComplete = true; // Mark loading as complete when the progress reaches 100%
        // Now remove the loading screen after the progress is complete
        setTimeout(() => {
            if (document.body.contains(loadingScreen)) {
                document.body.removeChild(loadingScreen);
            }
        }, 1000); // Add a slight delay for smooth transition
    }
}

// Start loading animation
requestAnimationFrame(updateLoadingProgress);

// Create message container
const messageContainer = document.createElement("div");
messageContainer.id = "messageContainer";
document.body.appendChild(messageContainer);

// Create form
const form = document.createElement("form");
const inputElement = document.createElement("input");
inputElement.type = "text";
inputElement.placeholder = "Envoyer un message";
const submitButton = document.createElement("button");
submitButton.textContent = "Submit";
form.appendChild(inputElement);
form.appendChild(submitButton);
document.body.appendChild(form);

// Handle form submission
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

// WebSocket onmessage (receive new messages)
socket.onmessage = function (event) {
    const data = JSON.parse(event.data);
    console.log(data);

    if (data.action === "pong") {
        return;
    }

    if (data.action === "load") {
        const content = data.content;
        content.forEach(doc => {
            const paragraph = document.createElement("p");
            paragraph.innerHTML = `${doc.username}: ${doc.message}`;
            messageContainer.appendChild(paragraph);

            // Show notification when a new message is received
            showNotification(doc.username, doc.message);
        });
        messageContainer.scrollTop = messageContainer.scrollHeight;

        // Hide loading screen once messages are loaded
        if (document.body.contains(loadingScreen)) {
            document.body.removeChild(loadingScreen);
        }
    } else {
        const message = `${data.username}: ${data.message}`;
        const paragraph = document.createElement("p");
        paragraph.innerHTML = message;
        messageContainer.appendChild(paragraph);
        messageContainer.scrollTop = messageContainer.scrollHeight;

        // Show notification when a new message is received
        showNotification(data.username, data.message);
    }
};

// Get current time
function getCurrentTime() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    const hour = now.getHours();
    return `${year}-${month < 10 ? '0' + month : month}-${day < 10 ? '0' + day : day} ${hour < 10 ? '0' + hour : hour}h`;
}
