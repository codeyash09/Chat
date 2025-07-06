import { fetchPassword, details, fetchId } from '/scripts/server.js';



const form = document.getElementById("myForm");
const emailInput = document.getElementById("emailAddress");
const passwordInput = document.getElementById("password");
const errorMessage = document.getElementById("emailErrorMessage");

var pass;
var code;



form.addEventListener("submit", (event) => {
    event.preventDefault(); 
    errorMessage.textContent = "";
    
    
    const emailValue = emailInput.value.trim();
    const passwordValue = passwordInput.value.trim();

    let passPromise;
    if(emailValue.includes("@") && emailValue.includes(".")){
        passPromise = fetchPassword('Users', 'email', emailValue);
    }else{
        passPromise = fetchPassword('Users', 'username', emailValue);
    }

    if(!passPromise){
        errorMessage.textContent = "The given username/email does not exist. Please Sign Up.";
        return;
    }

    passPromise.then(result => {
        if(!result || !Array.isArray(result) || result.length === 0 || !result[0]){
            errorMessage.textContent = "The given username/email does not exist. Please Sign Up.";
            return;
        }
        code = result[0].password;
        if(code != passwordValue){
            errorMessage.textContent = "Incorrect Password Or Username/Email";
            return;
        }
        window.localStorage.setItem('loggedInStatus', true);
        let idPromise;
        if(emailValue.includes("@") && emailValue.includes(".")){
            idPromise = fetchId('Users', 'email', emailValue);
        }else{
            idPromise = fetchId('Users', 'username', emailValue);
        }
        if(!idPromise){
            errorMessage.textContent = "Could not fetch user ID. Please try again.";
            return;
        }
        idPromise.then(idResult => {
            if(!idResult || !Array.isArray(idResult) || idResult.length === 0 || !idResult[0]){
                errorMessage.textContent = "Could not fetch user ID. Please try again.";
                return;
            }
            const id = idResult[0].id;
            window.localStorage.setItem('userIdentify', id);
            window.location.replace("/pages/chats.html");
        }).catch(() => {
            errorMessage.textContent = "Could not fetch user ID. Please try again.";
        });
    }).catch(() => {
        errorMessage.textContent = "An error occurred. Please try again.";
    });
});

// Hide error when user starts typing
emailInput.addEventListener('input', () => {
    errorMessage.textContent = "";
});
passwordInput.addEventListener('input', () => {
    errorMessage.textContent = "";
});

