let Chat = "";
let Message = "";
let User = "";  // On crée une variable User pour utiliser le nom d'utilisateur partout
let Name = "";

// Cette fonction gère la soumission du formulaire pour créer ou rejoindre une salle de chat
async function handleForm2(event) {
  event.preventDefault();  // On empêche la page de se recharger

  // On récupère le message de l'utilisateur
  Message = document.getElementById('message').value;
  document.getElementById('message').value = "";  // On vide le champ de texte après l'envoi
  
  // On récupère les informations de session (nom, utilisateur, chat)
  User = sessionStorage.getItem("User");
  Name = sessionStorage.getItem("Name");
  Chat = sessionStorage.getItem("Chat");

  if (Chat && User && Name && Message) {
    const data = { User, Name, Chat, Message };

    // On émet le message via le socket en premier (WebSocket)
    socket.emit('newMessage', data);

    // Ajouter à la liste des messages envoyés pour ne pas le réafficher
    if (!window.sentMessages.includes(data.Message)) {
      window.sentMessages.push(data.Message);
    }

    try {
      // On envoie le message au serveur via une requête POST
      const response = await fetch('/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (response.ok) {
        console.log('Le message a été envoyé avec succès:', data);
      } else {
        console.error('Erreur lors de l\'envoi du message:', response.statusText);
      }
    } catch (error) {
      console.error('Échec de la requête:', error);
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('form');
  if (form) {
    form.addEventListener('submit', handleForm);
  } else if (document.getElementById("sender")) {
    document.getElementById("sender").addEventListener("submit", handleForm2);
  }
});
