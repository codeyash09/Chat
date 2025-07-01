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
let newChat2 = document.getElementById("newChatBtn2");
let wall = document.getElementById("blurWall");
let former = document.getElementById("form");
const inputContainer = document.getElementById("inputs");
let correct = true;
let submit = false;
const errorMessage = document.getElementById("emailErrorMessage");
let q1 = document.getElementById("q1");
let q2 = document.getElementById("q2");
let users = document.getElementById("users");
let gcName = document.getElementById("gcname");
let usernames;
let clicked = false;
let created = false;

// Chat type selection elements
let friendBtn = document.getElementById("friendBtn");
let groupBtn = document.getElementById("groupBtn");

// Add event listeners for chat type selection
friendBtn.addEventListener("click", () => {
    friendBtn.classList.add("selected");
    groupBtn.classList.remove("selected");
    
    // Expand modal first
    expandModal();
    
    // Show users section for direct message
    q1.style.display = 'none';
    q1.classList.add("hidden");
    users.style.display = 'flex';
    users.classList.remove("hidden");
    q2.style.display = 'none';
    q2.classList.add("hidden");
});

groupBtn.addEventListener("click", () => {
    groupBtn.classList.add("selected");
    friendBtn.classList.remove("selected");
    
    // Expand modal first
    expandModal();
    
    // Show group creation section
    q1.style.display = 'none';
    q1.classList.add("hidden");
    users.style.display = 'none';
    users.classList.add("hidden");
    q2.style.display = 'flex';
    q2.classList.remove("hidden");
});

// Back button functionality
let backToTypes = document.getElementById("backToTypes");
let backToTypes2 = document.getElementById("backToTypes2");

// Swipe functionality
let handle = document.getElementById("handle");
let modal = document.getElementById("form");
let isExpanded = false;

// Touch/swipe functionality
let startY = 0;
let currentY = 0;
let isDragging = false;

handle.addEventListener("mousedown", startDrag);
handle.addEventListener("touchstart", startDrag);

document.addEventListener("mousemove", drag);
document.addEventListener("touchmove", drag);

document.addEventListener("mouseup", endDrag);
document.addEventListener("touchend", endDrag);

function startDrag(e) {
    isDragging = true;
    startY = e.type === "mousedown" ? e.clientY : e.touches[0].clientY;
    currentY = startY;
    e.preventDefault();
}

function drag(e) {
    if (!isDragging) return;
    
    currentY = e.type === "mousemove" ? e.clientY : e.touches[0].clientY;
    const deltaY = startY - currentY;
    
    if (deltaY > 30 && !isExpanded) {
        // Swipe up - expand
        expandModal();
    } else if (deltaY < -30 && isExpanded) {
        // Swipe down - collapse
        collapseModal();
    }
}

function endDrag() {
    isDragging = false;
}

function expandModal() {
    modal.classList.add("expanded");
    isExpanded = true;
}

function collapseModal() {
    modal.classList.remove("expanded");
    isExpanded = false;
}

// Click handle to expand
handle.addEventListener("click", () => {
    if (!isExpanded) {
        expandModal();
    }
});

backToTypes.addEventListener("click", () => {
    // Collapse modal first
    collapseModal();
    
    // Go back to chat type selection
    q1.style.display = 'flex';
    q1.classList.remove("hidden");
    users.style.display = 'none';
    users.classList.add("hidden");
    q2.style.display = 'none';
    q2.classList.add("hidden");
    
    // Clear inputs
    const inputs = document.querySelectorAll("input[name='username']");
    inputs.forEach(input => input.value = '');
    
    // Remove extra input groups (keep only the first one)
    const inputGroups = inputContainer.querySelectorAll(".input-group");
    for (let i = 1; i < inputGroups.length; i++) {
        inputContainer.removeChild(inputGroups[i]);
    }
});

backToTypes2.addEventListener("click", () => {
    // Collapse modal first
    collapseModal();
    
    // Go back to chat type selection
    q1.style.display = 'flex';
    q1.classList.remove("hidden");
    users.style.display = 'none';
    users.classList.add("hidden");
    q2.style.display = 'none';
    q2.classList.add("hidden");
    
    // Clear group name
    if (gcName) gcName.value = '';
});


inputContainer.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        event.preventDefault(); // Stops the form from refreshing
        submitButton.click(); // Triggers the submit button's event
    }
});



newChat.addEventListener("click", ()=>{
    wall.style.display = "flex";
    former.style.display = "flex";
    submit = false;
    
    // Ensure modal starts in collapsed state
    collapseModal();
    
    // Ensure chat type selector is visible
    if (q1) {
        q1.style.display = 'flex';
        q1.classList.remove("hidden");
        q1.style.visibility = 'visible';
    }
    
    // Hide other sections
    if (users) {
        users.style.display = 'none';
        users.classList.add("hidden");
    }
    if (q2) {
        q2.style.display = 'none';
        q2.classList.add("hidden");
    }

    // Reset selections
    if (friendBtn) friendBtn.classList.remove("selected");
    if (groupBtn) groupBtn.classList.remove("selected");
});

newChat2.addEventListener("click", ()=>{
    wall.style.display = "flex";
    former.style.display = "flex";
    submit = false;
    
    // Ensure modal starts in collapsed state
    collapseModal();
    
    // Ensure chat type selector is visible
    if (q1) {
        q1.style.display = 'flex';
        q1.classList.remove("hidden");
        q1.style.visibility = 'visible';
    }
    
    // Hide other sections
    if (users) {
        users.style.display = 'none';
        users.classList.add("hidden");
    }
    if (q2) {
        q2.style.display = 'none';
        q2.classList.add("hidden");
    }

    // Reset selections
    if (friendBtn) friendBtn.classList.remove("selected");
    groupBtn.classList.remove("selected");
});

let close = document.getElementById("close");

close.addEventListener("click", ()=> {
    submit = false;
    disappear();
});

function disappear(){
    wall.style.display = "none";
    former.style.display = "none";
    
    // Reset modal state
    collapseModal();
    
    // Reset all sections
    q1.style.display = 'none';
    q1.classList.add("hidden");
    users.style.display = 'none';
    users.classList.add("hidden");
    q2.style.display = 'none';
    q2.classList.add("hidden");
    
    // Clear inputs
    const inputs = document.querySelectorAll("input[name='username']");
    inputs.forEach(input => input.value = '');
    if (gcName) gcName.value = '';
    
    // Remove extra input groups (keep only the first one)
    const inputGroups = inputContainer.querySelectorAll(".input-group");
    for (let i = 1; i < inputGroups.length; i++) {
        inputContainer.removeChild(inputGroups[i]);
    }
    
    // Reset selections
    friendBtn.classList.remove("selected");
    groupBtn.classList.remove("selected");
    
    // Hide error message
    errorMessage.classList.remove("show");
}






function inputHandleFunction(){

    const newInputGroup = document.createElement("div");
    newInputGroup.className = "input-group";
    newInputGroup.innerHTML = `
        <input type="text" name="username" placeholder="Enter username or phone number">
        <button type="button" class="deleteInput">
            <i class="fa-solid fa-trash"></i>
        </button>
    `;
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

// Fetch full user profile (name, username, birthday) by userId
export async function fetchUserProfile(userId) {
  const { data, error } = await db
    .from('Users')
    .select('name, username, birthday')
    .eq('id', userId);

  if (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }

  return data && data[0] ? data[0] : null;
}