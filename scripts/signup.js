import { insertData, details } from '/scripts/server.js';



const form = document.getElementById("myForm");
const emailInput = document.getElementById("emailAddress");
const passwordInput = document.getElementById("password");
const nameInput = document.getElementById("name");
const birthdayInput = document.getElementById("birthday");
const usernameInput = document.getElementById("username");
const errorMessage = document.getElementById("emailErrorMessage");

var corrects = 0;


form.addEventListener("submit", (event) => {
    event.preventDefault(); 
    errorMessage.style.display = "none"; 
    corrects=0;
    
    const emailValue = emailInput.value.trim();
    const passwordValue = passwordInput.value.trim();
    const nameValue = nameInput.value.trim();
    const birthdayValue = birthdayInput.value.trim();
    const usernameValue = usernameInput.value.trim();

  
    if (emailValue === "") {
        errorMessage.textContent = "Email cannot be empty.";
        errorMessage.style.display = "block";
    } else if (!emailValue.includes("@") || !emailValue.includes(".")) {
        errorMessage.textContent = "Please provide a valid email address.";
        errorMessage.style.display = "block";
    } else {
        

        corrects++;
        
        
    }


    if (passwordValue === "") {
        errorMessage.textContent = "Password cannot be empty.";
        errorMessage.style.display = "block";
    } else if (passwordValue.length < 8) {
        errorMessage.textContent = "Password must be minimum of 8 characters.";
        errorMessage.style.display = "block";
    } else {
        

        
        corrects++;
        
        
    }


    if (nameValue === "") {
        errorMessage.textContent = "Name cannot be empty.";
        errorMessage.style.display = "block";
    } else if (nameValue.length == 0) {
        errorMessage.textContent = "First and Last Name Please";
        errorMessage.style.display = "block";
    } else {
        

        
        corrects++;
        
        
    }


    if (birthdayValue === "") {
        errorMessage.textContent = "Birthday cannot be empty.";
        errorMessage.style.display = "block";
    } else {
        

        
        corrects++;
        
        
    }


    if (usernameValue === "") {
        errorMessage.textContent = "Username cannot be empty.";
        errorMessage.style.display = "block";
    } else if (usernameValue.length < 5) {
        errorMessage.textContent = "Username must be at least 5 characters long.";
        errorMessage.style.display = "block";
    } else {
        

        
        corrects++;
        
        
    }


    if(corrects == 5){
        insertData(usernameValue, passwordValue, nameValue, birthdayValue, emailValue);
        
    }
});