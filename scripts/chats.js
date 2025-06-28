import {db} from '/scripts/createChat.js';
import { showContextMenu } from '/scripts/chatContextMenu.js';
import { setReplying, replying, reply } from '/scripts/messageMenu.js';

let count = 0;
let read = 10;
let totalRead = 0;

let userId = window.localStorage.getItem("userIdentify");
let lastSender = null;

if(userId == null || userId == "null"){
    window.location.replace('/pages/signup.html');
}

let chatMess = document.getElementById("chat-messages");
let chatList = document.getElementById("messagesBannerHolder");
let chatsList = document.getElementById("pageList");

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
let memblers;
let timers;

// Add a flag to track if we're currently updating to prevent recursive calls
let isUpdating = false;

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

async function fetchName(username) {
    const { data, error } = await db
      .from('Users')
      .select('name')
      .eq('username', username);
  
    if (error) {
      console.error('Error fetching data:', error);
      return null;
    }
  
    return data;
}

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
        showChatlers();
    }
});

async function showChats() {
    // Prevent recursive calls during updates
    if (isUpdating) return;
    
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
    let tab = document.querySelector(`#messagesBannerHolder a[data-chat-id='${sortedChats[0].chat_id}']`);
    if(tab){
        document.getElementById("messagesBannerHolder").innerHTML = "";
    }
    
    const existingChatIds = new Set(Array.from(chatList.children).map(el => el.getAttribute("data-chat-id")));
    for (const chat of sortedChats) {
        
        let userNum = ("" + userId === chat.host) ? chat.members.length : chat.members.indexOf(username);
        let readNum = chat.read[userNum];
        
        tab = document.createElement("a");
        tab.classList.add("messagesBanner");
        tab.setAttribute("data-chat-id", chat.chat_id);

        let person = document.createElement('div');
        person.classList.add("person");
        let avatar = document.createElement('div');
        avatar.classList.add("avatarBanner");
        let texts = document.createElement('div');
        texts.classList.add("text");
        person.appendChild(avatar);
        let uselr = document.createElement('div');

        if (chat.groupchat) {
            uselr.innerHTML = chat.title;
        } else {
            if (chat.host === "" + userId) {
                uselr.innerHTML = (await fetchName(chat.members[0]))[0].name;
            } else {
                let hoster = await fetchUsers(chat.host);
                if (hoster[0]) {
                    uselr.innerHTML = (await fetchName(hoster[0].username))[0].name;
                }
            }
        }

        uselr.classList.add("user");

        let lastMessage = document.createElement('div');
        lastMessage.classList.add("lastMessage");
        let timel = document.createElement('div');
        timel.classList.add('timer');
       
        if(chat.senders){
            for(let i = chat.senders.length - 1; i >= 0; i--){
                
                if(!(chat.messages[i].includes("<deleted for='" + username + "' style='display:none'></deleted>"))){

                    let finalMessage;
                    if(chat.messages[i].includes('<div class="replyMessage">')){
                        let raw = chat.messages[i];
                        const match = raw.match(/<\/[^>]+>([^<]+)(?:<|$)/);
                        finalMessage = match ? match[1].trim() : '';
                    }else{
                        finalMessage = chat.messages[i];
                    }
                    
                    if(chat.senders[i] == username){
                        lastMessage.innerHTML = "You: " + finalMessage;
                    }else{
                        lastMessage.innerHTML = (await fetchName(chat.senders[i]))[0].name + ": " + finalMessage;
                    }

                    timel.innerHTML = formatChatListTimestamp(chat.times[i]);
                    break;
                }
            }
        }

        let time = document.createElement('div');
        time.classList.add('time');
        texts.appendChild(uselr);
        texts.appendChild(lastMessage);
        person.appendChild(texts);
        tab.appendChild(person);
        tab.addEventListener("click", () => openChat(chat.chat_id));
        tab.addEventListener("contextmenu", (event) => showContextMenu(event, chat.chat_id));
        time.appendChild(timel);
        tab.appendChild(time);

        if(chat == sortedChats[0]){
            let replyBar = document.createElement("div");
            replyBar.classList.add("replyBar");
            let input = document.createElement("input");
            input.type='text';
            input.placeholder = `Send message to ${uselr.innerHTML}`
            input.classList.add("replyInput");
            replyBar.appendChild(input);
            replyBar.addEventListener("click", (e) => {
                e.stopImmediatePropagation();
                e.stopPropagation();
                e.preventDefault();
                return false;
            }, true);
            
            replyBar.addEventListener("mousedown", (e) => {
                e.stopImmediatePropagation();
                e.stopPropagation();
                return false;
            }, true);
            
            replyBar.addEventListener("mouseup", (e) => {
                e.stopImmediatePropagation();
                e.stopPropagation();
                return false;
            }, true);
            
            input.addEventListener("focus", (e) => {
                e.stopImmediatePropagation();
                e.stopPropagation();
                e.preventDefault();
                return false;
            }, true);
            
            input.addEventListener("click", (e) => {
                e.stopImmediatePropagation();
                e.stopPropagation();
                e.preventDefault();
                return false;
            }, true);
            
            input.addEventListener("mousedown", (e) => {
                e.stopImmediatePropagation();
                e.stopPropagation();
                return false;
            }, true);
            
            input.addEventListener("mouseup", (e) => {
                e.stopImmediatePropagation();
                e.stopPropagation();
                return false;
            }, true);
            
            ['touchstart', 'touchend', 'pointerdown', 'pointerup'].forEach(eventType => {
                replyBar.addEventListener(eventType, (e) => {
                    e.stopImmediatePropagation();
                    e.stopPropagation();
                    return false;
                }, true);
                
                input.addEventListener(eventType, (e) => {
                    e.stopImmediatePropagation();
                    e.stopPropagation();
                    return false;
                }, true);
            });
            
            input.addEventListener("keydown", async function(event) {
                event.stopPropagation;
                if (event.key === "Enter") {
                    const messageText = input.value.trim();
                    if (!messageText) return; 

                    const chatId = currentChat; 
                    const sender = username; 
                    const timestamp = new Date().toISOString();

                    try {  
                        const { data, error } = await db
                            .from("Chats")
                            .select("*")
                            .eq("chat_id", chat.chat_id)
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
                            .eq("chat_id", chat.chat_id);

                        if (updateError) {
                            console.error("Error updating chat:", updateError);
                            return;
                        }

                        input.value = ""; 

                    } catch (err) {
                        console.error("Unexpected error:", err);
                    }
                }
            });
            tab.appendChild(replyBar);
        }
            
        chatList.appendChild(tab);
        const existingBadge = tab.querySelector('.reader');
       
        if (readNum > 0) {
            if (existingBadge) {
                existingBadge.textContent = readNum;
            } else {
                let badger = document.createElement('div');
                badger.classList.add('reader');
                badger.innerHTML = readNum;
                tab.querySelector('.time').appendChild(badger);
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
        const tab = document.querySelector(`#messagesBannerHolder a[data-chat-id='${mostRecentId}']`);
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
        document.querySelectorAll('#messagesBannerHolder a[data-chat-id]').forEach(element => {
            element.classList.remove("currentTab");
        });
        const currentElement = document.querySelector(`#messagesBannerHolder a[data-chat-id="${currentChat}"]`);
        if (currentElement) {
            currentElement.classList.add("currentTab");
        }
    }

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
        if(replying){
            messageInput.value = reply + messageInput.value;
            setReplying(false);
        }
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
    if(replying){
        messageInput.value = reply + messageInput.value;
        setReplying(false);
    }
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
    let daysApart = Math.floor((rn - date) / 86400000);

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

async function openChat(id, payload = null) {
    let home = document.querySelector('.home');

    if(!home.classList.contains('hide')){
        home.classList.add('hide');
    }

    currentChat = id;

    document.querySelectorAll('a[data-chat-id]').forEach(element => {
        element.classList.remove("currentTab");
    });
    
    document.querySelector('a[data-chat-id="' + id + '"]').classList.add("currentTab");
    
    let chat;
    if(payload != null && payload.host != undefined && payload.messages != undefined){
        chat = payload;
        chatsSys = chat;
    }else{
        chat = await fetchChat(id);
        chat = chat[0];
        chatsSys = chat;
    }
    
    const chatMess = document.querySelector(".chat-messages");
    chatMess.innerHTML = ""; // Clear existing messages to prevent duplicates

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
        chatHeader.innerHTML = '<button class="homeBtn"><i class="fa-solid fa-angle-left"></i></button>' + chat.title;
        let btn = document.querySelector('.homeBtn');

        btn.addEventListener('click', ()=>{
            changeRow();
            home.classList.remove('hide');
        })
        btn.children[0].addEventListener('click', ()=>{
            changeRow();
            home.classList.remove('hide');
        })
        chatInput.placeholder = "Message " + chat.title;
    }else{
        if(chat.host == "" + userId + ""){
            chatHeader.innerHTML ='<button class="homeBtn"><i class="fa-solid fa-angle-left"></i></button>' + (await fetchName(chat.members[0]))[0].name;
            chatInput.placeholder = "Message " + (await fetchName(chat.members[0]))[0].name;

            let btn = document.querySelector('.homeBtn');

            btn.addEventListener('click', ()=>{
                changeRow();
                home.classList.remove('hide');
            })
            btn.children[0].addEventListener('click', ()=>{
                changeRow();
                home.classList.remove('hide');
            })
        }else{
            let hoster = fetchUsers(chat.host);
            hoster.then(async result =>{
                if(result[0] != undefined){
                    hoster = (await fetchName(result[0].username))[0].name;
                    
                    chatHeader.innerHTML = hoster;
                    chatInput.placeholder = "Message " + hoster;

                    chatHeader.innerHTML ='<button class="homeBtn"><i class="fa-solid fa-angle-left"></i></button>' +hoster;
                    chatInput.placeholder = "Message " + hoster;

                    let btn = document.querySelector('.homeBtn');

                    btn.addEventListener('click', ()=>{
                        changeRow();
                        home.classList.remove('hide');
                    })
                    btn.children[0].addEventListener('click', ()=>{
                        changeRow();
                        home.classList.remove('hide');
                    })
                }
            });
        }
    }
    lastSender= null;
    
    // Create a Set to track processed message indices to prevent duplicates
    const processedMessages = new Set();
    
    for (let i = chat.messages.length - 1; i >= 0; i--) {
        // Skip if message already processed or is deleted
        if(processedMessages.has(i) || chat.messages[i].includes("<deleted for='" + username + "' style='display:none'></deleted>")){
            continue;
        }
        
        // Mark this message as processed
        processedMessages.add(i);

        const message = document.createElement("div");
        message.classList.add("message");
        message.setAttribute('data-message-id', i);
        message.id = i;
        
        if(chat.senders[i]!=username){
            const avatar = document.createElement("div");
            avatar.classList.add("avatar");
            message.appendChild(avatar);
        }
        
        const content = document.createElement("div");
        content.classList.add("content");
        let usernameElement;
        usernameElement = document.createElement("div");
        usernameElement.classList.add("username");
        usernameElement.innerHTML = chat.senders?.[i] || "Unknown User";
        if(!chat.groupchat){
            usernameElement.style.display = 'none';
        }
        
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

        message.appendChild(content);
        content.appendChild(usernameElement);
        content.appendChild(text);
        content.appendChild(time);
        content.appendChild(messId);

        if(chat.messages[i].includes('<div class="replyMessage">')){
            message.style.setProperty('margin-top', '50px', 'important');
            message.querySelector(".replyMessage").addEventListener('click', ()=> {
                window.location.hash = message.querySelector('.ider').innerHTML;
            })
        }

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
        window.location.hash = '';
        const threshold = 100;
        const atThreshold = chatMess.scrollTop >= -threshold;

        if (atThreshold) {
            updatedRead[userNum] = 0;
            updateRead(updatedRead);
        }
    });

    const threshold = 100;
    const atThreshold = chatMess.scrollTop >= -threshold;

    if (atThreshold) {
        if(updatedRead[userNum] != 0){
            updatedRead[userNum] = 0;
            updateRead(updatedRead);
        }
    }

    messages = chat.messages;
    sendlers = chat.senders;
    memblers = chat.members;
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
    changeRowler();
}

let i = 0;

// Modified real-time subscription to prevent duplicate handling
db
    .channel('realtime-changes')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'Chats' }, async (payload) => {
        if (isUpdating) return; // Prevent recursive calls
        isUpdating = true;
        
        changeRowler();
        await showChats();
        
        isUpdating = false;
    })
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'Chats' }, async (payload) => {
        if (isUpdating) return; // Prevent recursive calls
        isUpdating = true;
        
        if (payload.new.chat_id === currentChat) {
            // Only re-open if there are actually new messages
            if (JSON.stringify(payload.new.messages) !== JSON.stringify(chatsSys?.messages)) {
                openChat(currentChat, payload.new);
                displayTypingBool = true;
                newpayload = payload.new;
                setTimeout(()=> {displayTypingBool = false}, 201);
            }
        } else {
            changeRowler();
        }

        await showChats();
        
        isUpdating = false;
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
    let tab;
    // Update or add chat tabs
    const existingChatIds = new Set(Array.from(chatList.children).map(el => el.getAttribute("data-chat-id")));
    for (const chat of sortedChats) {
        tab = document.querySelector(`#messagesBannerHolder a[data-chat-id='${chat.chat_id}']`);
        let userNum = ("" + userId === chat.host) ? chat.members.length : chat.members.indexOf(username);
        let readNum = chat.read[userNum];
        if (!tab) {
            tab = document.createElement("a");
            tab.setAttribute("data-chat-id", chat.chat_id);
            if (chat.groupchat) {
                tab.innerHTML = chat.title;
            } else {
                if (chat.host === "" + userId) {
                    tab.innerHTML = (await fetchName(chat.members[0]))[0].name;
                } else {
                    let hoster = await fetchUsers(chat.host);
                    if (hoster[0]) {
                        tab.innerHTML = (await fetchName(hoster[0].username))[0].name;
                    }
                }
            }
            tab.addEventListener("click", () => openChat(chat.chat_id));
            tab.addEventListener("contextmenu", (event) => showContextMenu(event, chat.chat_id));
            chatList.appendChild(tab);
        }
        // Update unread badge
        const existingBadge = tab.querySelector('.reader');
        

        if (readNum > 0) {
            if (existingBadge) {
                existingBadge.textContent = readNum;
            } else {
                let badger = document.createElement('div');
                badger.classList.add('reader');
                badger.innerHTML = readNum;

                tab.querySelector('.time').appendChild(badger);
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
        const tab = document.querySelector(`#messagesBannerHolder a[data-chat-id='${mostRecentId}']`);
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
    const tab = document.querySelector(`#messagesBannerHolder a[data-chat-id='${chatId}']`);
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





async function showChatlers() {

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

  
    const existingChatIds = new Set(Array.from(chatsList.children).map(el => el.getAttribute("data-chat-id")));
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
                    tab.innerHTML = (await fetchName(chat.members[0]))[0].name;
                } else {
                    let hoster = await fetchUsers(chat.host);
                    if (hoster[0]) {
                        tab.innerHTML =(await fetchName(hoster[0].username))[0].name;
                    }
                }
            }
            tab.addEventListener("click", () => openChat(chat.chat_id));
            tab.addEventListener("contextmenu", (event) => showContextMenu(event, chat.chat_id));
            chatsList.appendChild(tab);
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
    
    for (const element of Array.from(chatsList.children)) {
        const chatId = element.getAttribute("data-chat-id");
        if (!sortedChats.some(chat => chat.chat_id === chatId)) {
            chatsList.removeChild(element);
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
 
    setTimeout(() => {
        chatMess.scrollTop = savedScrollPosition;
    }, 0);
}

async function changeRowler() {
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
    const existingChatIds = new Set(Array.from(chatsList.children).map(el => el.getAttribute("data-chat-id")));

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
                    tab.innerHTML = (await fetchName(chat.members[0]))[0].name;
                } else {
                    let hoster = await fetchUsers(chat.host);
                    if (hoster[0]) {
                        tab.innerHTML = (await fetchName(hoster[0].username))[0].name;
                    }
                }
            }
            tab.addEventListener("click", () => openChat(chat.chat_id));
            tab.addEventListener("contextmenu", (event) => showContextMenu(event, chat.chat_id));
            chatsList.appendChild(tab);
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
    for (const element of Array.from(chatsList.children)) {
        const chatId = element.getAttribute("data-chat-id");
        if (!sortedChats.some(chat => chat.chat_id === chatId)) {
            chatsList.removeChild(element);
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

// Helper to format chat list timestamp
function formatChatListTimestamp(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    if (
        date.getFullYear() === now.getFullYear() &&
        date.getMonth() === now.getMonth() &&
        date.getDate() === now.getDate()
    ) {
        // Today: show only time
        return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
    } else {
        // Not today: show only date
        return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    }
}

export {currentChat, username, userId, displayTypingBool, newpayload, messages, sendlers, memblers, timers};