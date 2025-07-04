import {db} from '/scripts/createChat.js';
import {currentChat,username,userId, displayTypingBool, newpayload,memblers} from '/scripts/chats.js';



let chatMess = document.getElementById("chat-messages")
let chatList = document.getElementById("pageList");
let chatHeader = document.getElementById("chat-header");
let chatInput = document.getElementById("chatInput");
let plusBtn = document.getElementById('filer');
let sendBtn = document.getElementById('planer');

let typing = false;
let oldCurrent = currentChat;
let counter = 0;
let numId;
let user;

setInterval(chatLogic, 50);

async function chatLogic(){
    
    if(chatInput.value != "" && chatInput.value != " " && chatInput.value != null){
        plusBtn.classList.remove('file1');
        plusBtn.classList.add('file2');

        sendBtn.classList.remove('plane1');
        sendBtn.classList.add('plane2');
        if(typing == false){
            
            await fixTyping(currentChat, true);
        }
    }else{
        if(typing == true){
            await fixTyping(currentChat, false);

        }   

        plusBtn.classList.remove('file2');
        plusBtn.classList.add('file1');

        sendBtn.classList.remove('plane2');
        sendBtn.classList.add('plane1');
        
    }
}
       

    




setInterval(afk, 200);






async function afk(){
 
    if(oldCurrent != currentChat){
        await fixTyping(oldCurrent, false);
        typing = false;

        oldCurrent = currentChat;
    }

    if(displayTypingBool){
        displayTyping(newpayload);

    }
}

chatInput.addEventListener('blur', async (event) =>{
    event.preventDefault();
    await fixTyping(currentChat, false);
    typing = false;
    plusBtn.classList.remove('file2');
    plusBtn.classList.add('file1');

    sendBtn.classList.remove('plane2');
    sendBtn.classList.add('plane1');
        
});

//First: Host Then Others

async function fixTyping(currentChat, onOrOff){
    
    if(currentChat != undefined){
        numId;

        const { data, error } = await db
            .from('Chats') 
            .select('*') 
            .eq('chat_id', currentChat); 

        
        console.log('Typing: ' + counter++)
        if(userId == data[0].host){
            numId = 0;

        }else{
            
            for(let i = 0; i<data[0].members.length;i++){
                if(data[0].members[i] == "" + username + ""){
                    numId = i + 1;
                }
            }
        }
        let typingNew = data[0].typing;
        typingNew[numId] = onOrOff;
        

        const { error: updateError } = await db
            .from("Chats")
            .update({ typing: typingNew })
            .eq("chat_id", currentChat);
 
        
        if (updateError) {
            console.error("Error updating chat:", updateError);
            return;
        }
       
        typing = onOrOff;
        
    }
 
}


// db
//   .channel('realtime-changes')
//   .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'Chats' }, (payload) => {
    
//     if(payload.new.chat_id == currentChat){

//         displayTyping(payload.new);
     

//     }

    
//   })
//   .subscribe();

async function displayTyping(payload){
    let typing = payload.typing;
    

    if(typing){
        if(document.getElementsByClassName('typingMessage')){
            for(let i = 0; i < document.getElementsByClassName('typingMessage').length; i++){
                document.getElementsByClassName('typingMessage')[i].remove();
            }
        }
        
        if(userId == payload.host){
            numId = 0;

        }else{
            
            for(let i = 0; i<payload.members.length;i++){
                if(payload.members[i] == "" + username + ""){
                    numId = i + 1;
                }
            }
        }
        
        for(let i = 0; i< typing.length; i++){
            if(i != numId){
                if(i == 0 && typing[i] == true){
                    let mess = document.createElement('div');
                    mess.classList.add("message");
                    mess.classList.add("typingMessage");
                   
                    if(memblers.length >= 2){
                        user = await fetchUser(payload.host);
                        user = user[0].username;
                        user = (await fetchName(user))[0].name;
                        mess.innerHTML = '<div class="avatar"></div><div class="content"><div class="username">' + user + '</div><div class="text"><img src="/images/typing.gif"></div></div>';
                    }else{
                        mess.innerHTML = '<div class="avatar"></div><div class="content"><div class="text"><img src="/images/typing.gif"></div></div>';

                    }
                    

                    
                    
                    chatMess.prepend(mess);
                }
                if(typing[i] == true && i != 0){
                    user = payload.members[i-1];
                    let mess = document.createElement('div');
                    mess.classList.add("message");
                    mess.classList.add("typingMessage");


                    if(memblers.length >= 2){
                        user = (await fetchName(user))[0].name;
                        mess.innerHTML = '<div class="avatar"></div><div class="content"><div class="username">' + user + '</div><div class="text"><img src="/images/typing.gif"></div></div>';
                    }else{
                        mess.innerHTML = '<div class="avatar"></div><div class="content"><div class="text"><img src="/images/typing.gif"></div></div>';

                    }
                    
                    chatMess.prepend(mess);
                }
            }
        }



    }else{
        console.log("no typing");
    }


}

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

async function fetchUser(userIdentify) {
  const { data, error } = await db
    .from('Users')
    .select('username')
    .eq('id', userIdentify);
  console.log("Typing: " + counter++);
  
  if (error) {
    console.error('Error fetching data:', error);
    return null;
  }

  return data;
}