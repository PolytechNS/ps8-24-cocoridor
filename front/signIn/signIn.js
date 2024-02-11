let signInBtn = document.getElementById('signIn');
let username=document.getElementById('username');
let mdp=document.getElementById('mdp');
signInBtn.onclick = function(){
    let user = {
        username: username.value,
        email: " ",
        password: mdp.value
    }


    fetch('http://localhost:8000/api/signIn', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(user)
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
        let currentDate = new Date();
        let expirationDate = new Date(currentDate.getTime() + (1 * 60 * 60 * 1000)); // Ajouter une heure en millisecondes
        let expiresUTC = expirationDate.toUTCString();
        console.log("EEEEEE");
        document.cookie = "nomCookie="+username.value+"; expires=" + expiresUTC + ";";
        window.location.href = "../";
    })
    .catch((error) => {
        console.error('Error:', error);
    });
    console.log('username : '+ username.value);
}