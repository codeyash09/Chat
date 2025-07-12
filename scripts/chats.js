import {db} from '/scripts/createChat.js';
import { showContextMenu } from '/scripts/chatContextMenu.js';
import { setReplying, replying, reply } from '/scripts/messageMenu.js';
import { fetchUserProfile } from '/scripts/createChat.js';


import {aing } from "/scripts/ai.js";

window.onload = function () {
  if (!window.location.hash.includes('refreshed')) {
    window.location.hash += '#refreshed';
    window.location.reload();
  }
};






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
let isDispalying = false;
let timers;
let isNewing = false;

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


async function fetchId(username) {
    const { data, error } = await db
      .from('Users')
      .select('id')
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
    if(isDispalying){return};
    isDispalying = true;
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
                if(chat.members.length != 0){
                    uselr.innerHTML = (await fetchName(chat.members[0]))[0].name;

                }else{
                    uselr.innerHTML = username  + " (You)";
                }
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
                    if (finalMessage.length > 25) {
                        finalMessage = finalMessage.slice(0, 22) + '...';
                    }


                    finalMessage = finalMessage.replace(/<div class="message-reactions">[\s\S]*?<\/div>/g, '');
                    
                    
                    if(chat.senders[i] == username){
                        lastMessage.innerHTML = "<b>You:</b> " + finalMessage;
                    }else{
                        lastMessage.innerHTML = "<b>" + (await fetchName(chat.senders[i]))[0].name.split(" ")[0] + "</b>: " + finalMessage;
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
            input.placeholder = `Quick Reply`
            input.classList.add("replyInput");
            input.enterKeyHint="send";

            let sendBtn = document.createElement("button");
            sendBtn.classList.add("quickReplyBtn");
            sendBtn.innerHTML = `<img src="/images/send.png" alt="Send" style="width:32px;height:32px;object-fit:contain;">`;
            sendBtn.style.padding = "0";
            sendBtn.style.background = "none";
            sendBtn.style.border = "none";
            sendBtn.style.display = "flex";
            sendBtn.style.alignItems = "center";
            replyBar.appendChild(input);
            replyBar.appendChild(sendBtn);
            replyBar.addEventListener("click", (e) => {
                e.stopImmediatePropagation();
                e.stopPropagation();
                e.preventDefault();
                return false;
            }, true);
            
            replyBar.addEventListener("mousedown", (e) => {
                if (e.target.closest('.replyBar')) {
                    return; 
                }
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
                if (e.target.closest('.replyBar')) {
                    return; 
                }
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
           
            sendBtn.addEventListener("click", (e) => {
                console.log("Send button clicked");
            });
            sendBtn.addEventListener("click", async function (event) {
                const messageText = input.value.trim();
                if (!messageText) return; 
                console.log("Sending message:", messageText);
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
        if(chat.groupchat){
            let gcBadge = document.createElement('span');
            gcBadge.classList.add('gc-badge');
            gcBadge.innerHTML = "GC";
            tab.appendChild(gcBadge);
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

    isDispalying = false;
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

        if(document.querySelectorAll(".message").length < 2){
            openChat(currentChat);
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
    if(document.querySelectorAll(".message").length < 2){
        openChat(currentChat);
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
    if(payload != null && payload.messages != null && payload.messages.length > 0){

      
        newMessages(payload);
        return;
    }
    let confirmation = false;
    let home = document.querySelector('.home');
    let crBtn = document.querySelector('#newChatBtn2');
    if(!home.classList.contains('hide')){
        home.classList.add('hide');
        crBtn.style.display = 'none';

    }

    currentChat = id;

    document.querySelectorAll('a[data-chat-id]').forEach(element => {
        element.classList.remove("currentTab");
    });
    
    document.querySelector('a[data-chat-id="' + id + '"]').classList.add("currentTab");
    
    let chat;
    if(payload != null && payload.host != undefined && payload.messages != undefined && payload.times != null && payload.times.length > 0){
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
            document.getElementById('newChatBtn2').style.display = 'flex';
            changeRow();
            home.classList.remove('hide');
        })
        btn.children[0].addEventListener('click', ()=>{
            document.getElementById('newChatBtn2').style.display = 'flex';

            changeRow();
            home.classList.remove('hide');
        })
        chatInput.placeholder = "Message " + chat.title;
    }else{
        if(chat.host == "" + userId + ""){
            if(chat.members.length != 0){
                chatHeader.innerHTML ='<button class="homeBtn"><i class="fa-solid fa-angle-left"></i></button>' + (await fetchName(chat.members[0]))[0].name;
                chatInput.placeholder = "Message " + (await fetchName(chat.members[0]))[0].name;


            }else{
                chatHeader.innerHTML ='<button class="homeBtn"><i class="fa-solid fa-angle-left"></i></button>' + username + " (You)";
                chatInput.placeholder = "Message " + username + " (yourself)";
            }

            let btn = document.querySelector('.homeBtn');

            btn.addEventListener('click', ()=>{
                document.getElementById('newChatBtn2').style.display = 'flex';

                changeRow();
                home.classList.remove('hide');
            })
            btn.children[0].addEventListener('click', ()=>{
                document.getElementById('newChatBtn2').style.display = 'flex';

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
                        document.getElementById('newChatBtn2').style.display = 'flex';

                        changeRow();
                        home.classList.remove('hide');
                    })
                    btn.children[0].addEventListener('click', ()=>{
                        document.getElementById('newChatBtn2').style.display = 'flex';

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


    if(chat.members.includes(username)){
        if(chat.accepted[chat.members.indexOf(username)] == 0 || chat.accepted[chat.members.indexOf(username)] == "0"){
            confirmation = true;
        }
    }
    let image = null;
    if(!(chat.groupchat)){
        if("" + userId == "" + chat.host){
            let profile = await fetchUserProfile((await fetchId(chat.members[0]))[0].id);
        
            if(profile && profile.pfp){
                image = profile.pfp;
            }
        }else{
            let profile = await fetchUserProfile(chat.host);
        
            if(profile && profile.pfp){
                image = profile.pfp;
            }
        }
        
    }else{
        image = [];
        for(let i = 0; i < chat.members.length; i++){
            let profile = await fetchUserProfile((await fetchId(chat.members[i]))[0].id);
            
            if(profile && profile.pfp){
                image.push(profile.pfp);
            }else{
                image.push(null);
            }
            
        }
        let yprofile = await fetchUserProfile(chat.host);
            
        if(yprofile && yprofile.pfp){
            image.push(yprofile.pfp);
        }else{
            image.push(null);
        }

    }

    let hostName = (await fetchUsers(chat.host))[0].username;
    

    if(!confirmation){
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
                if(chat.groupchat){
                    if(hostName == chat.senders[i]){
                        if(image[image.length - 1] != null){
                            avatar.innerHTML = `<img src="${image[image.length - 1]}" alt="Profile Picture" class="profilePicture">`;
                        }
                    }else{
                        if(image[chat.members.indexOf(chat.senders[i])] != null){
                            avatar.innerHTML = `<img src="${image[chat.members.indexOf(chat.senders[i])]}" alt="Profile Picture" class="profilePicture">`;

                        }

                    }
                }else{
                    if(image != null){
                        avatar.innerHTML = `<img src="${image}" alt="Profile Picture" class="profilePicture">`;


                    }
                }
               
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
                if(i == chat.messages.length - 1){
                    

                    let readed = false;
                    if(chat.host == "" + userId){
                        for(let i = 0; i<chat.members.length;i++){
                            if(chat.read[i] == 0 || chat.read[i] == "0"){
                                readed = true;
                            }
                        }
                    }else{
                        for(let i = 0; i< chat.members.length + 1; i++){
                            if(i == chat.members.indexOf(username)){
                                continue;
                            }
                             if(chat.read[i] == 0 || chat.read[i] == "0"){
                                readed = true;
                            }
                        }
                    }

                    if(readed){
                        document.getElementById("statuss").innerHTML = "Seen";

                    }else{
                        document.getElementById("statuss").innerHTML = "Sent";

                    }
                }
            }

            if(chat.senders[chat.messages.length - 1] != username){
                document.getElementById("statuss").innerHTML = "";
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
        check();
        
    }else{
        let confirmer = document.createElement("div");
        confirmer.classList.add("confirm");
        let rUSure = document.createElement("div");
        rUSure.classList.add("uSure");
        let adminer = (await fetchUsers(chat.host))[0].username;
        let admin = (await fetchName(adminer))[0].name;

        rUSure.innerHTML = `${admin} (${adminer}) is inviting you to chat`;
        let yes = document.createElement("button");
        yes.addEventListener("click", async ()=>{

            let updatedAccept = chat.accepted;

            updatedAccept[chat.members.indexOf(username)] = "1";
    


            const { error: updateError } = await db
                .from("Chats")
                .update({ accepted: updatedAccept })
                .eq("chat_id", currentChat);

            if (updateError) {
                console.error("Error updating chat:", updateError);
                return;
            }

            openChat(currentChat);
        });
        yes.innerHTML = "Accept";
        yes.classList.add("yesBtn");
        

        let no = document.createElement("button");
        no.addEventListener("click", async ()=>{

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
                .eq("chat_id", currentChat);

            if (updateError) {
                console.error("Error updating chat:", updateError);
                return;
            }

            openChat(currentChat);
            

        });
        no.innerText = "Decline";
        no.classList.add("noBtn");

        let btns = document.createElement("div");
        btns.classList.add("conBtns");


        btns.appendChild(yes);
        btns.appendChild(no);
        confirmer.appendChild(rUSure);
        confirmer.appendChild(btns);
        chatMess.appendChild(confirmer);

        
    }
    
    
    
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
        showChats();
 
        
        isUpdating = false;
    })
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'Chats' }, async (payload) => {
        if(isUpdating) return;
        isUpdating = true;
        if (payload.new.chat_id === currentChat) {
            let updated = payload.new;
            
            let newMsgs = updated.messages;
            const oldMsgs = chatsSys?.messages;
            if(!newMsgs){
                newMsgs = (await fetchChat(currentChat))[0].messages;
                updated = (await fetchChat(currentChat))[0];
            }

            
            if ((newMsgs.length !== oldMsgs?.length ||JSON.stringify(updated.read) !== JSON.stringify(chatsSys?.read)) && (payload.new.times && payload.new.times.length >= 1)) {
                newMessages(updated);
                displayTypingBool = true;
                newpayload = updated;
                setTimeout(() => { displayTypingBool = false }, 201);
            } else if (JSON.stringify(newMsgs) !== JSON.stringify(oldMsgs)) {
                openChat(currentChat, updated);
                displayTypingBool = true;
                newpayload = updated;
                setTimeout(() => { displayTypingBool = false }, 201);
            }
        } else {
            changeRowler();
        }

        await showChats();
        isUpdating = false;
    })
    .on('postgres_changes', {event: '*', schema: 'public', table: 'Chats'}, async (payload) =>{
        
        
        await showChats();

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
                    if(chat.members.length != 0){
                        tab.innerHTML = (await fetchName(chat.members[0]))[0].name;

                    }else{
                        tab.innerHTML = username + " (You)";
                    }
                   
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
                    if(chat.members.length != 0){
                        tab.innerHTML = (await fetchName(chat.members[0]))[0].name;

                    }else{
                        tab.innerHTML = username + " (You)";
                    }
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
function formatChatListTimestamp(centralTime) {
    let date = new Date(centralTime);
    let rn = new Date();
    let daysApart = Math.floor((rn - date) / 86400000);

    if (daysApart > 6) {
        return date.toLocaleString(undefined, { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    }

    let timeStr = date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
    let dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    let dayDiff = rn.getDay() - date.getDay();

    return dayDiff === 0 ? `${timeStr}` :
           dayDiff === 1 || (rn.getDay() === 0 && date.getDay() === 6) ? `Yesterday` :
           `${dayNames[date.getDay()]}`;

}

export {currentChat, username, userId, displayTypingBool, newpayload, messages, sendlers, memblers, timers, fetchChat};
let pfpHolder = document.querySelector('#profileIcon');

const userIds = window.localStorage.getItem('userIdentify');
    if (userIds && userIds != 'null'){
    const profile = await fetchUserProfile(userIds);
    if (profile) {
    // Find the settings popup profile section
    // These selectors match the order in the HTML edit
    const container = document.querySelector('#sett .container');

   

    if(profile.pfp == null || profile.pfp == undefined){
        pfpHolder.innerHTML = '<i class="fa-solid fa-user"></i>';

        
    }else{
        pfpHolder.innerHTML = `<img src="${profile.pfp}" alt="Profile Picture" class="profilePicture">`;
        let avatars = document.querySelectorAll('.avatar');

        for(let i = 0; i < avatars.length; i++){
            avatars[i].innerHTML = `<img src="${profile.pfp}" alt="Profile Picture" class="profilePicture">`;
        }
    }
    if (container) {
        const profileSection = container.querySelector('div[style*="flex-direction: column; align-items: center; margin-top: 32px"]');
        if (profileSection) {
        // Name
        const nameDiv = profileSection.children[1];
        if (nameDiv) nameDiv.textContent = profile.name || '';
        // Username
        const usernameDiv = profileSection.children[2];
        if (usernameDiv) usernameDiv.textContent = '@' + (profile.username || '');
        // DOB
        const dobDiv = profileSection.children[3];
        if (dobDiv) dobDiv.textContent = 'DOB: ' + (profile.birthday || '');
        }
    }
    }
}

pfpHolder.addEventListener('click', () => {
    document.querySelector('#changeImagePopup').style.display = 'flex';
});


document.querySelector('.closeChangeImage').addEventListener('click', () => {
    document.querySelector('#changeImagePopup').style.display = 'none';

});
document.querySelector('#uploadProfileImage').addEventListener('click', () => {
    document.querySelector('#profileImageInput').click();



});

document.querySelector('#profileImageInput').addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        document.querySelector('#imageContainer').innerHTML =`<img id="profileImage" src="${e.target.result}" alt="Profile Image" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;"></img>`;
    };
    reader.readAsDataURL(file);
});
document.querySelector('#saveBtnForPfp').addEventListener('click', async () => {
    if(document.querySelector('#profileImage')){
        const image = document.querySelector('#profileImage').src;
        const { error } = await db
            .from('Users')
            .update({ pfp: image })
            .eq('id', userId);

        if (error) {
            console.error("Error updating profile picture:", error);
            return;
        }

        document.querySelector('#changeImagePopup').style.display = 'none';
        pfpHolder.innerHTML = `<img src="${image}" alt="Profile Picture" class="profilePicture">`;

        let avatars = document.querySelectorAll('.avatar');

        for(let i = 0; i < avatars.length; i++){
            if(avatars[i].children[0]){
                avatars[i].children[0].src = image;
            }else{
                avatars[i].innerHTML = `<img src="${image}" alt="Profile Picture" class="profilePicture">`;
            }
        }
    }

    
});


async function stacker(){
    lastSender = null;
    
    if(sendlers){
        for(let x = sendlers.length - 1; x >= 0; x--){
            if(messages[x].includes("<deleted for='" + username + "' style='display:none'></deleted>")){
                sendlers.splice(x,1);
                messages.splice(x,1);
            }
        }
    
    }
  
    let rawContents = [...document.querySelectorAll('.content')];
    let filteredContents = [];
    let filteredSendlers = [];

    let msgIndex = 0;
    for (let i = 0; i < rawContents.length; i++) {
        let content = rawContents[i];
        
        if (!content.closest('.typingMessage')) {
            // Safeguard: only push sendler if it exists (prevent undefined)
            if (sendlers[msgIndex] !== undefined) {
                filteredContents.push(content);
                filteredSendlers.push(sendlers[msgIndex]);
            }
            msgIndex++;
        }
    }
    let contents = filteredContents;
    sendlers = filteredSendlers;
   
    for(let i = contents.length - 1; i >= 0; i--){
        
        let content = contents[i];
        if (content.parentElement.classList.contains('typingMessage')) {
            continue;
        }
        
        
        if(lastSender == sendlers[sendlers.length - 1 - i]){

            if(sendlers[sendlers.length - i]){
                let current = sendlers[sendlers.length - 1 - i];
                let next = sendlers[sendlers.length - i];

                if (next && current !== next) {
                    
                    

                    content.style.borderRadius = "5px";

                    if(sendlers[sendlers.length - 1 - i] == username){
                        content.style.borderTopLeftRadius = "18px";
                        
                    }else{
                        content.style.borderTopRightRadius = "18px";
                        
                    }
                    content.style.borderBottomLeftRadius = "18px";
                    content.style.borderBottomRightRadius = "18px";
                    content.parentElement.style.setProperty('margin-bottom', '40px', 'important');

                    if(content.querySelector('.username')){
                        content.querySelector('.username').style.display = "none";
                    }

                  
                }else{
                    
                    content.style.borderRadius = "5px";

                    if(sendlers[sendlers.length - 1 - i] == username){
                        content.style.borderTopLeftRadius = "18px";
                        content.style.borderBottomLeftRadius = "18px";
                       

                    }else{
                        content.style.borderTopRightRadius = "18px";
                        content.style.borderBottomRightRadius = "18px";
                        
                        content.parentElement.children[0].style.opacity = "0";
                        
                    }

                    if(content.querySelector('.username')){
                        content.querySelector('.username').style.display = "none";
                    }

                }
            }else{
                content.style.borderRadius = "5px";

                if(sendlers[sendlers.length - 1 - i] == username){
                    content.style.borderTopLeftRadius = "18px";
                    
                }else{
                    content.style.borderTopRightRadius = "18px";
                    
                }
                content.style.borderBottomLeftRadius = "18px";
                content.style.borderBottomRightRadius = "18px";
                if(content.querySelector('.username')){
                    content.querySelector('.username').style.display = "none";
                }
                
                
            }
            
            
            
        }else{
            
            content.style.borderRadius = "5px";

            if(sendlers[sendlers.length - 1 - i] == username){
                content.style.borderBottomLeftRadius = "18px";
                content.style.borderTopLeftRadius = "18px";
                content.style.borderTopRightRadius = "18px";
                
            }else{
                content.style.borderTopLeftRadius = "18px";
                content.parentElement.children[0].style.opacity = "0";
                if(i == 0){
                    content.parentElement.children[0].style.opacity = "1";
                    
                }
                content.style.borderBottomRightRadius = "18px";
                content.style.borderTopRightRadius = "18px";
                
            }

            if(sendlers[sendlers.length - i]){
                if(sendlers[sendlers.length - 1 - i] != sendlers[sendlers.length - i]){
                    content.style.borderRadius = "18px";

                    if(sendlers[sendlers.length - 1 - i] != username){
                        content.parentElement.children[0].style.opacity = "1";
                        
                    }
                   
                    content.parentElement.style.setProperty('margin-bottom', '40px', 'important');
                    if(content.querySelector('.username')){
                        content.querySelector('.username').style.display = "none";
                    }
                }


            }
            
        }




        lastSender = sendlers[sendlers.length - 1 - i];

        if(content.querySelector('.replyMessage')){
            if(content.querySelector('.replyMessage').querySelector('.replyUser').innerHTML != username){
                content.querySelector('.replyMessage').style.backgroundColor = "#eee";
                content.querySelector('.replyMessage').style.border = "none";
            }
        }

        if(contents[i-1]){
            if(contents[i-1].querySelector('.replyMessage')){
                content.style.borderBottomLeftRadius = "18px";
                content.style.borderBottomRightRadius = "18px";
               

                content.parentElement.style.setProperty('margin-bottom', '40px', 'important');

                contents[i-1].classList.add('repHold');
                

            }
        }
    }




    
}

function check(){
    if(!aing){
        
        stacker();
    }
}

async function newMessages(payload){
    if(isNewing) return;
    isNewing = true;
    if(!(payload.messages.length > 0 && payload.times && payload.times.length > 0)){
        payload = await fetchChat(currentChat);
        payload = payload[0];
        payload = payload;
    }





    if(!document.querySelector('.confirm')){
        let dif = payload.messages.length - chatsSys.messages.length;
     
        chatsSys = payload;
        if(dif != 0){
            
            

            let num = payload.messages.length - 1;
            
            if (document.getElementById(num)) {
                isNewing = false;
                return;
            }
                
            const message = document.createElement("div");
            message.classList.add("message");
            message.setAttribute('data-message-id', num);
            message.id = num;
            
            if(payload.senders[num]!=username){
                const avatar = document.createElement("div");
                avatar.classList.add("avatar");
                message.appendChild(avatar);

                let yprofile = await fetchUserProfile((await fetchId(payload.senders[num]))[0].id);
                console.log(yprofile);
                if(yprofile && yprofile.pfp != null){
                    avatar.innerHTML = `<img src="${yprofile.pfp}" alt="Profile Picture" class="profilePicture">`;
                }                
            }

            

            const content = document.createElement("div");
            content.classList.add("content");
            let usernameElement;
            usernameElement = document.createElement("div");
            usernameElement.classList.add("username");
            usernameElement.innerHTML = payload.senders?.[num] || "Unknown User";
            if(!payload.groupchat){
                usernameElement.style.display = 'none';
            }
            
            const text = document.createElement("div");
            text.classList.add("text");
            text.innerHTML = payload.messages?.[num] || "No message";
            const time = document.createElement("div");
            time.classList.add("timestamp");
            time.innerHTML = convertToLocalTime(payload.times[num]);
            const messId = document.createElement("div");
            messId.classList.add("messId");
            messId.innerHTML = num;
            messId.style.display = 'none';

            if (payload.senders[num] === username) {
                message.classList.add("own-message");
                if(num == payload.messages.length - 1){
                    

                    let readed = false;
                    if(payload.host == "" + userId){
                        for(let i = 0; i<payload.members.length;i++){
                            if(payload.read[i] == 0 || payload.read[i] == "0"){
                                readed = true;
                            }
                        }
                    }else{
                        for(let i = 0; i< payload.members.length + 1; i++){
                            if(i == payload.members.indexOf(username)){
                                continue;
                            }
                            if(payload.read[i] == 0 || payload.read[i] == "0"){
                                readed = true;
                            }
                        }
                    }

                    if(readed){
                        document.getElementById("statuss").innerHTML = "Seen";

                    }else{
                        document.getElementById("statuss").innerHTML = "Sent";

                    }
                }
            }

            if(payload.senders[payload.messages.length - 1] != username){
                document.getElementById("statuss").innerHTML = "";
            }

            message.appendChild(content);
            content.appendChild(usernameElement);
            content.appendChild(text);
            content.appendChild(time);
            content.appendChild(messId);
            if(payload.messages[num]){
                if(payload.messages[num].includes('<div class="replyMessage">')){
                    message.style.setProperty('margin-top', '50px', 'important');
                    message.querySelector(".replyMessage").addEventListener('click', ()=> {
                        window.location.hash = message.querySelector('.ider').innerHTML;
                    })
                }

                chatMess.prepend(message);
                

            }
            
            
            

        
            
        }
        
        messages = payload.messages;
        sendlers = payload.senders;
        memblers = payload.members;
        timers = payload.times;
        stacker();
        

        if(dif < 0){
            openChat(currentChat);
            
        }

        
        if(document.querySelectorAll(".message").length != payload.messages.length){
            [...document.querySelectorAll('.your-class-name')].slice(payload.messages.length + 1).forEach(el => el.remove());
        }
        

        isNewing = false;
        stacker();

    }
}
window.addEventListener('error', (event) => {
    if(currentChat){
        openChat(currentChat);

    }else{
        showChats();
    }
});

export {openChat};