// for(let i = 0; i< inputs.length; i++){
//     inputs[i].value = '';
// }



let db = supabase.createClient(
    'https://pmfrislowxhopnexusxa.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBtZnJpc2xvd3hob3BuZXh1c3hhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODk4NjExMSwiZXhwIjoyMDY0NTYyMTExfQ.TTYNG0O0nTFqS8QPimAqhC-uqmNs65Aaml1kqAtYeTQ'
);

export {db};
let correct = true;

let userId = window.localStorage.getItem("userIdentify");
document.getElementById("emailErrorMessage").style.display = 'none';


if(userId == null || userId == "null"){
    window.location.replace('/pages/signup.html');
}
async function fetchUser() {
  const { data, error } = await db
    .from('Users')
    .select('username')
    .eq('id', userId);

  if (error) {
    console.error('Error fetching data:', error);
    return null;
  }

  return data;
}
let username = (await fetchUser())[0].username;

async function fetchName(myUsername) {
  const { data, error } = await db
    .from('Users')
    .select('name')
    .eq('username', myUsername);

  if (error) {
    console.error('Error fetching data:', error);
    return null;
  }

  return data;
}
async function fetchNames(iden) {
  const { data, error } = await db
    .from('Users')
    .select('name')
    .eq('id', iden);

  if (error) {
    console.error('Error fetching data:', error);
    return null;
  }

  return data;
}

async function fetchUsers(iden) {
  const { data, error } = await db
    .from('Users')
    .select('username')
    .eq('id', iden);

  if (error) {
    console.error('Error fetching data:', error);
    return null;
  }

  return data;
}
let createBtn = document.getElementById('newChatBtn');
createBtn.addEventListener("click", await newChat);
let createBtn2 = document.getElementById('newChatBtn2');
createBtn2.addEventListener("click", await newChat);

async function newChat(){

    let set = document.getElementById("blurWall");
    set.style.display = "flex";

    let updatedMembers = [];
    let menu = set.querySelector(".members");
    menu.innerHTML = "";
    let length = updatedMembers.filter(str => str.trim() !== '').length;

    length = updatedMembers.filter(str => str.trim() !== '').length;



    let newUser = document.createElement("button");
    newUser.classList.add("actBtn");
    newUser.id = "newUserBtn";
    newUser.innerHTML = "<i class='fa-solid fa-plus'></i>";

    newUser.addEventListener("click", ()=>{

        let member = document.createElement("div");
        member.classList.add("member");
        let name = document.createElement("input");
        name.classList.add("name");
        name.placeholder = "Enter username here...";


        let actions = document.createElement("div");
        actions.classList.add("actions");

        // let hostBtn = document.createElement("button");
        // hostBtn.classList.add("actBtn");
        // hostBtn.id = "hostBtn";
        // hostBtn.innerHTML = "<h2>Host</h2>";
        let deleteBtn = document.createElement("button");
        deleteBtn.classList.add("actBtn");
        deleteBtn.id = "deleteBtn";
        deleteBtn.innerHTML = "<i class='fa-solid fa-trash'></i>";
        updatedMembers.push(name.value);
    
        let i = updatedMembers.length - 1;
        console.log(updatedMembers);


        deleteBtn.addEventListener("click", async(e)=>{

            updatedMembers.splice(i, 1);
            console.log(updatedMembers);

            length = updatedMembers.filter(str => str.trim() !== '').length;
        
            
            deleteBtn.parentElement.parentElement.remove();

            if(length >= 2){
                document.getElementById("chatTile").readOnly = false;

            }else if(length == 0){
                document.getElementById("chatTile").value = "@" + username;
            }else{
                document.getElementById("chatTile").value = "@" + updatedMembers.filter(str => str.trim() !== '')[0];


            }
        })
        name.addEventListener("input", async()=>{
            
            length = updatedMembers.filter(str => str.trim() !== '').length;
            correct = true;
            updatedMembers[i] = name.value;
            
            
            if(length >= 2){
                document.getElementById("chatTile").readOnly = false;

            }else if(length == 0){
                document.getElementById("chatTile").value = "@" + username;
            }else{
                

                document.getElementById("chatTile").value = "@" + updatedMembers.filter(str => str.trim() !== '')[0];


            }
            
        })

        member.appendChild(name);
        member.appendChild(actions);
        // actions.appendChild(hostBtn);
        actions.appendChild(deleteBtn);
        menu.insertBefore(member,menu.lastElementChild);
    })


    menu.appendChild(newUser);

    let currentChoice = set.querySelector(`#casualc`);
    currentChoice.classList.add("current");

    let current = 'casual';
    for(let i = 0; i < set.querySelectorAll('.choice').length; i++){
        set.querySelectorAll('.choice')[i].addEventListener("click", ()=>{
        
            set.querySelector('.current').classList.remove('current');
            set.querySelectorAll('.choice')[i].classList.add('current');
            current = set.querySelectorAll('.choice')[i].id.slice(0,-1);
        })
    }
    console.log(length);

    if(length >= 2){
        document.getElementById("chatTile").readOnly = false;
        
        


    }else if(length == 0){
        document.getElementById("chatTile").value = "@" + username;
    }
    else{
        document.getElementById("chatTile").value = "@" + updatedMembers.filter(str => str.trim() !== '')[0];

        

    }



    let saveBtn = document.getElementById("createBtn");
    
    saveBtn.addEventListener("click", async()=>{
        let finalMembers = updatedMembers.filter(str => str.trim() !== '');
        console.log(finalMembers);
        
        let results = await Promise.all(finalMembers.map(checkUserNames));
        let allExist = results.every(Boolean);

        if(allExist){
            let updatedRead = [];
            let updatedTyping = [];
            let updatedAccepted = [];
            for(let i = 0; i< finalMembers.length; i++){
                updatedRead.push(0);
                updatedTyping.push(false);
                updatedAccepted.push(0);
            }
            
            updatedRead.push(0);
            updatedTyping.push(false);


            if(finalMembers.length >= 2){
                const { data, error } = await db.from('Chats').insert([
                {
                    'members': finalMembers,
                    'groupchat': true,
                    'title': document.getElementById("chatTile").value,
                    'host': window.localStorage.getItem("userIdentify"),
                    'accepted': updatedAccepted,
                    'read': updatedRead,
                    'typing': updatedTyping,
                    'chatType': current,
                }
                ]);

                

                
            }else{
            const { data, error } = await db.from('Chats').insert([
                {
                    'members': finalMembers,
                    'groupchat': false,
                
                    'host': window.localStorage.getItem("userIdentify"),
                    'accepted': updatedAccepted,
                    'read': updatedRead,
                    'typing': updatedTyping,
                    'chatType': current,
                }
                ]);
            }
            
            set.style.display = 'none';

        }else{
            document.getElementById("emailErrorMessage").style.display = 'flex';

            document.getElementById("emailErrorMessage").innerHTML = 'Error: Not All Users Exist';
        }
    })

}




// Fetch full user profile (name, username, birthday) by userId
export async function fetchUserProfile(userId) {
  const { data, error } = await db
    .from('Users')
    .select('name, username, birthday, pfp')
    .eq('id', userId);

  if (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }

  return data && data[0] ? data[0] : null;
}

async function checkUserNames(value) {
  const { data, error } = await db
    .from('Users')
    .select('username')
    .eq('username', value);

  if (error) {
    console.error('Error fetching data:', error);
    return false;
  }

  return data.length > 0;
}