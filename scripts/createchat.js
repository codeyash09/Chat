// for(let i = 0; i< inputs.length; i++){
//     inputs[i].value = '';
// }



let db = supabase.createClient(
    'https://pmfrislowxhopnexusxa.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBtZnJpc2xvd3hob3BuZXh1c3hhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODk4NjExMSwiZXhwIjoyMDY0NTYyMTExfQ.TTYNG0O0nTFqS8QPimAqhC-uqmNs65Aaml1kqAtYeTQ'
);

export {db};




document.addEventListener("DOMContentLoaded", () => {
    const addInputButton = document.getElementById("addInput");
    const submitButton = document.getElementById("submit");
    const submitButton2 = document.getElementById("submit2");

    // Ensure only one listener is attached
    if (!addInputButton.dataset.listenerAttached) {
        addInputButton.addEventListener("click", inputHandleFunction);
        addInputButton.dataset.listenerAttached = true;
    }

    if (!submitButton.dataset.listenerAttached) {
        submitButton.addEventListener("click", handleSubmit);
        submitButton.dataset.listenerAttached = true;
    }

    if (!submitButton2.dataset.listenerAttached) {
        submitButton2.addEventListener("click", handleSubmit2);
        submitButton2.dataset.listenerAttached = true;
    }
});


let newChat = document.getElementById("newChatBtn");
let wall = document.getElementById("blurWall");
let former = document.getElementById("form");
const inputContainer = document.getElementById("inputs");
let correct = true;
let submit = false;
const errorMessage = document.getElementById("emailErrorMessage");
let q1 = document.getElementById("users");
let q2 = document.getElementById("q2");
let gcName = document.getElementById("gcname");
let usernames;
let clicked = false;

let created = false;


inputContainer.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        event.preventDefault(); // Stops the form from refreshing
        submitButton.click(); // Triggers the submit button's event
    }
});



newChat.addEventListener("click", ()=>{
    wall.classList.toggle("hider");
    former.classList.toggle("unslider");
    wall.style.display = "flex";
    former.style.display = "flex";
    submit = false;
    
    q1.classList.remove("hidden");
    q1.style.display = 'flex';
    

    
    q2.style.display = 'none';
    q2.classList.add("hidden");

});

let close = document.getElementById("close");

close.addEventListener("click", ()=> {
    wall.classList.toggle("hider");
    former.classList.toggle("unslider");
    submit = false;

    setTimeout(disappear, 600);
});

function disappear(){
    wall.style.display = "none";
    former.style.display = "none";
}






function inputHandleFunction(){

    const newInputGroup = document.createElement("div");
    newInputGroup.className = "input-group";
    newInputGroup.innerHTML = `<input type="text" name="username" placeholder="Enter username"><button type="button" class="deleteInput"><i class="fa-solid fa-trash"></i></button>`;
    inputContainer.appendChild(newInputGroup);

    const deleteButton = newInputGroup.querySelector(".deleteInput");
    deleteButton.addEventListener("click", () => {
        inputContainer.removeChild(newInputGroup);
    });
    submit = false;
}




function handleSubmit(){

    if(!clicked){
        const inputs = document.querySelectorAll("input[name='username']");
        const values = Array.from(inputs).map(input => input.value);
        submit = true;

        for(let i =0; i<values.length; i++){
            if(values[i] == ""){
                values.splice(i, 1);
            }
        }
        usernames = values;

        for(let i = 0; i<values.length;i++){
            checkUserNames(values[i]);
        }

        clicked = true;
    }
    
}


function handleSubmit2(){
    if(!clicked){
        if(gcName.value != ""){

            if(!created){
                createChat();
    
            }
    
    
    
    
    
    
    
    
    
    
    
    
        }

        clicked = true;
    }
}





async function createChat(){
    let acceptedArr = [];
    let readArr = [];
    let typingArr = [];

    for(let i = 0; i < usernames.length; i++){
        acceptedArr.push(0);
        readArr.push(0);
        typingArr.push(false);
    }
    typingArr.push(false);
   
    readArr.push(0);


    const { data, error } = await db.from('Chats').insert([
    {
        members: usernames,
        groupchat: true,
        title: gcName.value,
        host: window.localStorage.getItem("userIdentify"),
        accepted: acceptedArr,
        read: readArr,
        typing: typingArr,
    }
    ]);

    if (error) {
    
        details = error.details;
        errorMessage.textContent = details;
        errorMessage.style.display = "block";



    }else{
        wall.classList.toggle("hider");
        former.classList.toggle("unslider");
        submit = false;

        setTimeout(disappear, 600);
    }

    created = true;
    clicked = false;

}


async function createMessage(){
    
    
   



    const { data, error } = await db.from('Chats').insert([
    {
        members: usernames,
        groupchat: false,
       
        host: window.localStorage.getItem("userIdentify"),
        accepted: [0],
        read: [0, 0],
        typing: [false, false],
    }
    ]);

    if (error) {
    
        details = error.details;
        errorMessage.textContent = details;
        errorMessage.style.display = "block";



    }else{
        wall.classList.toggle("hider");
        former.classList.toggle("unslider");
        submit = false;

        setTimeout(disappear, 600);
    }
}


async function checkUserNames(value){
    const { data, error } = await db
        .from('Users')
        .select('username')
        .eq('username', value);

    if (error) {
        console.error('Error fetching data:', error);
        return null;
    }
   
    
    if(data.length == 0){
        correct= false;
    }
   
    if(submit){
        setTimeout(validate, 50);
        submit = false;
    }


}


function validate(){
    if(correct){

        let inputs = document.querySelectorAll("[name='username']");


        for(let i = 0; i< inputs.length; i++){
            inputs[i].value = '';

        }
        errorMessage.textContent = "";
        errorMessage.style.display = "none";
        q1.classList.add("hidden");
        q1.style.display = 'none';   
        if(usernames.length > 1){
            q2.classList.remove("hidden");
            q2.style.display = 'flex';
            clicked=false;
        }else{
            if(!created){
                createMessage();
                created = true;
                clicked = false;
            }
           
        }       
    }else{
        errorMessage.textContent = "Invalid Username";
        errorMessage.style.display = "block";
    }


    correct = true;
    submit = false;
}