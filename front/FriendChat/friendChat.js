
document.addEventListener('DOMContentLoaded', function() {
  const urlParams = new URLSearchParams(window.location.search);
  const friendId = urlParams.get('friendId');

  if (friendId) {
    document.getElementById("title").textContent += friendId;
  } else {
    document.getElementById("title").textContent += "";
  }
});

document.addEventListener("DOMContentLoaded", async function () {
  const addFriendForm = document.getElementById("addFriendForm");
  const textContent = document.getElementById("textContent");

  addFriendForm.addEventListener("submit", function (event) {
    event.preventDefault();
    const message = textContent.value;
    if (message !== "") {
      fetch("http://localhost:8000/api/addMessage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: nameUser,
          friendName: friendName,
          message: message,
        }),
      })
          .then((response) => {
            if (response.ok) {
              alert("Demande envoyée");
            } else {
              throw new Error("La requête a échoué");
            }
          })
          .catch((error) => {
            console.error(error);
          });
      textContent.value = "";
      socket.emit('newMessage', nameUser, friendName);
    }
  });

});

  async function updateConv(nameUser, friendName) {
    await fetch("http://localhost:8000/api/getConv", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username: nameUser, friendName: friendName }),
    })
      .then((response) => response.json())
      .then((data) => {
        const conv = data.conv;
        const chatContent = document.getElementById("chatContent");
        chatContent.innerHTML = "";
        for (const message of conv) {
          const messageElement = document.createElement("p");
          if (message.split("/")[0] === nameUser) {
            messageElement.style.textAlign = "right";
            messageElement.style.color = "blue";
          } else {
            messageElement.style.textAlign = "left";
            messageElement.style.color = "green";
          }
          messageElement.textContent = message.split("/")[1];
          chatContent.appendChild(messageElement);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }
