// Chat context menu functionality
let contextMenu = null;
import {currentChat, messages, sendlers, timers, fetchChat } from "/scripts/chats.js";
import {db} from '/scripts/createChat.js';

let userId = window.localStorage.getItem("userIdentify");
let username = fetchUser();

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

username
  .then(result => {

    if (result && result.length > 0) {

      const userObject = result[0];
      
     
      username = userObject.username;
      

    } 
  })
  .catch(error => {
    
    console.error("An error occurred:", error);
  });

function createContextMenu() {
    // Remove existing context menu if any
    if (contextMenu) {
        document.body.removeChild(contextMenu);
    }

    // Create new context menu
    contextMenu = document.createElement('div');
    contextMenu.className = 'chat-context-menu';
    contextMenu.style.display = 'none';
    contextMenu.style.position = 'fixed';
    contextMenu.style.zIndex = '1000';
    contextMenu.style.touchAction = 'none';

    // Add menu items
    const menuItems = [
        { text: 'Chat Settings', icon: 'fa-gear', action: 'settings' },
        { text: 'Mute Notifications', icon: 'fa-bell-slash', action: 'mute' },
        { text: 'Clear Chat', icon: 'fa-trash', action: 'clear' },
        { text: 'Leave Chat', icon: 'fa-right-from-bracket', action: 'leave' }
    ];

    menuItems.forEach(item => {
        const menuItem = document.createElement('div');
        menuItem.className = 'context-menu-item';
        menuItem.innerHTML = `
            <i class="fa-solid ${item.icon}"></i>
            <span>${item.text}</span>
        `;

        menuItem.addEventListener('click', () => {
            handleContextMenuAction(item.action);
            hideContextMenu();
        });

        

        menuItem.addEventListener('touchmove', (e) => {
            e.preventDefault();
        }, { passive: false });

        contextMenu.appendChild(menuItem);
    });



    contextMenu.addEventListener('touchmove', (e) => {
        e.preventDefault();
    }, { passive: false });

    document.body.appendChild(contextMenu);
}

async function showContextMenu(event, chatId) {
    event.preventDefault();


    
    if (!contextMenu) {
        createContextMenu();
    }
   
    // Store the chat ID for the menu actions
    contextMenu.dataset.chatId = chatId;

    // Show the menu first to calculate its dimensions
    contextMenu.style.display = 'block';
    const menuRect = contextMenu.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;

    // Calculate position with larger boundary padding
    let left = event.pageX;
    let top = event.pageY;
    const boundaryPadding = 30; // Increased from 10 to 30

    // If menu would overflow right edge, position it to the left of the cursor
    if (left + menuRect.width > viewportWidth - boundaryPadding) {
        left = Math.max(boundaryPadding, event.pageX - menuRect.width);
    }

    // If menu would overflow bottom edge, position it above the cursor
    if (top + menuRect.height > viewportHeight - boundaryPadding) {
        top = Math.max(boundaryPadding, event.pageY - menuRect.height);
    }

    // If menu would overflow left edge, ensure it's at least boundaryPadding from the left
    if (left < boundaryPadding) {
        left = boundaryPadding;
    }

    // If menu would overflow top edge, ensure it's at least boundaryPadding from the top
    if (top < boundaryPadding) {
        top = boundaryPadding;
    }

    // Apply the calculated position
    contextMenu.style.left = `${left}px`;
    contextMenu.style.top = `${top}px`;
}

function hideContextMenu() {
    if (contextMenu) {
        contextMenu.style.display = 'none';
    }
}

document.getElementById("closerbtn").addEventListener("click", ()=>{
    let set = document.getElementById("chatSettings");
    set.style.display = "none";
})
let correct = true;

async function handleContextMenuAction(action) {
    const chatId = contextMenu.dataset.chatId;
    
    switch (action) {
        case 'settings':
            let deletedMembers = [];
            let newMembers = [];
            let updatedMembers = [];
            let set = document.getElementById("chatSettings");
            set.style.display = "flex";
            let chats = (await fetchChat(chatId))[0];
            set.querySelector("#hsot").innerHTML = "Host: " + (await fetchNames(chats.host))[0].name + " (@" + (await fetchUsers(chats.host))[0].username + ")";
            let menu = set.querySelector(".members");
            menu.innerHTML = "";
            let length = updatedMembers.filter(str => str.trim() !== '').length;
            for(let i = 0; i < chats.members.length; i++){
                

                let member = document.createElement("div");
                member.classList.add("member");
                let name = document.createElement("h3");
                name.classList.add("name");
                name.innerHTML = (await fetchName(chats.members[i]))[0].name + " (@" + chats.members[i] + ")";
                updatedMembers.push(chats.members[i]);

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
                deleteBtn.addEventListener("click", async(e)=>{
                    console.log(updatedMembers);

                    updatedMembers.splice(i, 1);
                    length = updatedMembers.filter(str => str.trim() !== '').length;
                    deletedMembers.push(chats.members[i]);
                   deleteBtn.parentElement.parentElement.remove();

                    if(length >= 2){
                        document.getElementById("chatTitle").readOnly = false;

                    }else if(length == 0){
                        document.getElementById("chatTitle").value = "@" + username;
                    }else{
                        if(chats.host == "" + userId){
                            
                            document.getElementById("chatTitle").value = "@" + updatedMembers.filter(str => str.trim() !== '')[0];
                            document.getElementById("chatTitle").readOnly = true;


                        }else{
                            document.getElementById("chatTitle").value = "@" + (await fetchUsers(chats.host));
                            document.getElementById("chatTitle").readOnly = true;

                        }

                    }

                })


                member.appendChild(name);
                member.appendChild(actions);
                // actions.appendChild(hostBtn);
                actions.appendChild(deleteBtn);
                menu.appendChild(member);
            }

            length = updatedMembers.filter(str => str.trim() !== '').length;

            
            console.log(updatedMembers);
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
                newMembers.push(name.value);
                let i = updatedMembers.length - 1;
                console.log(updatedMembers);


                deleteBtn.addEventListener("click", async(e)=>{

                   updatedMembers.splice(i, 1);
                    console.log(updatedMembers);

                    length = updatedMembers.filter(str => str.trim() !== '').length;
               
                    
                   deleteBtn.parentElement.parentElement.remove();

                   if(length >= 2){
                        document.getElementById("chatTitle").readOnly = false;

                    }else if(length == 0){
                        document.getElementById("chatTitle").value = "@" + username;
                    }else{
                        if(chats.host == "" + userId){
                            
                            document.getElementById("chatTitle").value = "@" + updatedMembers.filter(str => str.trim() !== '')[0];
                            document.getElementById("chatTitle").readOnly = true;


                        }else{
                            document.getElementById("chatTitle").value = "@" + (await fetchUsers(chats.host));
                            document.getElementById("chatTitle").readOnly = true;

                        }

                    }
                })
                name.addEventListener("input", async()=>{
                    length = updatedMembers.filter(str => str.trim() !== '').length;
                    correct = true;
                    updatedMembers[i] = name.value;
                    newMembers[i] = name.value;
                    
                    if(length >= 2){
                        document.getElementById("chatTitle").readOnly = false;

                    }else if(length == 0){
                        document.getElementById("chatTitle").value = "@" + username;
                    }else{
                        

                        if(chats.host == "" + userId){
                            
                            document.getElementById("chatTitle").value = "@" + updatedMembers.filter(str => str.trim() !== '')[0];
                            document.getElementById("chatTitle").readOnly = true;


                        }else{
                            document.getElementById("chatTitle").value = "@" + (await fetchUsers(chats.host));
                            document.getElementById("chatTitle").readOnly = true;

                        }

                    }
                    
                })

                member.appendChild(name);
                member.appendChild(actions);
                // actions.appendChild(hostBtn);
                actions.appendChild(deleteBtn);
                menu.insertBefore(member,menu.lastElementChild);
            })
        

            menu.appendChild(newUser);

            let currentChoice = set.querySelector(`#${chats.chatType}`);
            currentChoice.classList.add("current");
            let current = chats.chatType;
            for(let i = 0; i < set.querySelectorAll('.choice').length; i++){
                set.querySelectorAll('.choice')[i].addEventListener("click", ()=>{
                    set.querySelector('.current').classList.remove('current');
                    set.querySelectorAll('.choice')[i].classList.add('current');
                    current = set.querySelectorAll('.choice')[i].id;
                })
            }
            console.log(length);
        
            if(length >= 2){
                document.getElementById("chatTitle").readOnly = false;
                document.getElementById("chatTitle").value = chats.title;
                


            }else if(length == 0){
                document.getElementById("chatTitle").value = "@" + username;
            }
            else{
                if(chats.host == "" + userId){
                    
                    document.getElementById("chatTitle").value = "@" + updatedMembers.filter(str => str.trim() !== '')[0];
                    document.getElementById("chatTitle").readOnly = true;


                }else{
                    document.getElementById("chatTitle").value = "@" + (await fetchUsers(chats.host));
                    document.getElementById("chatTitle").readOnly = true;

                }

            }



            let saveBtn = document.getElementById("saveBtn");
            saveBtn.addEventListener("click", async()=>{
                let finalMembers = updatedMembers.filter(str => str.trim() !== '');
                let correct = true;
                await Promise.all(finalMembers.map(username => checkUserNames(username)));

                if(correct){
                    let updatedRead = [];
                    let updatedTyping = [];
                    let updatedAccepted = [];
                    updatedRead.push(...chats.read);
                    updatedTyping.push(...chats.typing);
                    updatedAccepted.push(...chats.accepted);
                    for(let i = 0; i < deletedMembers.length; i++){
                        updatedRead.splice(chats.members.indexOf(deletedMembers[i]),1);
                        updatedTyping.splice(chats.members.indexOf(deletedMembers[i]),1);
                        updatedAccepted.splice(chats.members.indexOf(deletedMembers[i]),1);
                    }

                    for(let i = 0; i < newMembers.filter(str => str.trim() !== '').length; i ++){
                        updatedRead.splice(updatedRead.length - 1, 0, chats.messages.length);
                        updatedTyping.splice(updatedTyping.length, 0, false);
                        updatedAccepted.splice(updatedAccepted.length, 0, 0);
                        

                        

                    }

                    if(finalMembers.length >= 2){
                        console.log("hi");

                        const { data, error } = await db
                            .from('Chats') 
                            .update({'members': finalMembers, 'read': updatedRead, 'accepted': updatedAccepted, 'typing': updatedTyping, 'chatType': current, 'groupchat': true, 'title': document.getElementById("chatTitle").value}) 
                            .eq('chat_id', chatId); 
                    }else{
                        const { data, error } = await db
                            .from('Chats') 
                            .update({'members': finalMembers, 'read': updatedRead, 'accepted': updatedAccepted, 'typing': updatedTyping, 'chatType': current, 'groupchat': false,}) 
                            .eq('chat_id', chatId);
                    }
                    
                    set.style.display = 'none';

                }else{
                    document.getElementById("error").innerHTML = 'Error: Not All Users Exist';
                }
            })
            break;
        case 'mute':
            // TODO: Implement mute notifications
            console.log('Muting notifications for chat:', chatId);
            break;
        case 'clear':
            let newMess = messages;

            for(let i = 0; i < messages.length; i++){
                newMess[i] += "<deleted for='" + username + "' style='display:none'></deleted>";
            }

            const { data, error } = await db
                .from('Chats') 
                .update({messages: newMess}) 
                .eq('chat_id', chatId); 
            
            break;
        case 'leave':
            let chat = await fetchChat(chatId);
          
            chat = chat[0];

            if(chat.members.includes(username)){

                let updatedAccept = chat.accepted;
                
                updatedAccept.splice(chat.members.indexOf(username),1);
        
                let updatedMembers = chat.members;

                updatedMembers.splice(chat.members.indexOf(username),1);

                let updatedRead = chat.read;

                updatedRead.splice(chat.members.indexOf(username),1);

                let updatedTyping = chat.typing;

                updatedTyping.splice(chat.members.indexOf(username) + 1,1);

                const { error: updateError } = await db
                    .from("Chats")
                    .update({ accepted: updatedAccept, members: updatedMembers, read: updatedRead, typing: updatedTyping })
                    .eq("chat_id", chatId);

                if (updateError) {
                    console.error("Error updating chat:", updateError);
                    return;
                }
            }else{
                alert("As the host, you may not leave this chat without appointing another host");
            }
            
            

            break;
    }
}


// Close context menu when clicking outside
document.addEventListener('click', (event) => {
    contextMenu = document.querySelector('.chat-context-menu'); 
    if (contextMenu && !contextMenu.contains(event.target)) {
        hideContextMenu();
    }
});
// Close context menu when clicking outside
document.addEventListener('focus', (event) => {
    contextMenu = document.querySelector('.chat-context-menu'); 

    if (contextMenu && !contextMenu.contains(event.target)) {
        hideContextMenu();
    }
});

document.querySelector(".homeBtn").addEventListener('click', (event) => {
    contextMenu = document.querySelector('.chat-context-menu'); 

    if (contextMenu && !contextMenu.contains(event.target)) {
        hideContextMenu();
    }
});




// Prevent context menu from showing on right-click of the menu itself
document.addEventListener('contextmenu', (event) => {
    if (contextMenu && contextMenu.contains(event.target)) {
        event.preventDefault();
    }
});

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
   
    


}

export { showContextMenu }; 