const socket = io('https://reimagined-space-broccoli-9r4rprq5ggqcxg5p-8080.app.github.dev/');

let lastMessageId = "";  // Variable pour suivre l'ID du dernier message
// Liste des messages envoyés (pour vérifier les doublons)
window.sentMessages = window.sentMessages || [];

window.onload = () => {
  fetch('https://reimagined-space-broccoli-9r4rprq5ggqcxg5p-8080.app.github.dev/chat/datas')
    .then(response => response.json())
    .then(datas => {
      const chat = sessionStorage.getItem("Chat");
      const bigDiv = document.getElementById("bigDiv");
      
      if (datas[chat]) {
        for (doc of datas[chat]) {
          const DIV = document.createElement("div");
          DIV.id = doc._id;
          DIV.classList.add(doc.Name, "Message");
          bigDiv.appendChild(DIV);

          const User = document.createElement("h5");
          User.id = doc._id + "-User";
          User.classList.add(doc.Name + "-User", "Message");
          User.innerHTML = doc.User;
          DIV.appendChild(User);

          const Message = document.createElement("p");
          Message.id = doc._id + "-Text";
          Message.classList.add(doc.Name + "-Text", "Message");
          Message.innerHTML = doc.Message;
          DIV.appendChild(Message);

          // Mémorise l'ID du dernier message pour éviter les doublons
          lastMessageId = doc._id;
        }
      } else if (sessionStorage.getItem("Chat")) {
        const chat = sessionStorage.getItem("Chat");
        const DIV = document.createElement("div");
        DIV.id = "CHAT_NOT_FOUND";
        DIV.classList.add("ALERT", "Message");
        bigDiv.appendChild(DIV);

        const container = DIV;
        const h5 = document.createElement("h5");
        h5.id = "CHAT_NOT_FOUND h5";
        h5.classList.add("ALERT-h5", "Message");
        h5.innerHTML = "ALERT";
        container.appendChild(h5);

        const p = document.createElement("p");
        p.id = "CHAT_NOT_FOUND p";
        p.classList.add("ALERT-Text", "Message");
        p.innerHTML = "Bienvenue dans " + chat;
        container.appendChild(p);
      } else {
        window.location.href = "https://reimagined-space-broccoli-9r4rprq5ggqcxg5p-8080.app.github.dev/";
      }

      // L'autoscroll doit être appliqué après que tous les messages ont été ajoutés au DOM
      const child = bigDiv.lastElementChild;
      child.scrollIntoView({ behavior: 'smooth', block: 'end' });
    })
}

// Fonction qui écoute les messages envoyés par les autres utilisateurs via le socket
socket.on('broadcastMessage', (doc) => {
  if (doc["Chat"] == sessionStorage.getItem("Chat")) {
    // Vérification si le message a déjà été envoyé localement
    if (window.sentMessages.includes(doc.Message)) {
      return;  // Si le message est déjà dans la liste des messages envoyés, ne rien faire
    }

    // Sinon, afficher le message
    const bigDiv = document.getElementById("bigDiv");

    const DIV = document.createElement("div");
    DIV.id = doc._id;  // L'ID est unique pour chaque message
    DIV.classList.add(doc.Name, "Message");
    bigDiv.appendChild(DIV);

    const userElement = document.createElement("h5");
    userElement.id = doc._id + "-User";
    userElement.classList.add(doc.Name + "-User", "Message");
    userElement.innerHTML = doc.User;
    DIV.appendChild(userElement);

    const messageElement = document.createElement("p");
    messageElement.id = doc._id + "-Text";
    messageElement.classList.add(doc.Name + "-Text", "Message");
    messageElement.innerHTML = doc.Message;
    DIV.appendChild(messageElement);

    // On fait défiler la page pour voir le dernier message
    const child = bigDiv.lastElementChild;
    child.scrollIntoView({ behavior: 'smooth', block: 'end' });

    // Ajouter ce message à la liste des messages envoyés pour ne pas le réafficher
    window.sentMessages.push(doc.Message);
  }
});
