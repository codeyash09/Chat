import {db} from '/scripts/createChat.js';
import { showContextMenu } from '/scripts/chatContextMenu.js';




let count = 0;
let read = 10;
let totalRead = 0;

let userId = window.localStorage.getItem("userIdentify");


if(userId == null || userId == "null"){
    window.location.replace('/pages/signup.html');
}


let chatMess = document.getElementById("chat-messages")
let chatList = document.getElementById("pageList");
let chatHeader = document.getElementById("chat-header");
let chatInput = document.getElementById("chatInput");

let displayTypingBool = false;
let newpayload;
let chatOpened = false;
let chatsSys;
let rowSys;
let oldCurrent;
let savedScrollPosition;
let username;
let messages;
let sendlers;
let timers;
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

let currentChat;



async function fetchUsers(id) {
    const { data, error } = await db
      .from('Users')
      .select('username')
      .eq('id', id);
  
    if (error) {
      console.error('Error fetching data:', error);
      return null;
    }
  
    return data;
}


username = fetchUser();
username.then(result =>{
    if(result[0] != undefined){
        username = result[0].username;
        
        showChats();

    }
});


async function showChats() {

    totalRead = 0;
    const { data, error } = await db
        .from('Chats')
        .select('*')
        .or(`members.cs.{"${username}"},host.eq."${userId}"`);

    if (error || !data || data.length === 0) {
        console.error("No chats found or error fetching chats:", error);
        return;
    }

   
    const sortedChats = data.sort((a, b) => {
        let lastA;
        let lastB;

       
        if (a.times && a.times.length > 0) {
            lastA = a.times.at(-1);
        } else {
            lastA = null;
        }

        if (b.times && b.times.length > 0) {
            lastB = b.times.at(-1);
        } else {
            lastB = null;
        }

       
        if (lastA === null && lastB === null) {
            return 0; 
        }

        if (lastA === null) {
            return 1;
        }

        if (lastB === null) {
            return -1; 
        }

        return new Date(lastB) - new Date(lastA); 
    });

    
    let prevOrder;
    if (rowSys && rowSys.length > 0) {
        prevOrder = rowSys.map(c => c.chat_id);
    } else {
        prevOrder = [];
    }
    rowSys = sortedChats;

  
    savedScrollPosition = chatMess.scrollTop;

  
    const existingChatIds = new Set(Array.from(chatList.children).map(el => el.getAttribute("data-chat-id")));
    for (const chat of sortedChats) {
        let tab = document.querySelector(`.pages-list a[data-chat-id='${chat.chat_id}']`);
        let userNum = ("" + userId === chat.host) ? chat.members.length : chat.members.indexOf(username);
        let readNum = chat.read[userNum];
        if (!tab) {
            tab = document.createElement("a");
            tab.setAttribute("data-chat-id", chat.chat_id);
            if (chat.groupchat) {
                tab.innerHTML = chat.title;
            } else {
                if (chat.host === "" + userId) {
                    tab.innerHTML = chat.members[0];
                } else {
                    let hoster = await fetchUsers(chat.host);
                    if (hoster[0]) {
                        tab.innerHTML = hoster[0].username;
                    }
                }
            }
            tab.addEventListener("click", () => openChat(chat.chat_id));
            tab.addEventListener("contextmenu", (event) => showContextMenu(event, chat.chat_id));
            chatList.appendChild(tab);
        }
        
        const existingBadge = tab.querySelector('.read-notification');
        if (readNum > 0) {
            if (existingBadge) {
                existingBadge.textContent = readNum;
            } else {
                tab.innerHTML += ` <span class='read-notification'>${readNum}</span>`;
            }
            totalRead += readNum;
        } else if (existingBadge) {
            existingBadge.remove();
        }
    }
    
    for (const element of Array.from(chatList.children)) {
        const chatId = element.getAttribute("data-chat-id");
        if (!sortedChats.some(chat => chat.chat_id === chatId)) {
            chatList.removeChild(element);
        }
    }
    
    if (sortedChats.length > 0) {
        const mostRecentId = sortedChats[0].chat_id;
        const tab = document.querySelector(`.pages-list a[data-chat-id='${mostRecentId}']`);
        if (tab && tab.parentNode.firstChild !== tab) {
            tab.style.transform = 'scale(1.05)';
            tab.style.opacity = '0.7';
            setTimeout(() => {
                tab.style.transform = '';
                tab.style.opacity = '';
                tab.parentNode.insertBefore(tab, tab.parentNode.firstChild);
            }, 150);
        }
    }
    
    if (currentChat) {
        document.querySelectorAll('a[data-chat-id]').forEach(element => {
            element.classList.remove("currentTab");
        });
        const currentElement = document.querySelector(`a[data-chat-id="${currentChat}"]`);
        if (currentElement) {
            currentElement.classList.add("currentTab");
        }
    }
    openChat(sortedChats[0].chat_id);
    setTimeout(() => {
        chatMess.scrollTop = savedScrollPosition;
    }, 0);
}





async function fetchChat(id) {
    const { data, error } = await db
      .from('Chats')
      .select('*')
      .eq('chat_id', id);
  
    if (error) {
      console.error('Error fetching data:', error);
      return null;
    }
   
    return data;
}


const sendButton = document.querySelector(".fa-paper-plane");
const messageInput = document.querySelector(".chat-input input");

messageInput.addEventListener("keydown", async function(event) {
    if (event.key === "Enter") {
        const messageText = messageInput.value.trim();
        if (!messageText) return; 

        const chatId = currentChat; 
        const sender = username; 
        const timestamp = new Date().toISOString();

        try {

            const { data, error } = await db
                .from("Chats")
                .select("*")
                .eq("chat_id", chatId)
                .single();

            if (error || !data) {
                console.error("Failed to fetch chat:", error ?? "Chat not found");
                return;
            }

            const updatedMessages = Array.isArray(data.messages) ? [...data.messages, messageText] : [messageText];
            const updatedTimes = Array.isArray(data.times) ? [...data.times, timestamp] : [timestamp];
            const updatedSenders = Array.isArray(data.senders) ? [...data.senders, sender] : [sender];
            
            
            let updatedRead = [];



            updatedRead = data.read.map(Number);

            if(Array.isArray(data.read)){
                if("" + userId + "" == data.host){
                    for(let i = 0; i<data.members.length; i++){
                        if(data.members[i] != "" + username + ""){  
                            updatedRead[i]++;
                        }   
                    }
                }else{
                    for(let i = 0; i<data.members.length; i++){
                        if(data.members[i] != "" + username + ""){  
                            updatedRead[i]++;
                        }   
                    }
                    updatedRead[data.members.length]++;
                }
                
            }else{
                console.log("Errenous read");
            }



    

            const { error: updateError } = await db
                .from("Chats")
                .update({ messages: updatedMessages, times: updatedTimes, senders: updatedSenders, read: updatedRead })
                .eq("chat_id", chatId);

            if (updateError) {
                console.error("Error updating chat:", updateError);
                return;
            }

            
            messageInput.value = ""; 

        } catch (err) {
            console.error("Unexpected error:", err);
        }
    }
});

sendButton.addEventListener("click", async () => {
    const messageText = messageInput.value.trim();
    if (!messageText) return; 

    const chatId = currentChat; 
    const sender = username; 
    const timestamp = new Date().toISOString();

    try {

        const { data, error } = await db
            .from("Chats")
            .select("*")
            .eq("chat_id", chatId)
            .single();

        if (error || !data) {
            console.error("Failed to fetch chat:", error ?? "Chat not found");
            return;
        }

        const updatedMessages = Array.isArray(data.messages) ? [...data.messages, messageText] : [messageText];
        const updatedTimes = Array.isArray(data.times) ? [...data.times, timestamp] : [timestamp];
        const updatedSenders = Array.isArray(data.senders) ? [...data.senders, sender] : [sender];
        
        
        let updatedRead = [];



        updatedRead = data.read.map(Number);

        if(Array.isArray(data.read)){
            if("" + userId + "" == data.host){
                for(let i = 0; i<data.members.length; i++){
                    if(data.members[i] != "" + username + ""){  
                        updatedRead[i]++;
                    }   
                }
            }else{
                for(let i = 0; i<data.members.length; i++){
                    if(data.members[i] != "" + username + ""){  
                        updatedRead[i]++;
                    }   
                }
                updatedRead[data.members.length]++;
            }
            
        }



   

        const { error: updateError } = await db
            .from("Chats")
            .update({ messages: updatedMessages, times: updatedTimes, senders: updatedSenders, read: updatedRead })
            .eq("chat_id", chatId);

        if (updateError) {
            console.error("Error updating chat:", updateError);
            return;
        }

        
        messageInput.value = ""; 

    } catch (err) {
        console.error("Unexpected error:", err);
    }

    
});

function convertToLocalTime(centralTime) {
    let date = new Date(centralTime);
    let rn = new Date();
    let daysApart = Math.floor((rn - date) / 86400000); // Direct ms-to-days conversion

    if (daysApart > 6) {
        return date.toLocaleString(undefined, { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    }

    let timeStr = date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
    let dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    let dayDiff = rn.getDay() - date.getDay();

    return dayDiff === 0 ? `Today at ${timeStr}` :
           dayDiff === 1 || (rn.getDay() === 0 && date.getDay() === 6) ? `Yesterday at ${timeStr}` :
           `${dayNames[date.getDay()]} at ${timeStr}`;
}


async function openChat(id) {



    


    currentChat = id;

    document.querySelectorAll('a[data-chat-id]').forEach(element => {
        element.classList.remove("currentTab");
    });
    
    document.querySelector('a[data-chat-id="' + id + '"]').classList.add("currentTab");



    let chat = await fetchChat(id);
    const chatMess = document.querySelector(".chat-messages");
    chatMess.innerHTML = ""; 
    

    chat = chat[0];
    chatsSys = chat;
    


    let userNum;

    if("" + userId + "" == chat.host){
        userNum = chat.members.length;
    }else{
        for(let i = 0; i < chat.members.length; i++){
            if(chat.members[i] == "" + username + ""){
                userNum = i;
            }
        }
    }
    
    let readNum = chat.read[userNum];

    read = readNum;
        

    if(chat.groupchat){
        chatHeader.innerHTML = chat.title;
        chatInput.placeholder = "Message " + chat.title;
    }else{
        if(chat.host == "" + userId + ""){
            chatHeader.innerHTML = chat.members[0];
            chatInput.placeholder = "Message " + chat.members[0];


        }else{
            let hoster = fetchUsers(chat.host);
            hoster.then(result =>{
                if(result[0] != undefined){
                    hoster = result[0].username;
                    
                    chatHeader.innerHTML = hoster;
                    chatInput.placeholder = "Message " + hoster;


                }
            });

        }
    }
   
    for (let i = chat.messages.length - 1; i >= 0; i--) {
        const message = document.createElement("div");
        message.classList.add("message");
        message.setAttribute('data-message-id', i);

        const avatar = document.createElement("div");
        avatar.classList.add("avatar");
        const content = document.createElement("div");
        content.classList.add("content");
        const usernameElement = document.createElement("div");
        usernameElement.classList.add("username");
        usernameElement.innerHTML = chat.senders?.[i] || "Unknown User";
        const text = document.createElement("div");
        text.classList.add("text");
        text.innerHTML = chat.messages?.[i] || "No message";
        const time = document.createElement("div");
        time.classList.add("timestamp");
        time.innerHTML = convertToLocalTime(chat.times[i]);
        const messId = document.createElement("div");
        messId.classList.add("messId");
        messId.innerHTML = i;
        messId.style.display = 'none';

        if (chat.senders[i] === username) {
            message.classList.add("own-message");
        }

        message.appendChild(avatar);
        message.appendChild(content);
        content.appendChild(usernameElement);
        content.appendChild(text);
        content.appendChild(time);
        content.appendChild(messId);

        chatMess.appendChild(message);
    }

    let updatedRead = chat.read;

    if(oldCurrent != currentChat){
        chatMess.scrollTop = chatMess.scrollHeight;
        oldCurrent = currentChat;
        


    }else{
        chatMess.scrollTop = savedScrollPosition;
    
    }

    chatMess.addEventListener("scroll", () => {
        
        const threshold = 100; // Adjust this value to control how close to the bottom is considered "read"
        const atThreshold = chatMess.scrollTop >= -threshold;

        if (atThreshold) {
  


            
            updatedRead[userNum] = 0;
            
            updateRead(updatedRead);



            
            
        }

    });

    const threshold = 100; // Adjust this value to control how close to the bottom is considered "read"
    const atThreshold = chatMess.scrollTop >= -threshold;

    if (atThreshold) {
        
        if(updateRead[userNum] != 0){
            updatedRead[userNum] = 0;
            
            updateRead(updatedRead);
        }
        
        
    }



    messages = chat.messages;
    sendlers = chat.senders;
    timers = chat.times;


    

}


async function updateRead(updatedRead){
    
    let chat = await fetchChat(currentChat);
    
    chat = chat[0];
    let userNum;

    if("" + userId + "" == chat.host){
        userNum = chat.members.length;
    }else{
        for(let i = 0; i < chat.members.length; i++){
            if(chat.members[i] == "" + username + ""){
                userNum = i;
            }
        }
    }


    read = chat.read[userNum];
    if(read > 0){
        const { error: updateError } = await db
            .from("Chats")
            .update({ read: updatedRead })
            .eq("chat_id", currentChat);

        if (updateError) {
            console.error("Error updating chat:", updateError);
            return;
        }
    }

    changeRow();

    
}

let i = 0;

db
    .channel('realtime-changes')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'Chats' }, (payload) => {
        
        changeRow();
    })
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'Chats' }, (payload) => {
       
        if (payload.new.chat_id === currentChat) {
            // If the update is for the currently open chat, re-open it with the new payload
            openChat(currentChat, payload.new);
            displayTypingBool = true;
            newpayload = payload.new;
            setTimeout(()=> {displayTypingBool = false}, 201);
        } else {
            // Otherwise, just refresh the chat list (to update unread counts or order)
            changeRow();
        }
    })
    .subscribe();


async function changeChats(){
    
   
    let chat = await fetchChat(currentChat);

    chat = chat[0];
    

    if(JSON.stringify(chat.messages) != JSON.stringify(chatsSys.messages)){
        openChat(currentChat);
        chatsSys = chat;


        
    }
    
}


async function changeRow() {
    const { data, error } = await db
        .from('Chats')
        .select('*')
        .or(`members.cs.{"${username}"},host.eq."${userId}"`);

    if (error || !data || data.length === 0) {
        console.error("No chats found or error fetching chats:", error);
        return;
    }

    // Sort chats by the most recent message timestamp
    const sortedChats = data.sort((a, b) => {
        const lastMessageTimeA = new Date(a.times?.slice(-1)[0] || 0);
        const lastMessageTimeB = new Date(b.times?.slice(-1)[0] || 0);
        return lastMessageTimeB - lastMessageTimeA;
    });

    // Save the previous order for comparison
    const prevOrder = rowSys ? rowSys.map(c => c.chat_id) : [];
    rowSys = sortedChats;

    // Save scroll position
    savedScrollPosition = chatMess.scrollTop;

    // Update or add chat tabs
    const existingChatIds = new Set(Array.from(chatList.children).map(el => el.getAttribute("data-chat-id")));
    for (const chat of sortedChats) {
        let tab = document.querySelector(`.pages-list a[data-chat-id='${chat.chat_id}']`);
        let userNum = ("" + userId === chat.host) ? chat.members.length : chat.members.indexOf(username);
        let readNum = chat.read[userNum];
        if (!tab) {
            tab = document.createElement("a");
            tab.setAttribute("data-chat-id", chat.chat_id);
            if (chat.groupchat) {
                tab.innerHTML = chat.title;
            } else {
                if (chat.host === "" + userId) {
                    tab.innerHTML = chat.members[0];
                } else {
                    let hoster = await fetchUsers(chat.host);
                    if (hoster[0]) {
                        tab.innerHTML = hoster[0].username;
                    }
                }
            }
            tab.addEventListener("click", () => openChat(chat.chat_id));
            tab.addEventListener("contextmenu", (event) => showContextMenu(event, chat.chat_id));
            chatList.appendChild(tab);
        }
        // Update unread badge
        const existingBadge = tab.querySelector('.read-notification');
        if (readNum > 0) {
            if (existingBadge) {
                existingBadge.textContent = readNum;
            } else {
                tab.innerHTML += ` <span class='read-notification'>${readNum}</span>`;
            }
        } else if (existingBadge) {
            existingBadge.remove();
        }
    }
    // Remove tabs for deleted chats
    for (const element of Array.from(chatList.children)) {
        const chatId = element.getAttribute("data-chat-id");
        if (!sortedChats.some(chat => chat.chat_id === chatId)) {
            chatList.removeChild(element);
        }
    }
    // Move the most recent chat tab to the left (first position)
    if (sortedChats.length > 0) {
        const mostRecentId = sortedChats[0].chat_id;
        const tab = document.querySelector(`.pages-list a[data-chat-id='${mostRecentId}']`);
        if (tab && tab.parentNode.firstChild !== tab) {
            tab.style.transform = 'scale(1.05)';
            tab.style.opacity = '0.7';
            setTimeout(() => {
                tab.style.transform = '';
                tab.style.opacity = '';
                tab.parentNode.insertBefore(tab, tab.parentNode.firstChild);
            }, 150);
        }
    }
    // Highlight current chat tab
    if (currentChat) {
        document.querySelectorAll('a[data-chat-id]').forEach(element => {
            element.classList.remove("currentTab");
        });
        const currentElement = document.querySelector(`a[data-chat-id="${currentChat}"]`);
        if (currentElement) {
            currentElement.classList.add("currentTab");
        }
    }
    // Restore scroll position
    setTimeout(() => {
        chatMess.scrollTop = savedScrollPosition;
    }, 0);
}



function moveTabToLeft(chatId) {
    const tab = document.querySelector(`.pages-list a[data-chat-id='${chatId}']`);
    if (tab) {
        tab.style.transform = 'scale(1.05)';
        tab.style.opacity = '0.7';
        setTimeout(() => {
            tab.style.transform = '';
            tab.style.opacity = '';
            const parent = tab.parentNode;
            parent.insertBefore(tab, parent.firstChild);
        }, 150);
    }
}

// Inside changeRow(), after updating the DOM:
moveTabToLeft(currentChat);

export {currentChat, username, userId, displayTypingBool, newpayload, messages, sendlers, timers};