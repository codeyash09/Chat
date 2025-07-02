import {db} from '/scripts/createchat.js';
import {username, userId} from '/scripts/chats.js';


const OPENROUTER_API_KEY = "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"; // Get this from https://openrouter.ai


// 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


let on = false;
let aing = false;
let responses = [];
let prompts = [];
let sortedChats;

let aiLogo = document.getElementById("aiLogo");


aiLogo.addEventListener("click", ()=>{
  
  input.focus();
})


let isWaiting = false;
let messages = document.querySelector('.messagers');





function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


async function fetcher(){
  const { data, error } = await db
      .from('Chats')
      .select('senders, messages, members, times')
      .or(`members.cs.{"${username}"},host.eq."${userId}"`);

  if (error || !data || data.length === 0) {
      console.error("No chats found or error fetching chats:", error);
      return;
  }
  
  
  sortedChats = data.sort((a, b) => {
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

  

 
}

async function chatWithAi(prompt, retryCount) {
  

  await delay(2000);

  let mess = [];

  await fetcher();
  
  mess.push({role: "system", content: "You are a helpful assistant named Qubit AI. Please try to use a tone comfortable for the user and try to mimic how they talk to make them more comfortable."});
  mess.push({role: "system", content: "The user goes by the username: " + username});

  mess.push({role: "system", content: "You will use this information to help users with questions about chats the users have with each other, you are not a part of said chats: " + JSON.stringify(sortedChats)});
  
  for (let i = 0; i < prompts.length; i++) {
    mess.push({ role: "user", content: prompts[i] });
    if (responses[i]) {
      mess.push({ role: "assistant", content: responses[i] });
    }
  }
 

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer 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`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama3-8b-8192",
      messages: mess,
    }),
  })

  const result = await response.json();

  let text5;
  if(response.status == 429){
    if(retryCount >= 3){
      text5 = "Sorry, an unexpected error has occured please try again later.";
      
    }else{
      const retryAfter = response.headers.get("Retry-After");
      if (retryAfter) {
        await delay(parseInt(retryAfter) * 1000);
      }else{
        await delay(7000);
      }

      return chatWithAi(prompt, retryCount + 1);

    }

    

  }else{
    text5 = result.choices?.[0]?.message?.content;
  }

  
  responses.push(result.choices?.[0]?.message?.content);


  let messager = document.createElement("div");
/* <div class="messager"> 
    <div class="content">
        
        <div class="text">Looks cool!</div>
        
    </div>
</div> */
  messager.classList.add('messager');
  let content = document.createElement('div');
  content.classList.add('content');
  let text = document.createElement('div');
  text.classList.add('text');
  text.innerHTML = text5;

  content.appendChild(text);
  messager.appendChild(content);
  messages.appendChild(messager);

  isWaiting = false;
  
}

let input = document.getElementById("aiInput");
let wall = document.getElementById("wall");

input.addEventListener("focus", ()=>{
  if(!on){
    on = true;
    document.getElementById("searcher").style.top = "5vh";

  }
    aing = true;

    wall.style.top = "0";
    wall.style.opacity = '1';

})


input.addEventListener('keydown', function (event) {
  if (event.key === 'Enter') {
    if(input.value != null && input.value != "" && input.value != undefined){
      if(!isWaiting){
        


    
        isWaiting = true;
        prompts.push(input.value);

        document.getElementById("searcher").style.top = "80vh";

        let messager2 = document.createElement("div");
        messager2.classList.add('messager');
        messager2.classList.add('own-messager');
        let content2 = document.createElement('div');
        content2.classList.add('content');
        let text2 = document.createElement('div');
        text2.classList.add('text');
        text2.innerHTML = input.value;

        content2.appendChild(text2);
        messager2.appendChild(content2);
        messages.appendChild(messager2);
        chatWithAi(input.value, 0);
        input.value = "";

      }
      

    }
  }
});


// input.addEventListener("blur", ()=>{
//     document.getElementById("searcher").style.top = "80vh";
//     wall.style.top = "90vh";
//     on = false;
//     wall.style.opacity = '0';
// })


export {aing}



let backBtn = document.getElementById("backerBtn");


backBtn.addEventListener("click", ()=>{
  document.getElementById("searcher").style.top = "80vh";
  input.value = "";

  wall.style.top = "90vh";
  wall.style.opacity = '0';
  aing = false;
  
})
