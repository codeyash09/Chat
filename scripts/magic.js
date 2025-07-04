import {db} from '/scripts/createchat.js';
import {username, userId, messages, sendlers, timers, memblers} from '/scripts/chats.js';




const OPENROUTER_API_KEY = "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"; // Get this from https://openrouter.ai


// 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


let on = false;
let aing = false;
let responses = [];
let prompts = [`Find a message that makes sense for me to send to the others that is close to my speech but isn't gibberish. Be concise if possible. Focus on most recent messages to formulate a grasp of a the current topic. MOST IMPORTANT: ${username} is sending the message`];
let sortedChats;

let menur = document.getElementById("mPopup");




let magicBtn = document.getElementById("magicButton");

magicBtn.addEventListener("click", ()=>{
  console.log("cooking");
  menur.innerHTML = "";
  document.removeEventListener("click", handleClickOutside);
  chatWithAi(0,1);
  menur.style.display = "block";
  menur.style.opacity = "1";
});

  




function handleClickOutside(event){

   

    if (!menur.contains(event.target)) {
      menur.style.display = "none";
      menur.style.opacity = "0";
    }
  
}


let isWaiting = false;





function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function chatWithAi(retryCount, trials) {
  

  await delay(2000);

  let mess = [];

  
  mess.push({role: "system", content: "You are a helpful assistant named Qubit AI. Please try to use a tone comfortable for the user and try to mimic how they talk to make them more comfortable."});
  mess.push({role: "system", content: "The user goes by the username: " + username});

  mess.push({role: "system", content: "Use this information to come up with suitable replies: " + JSON.stringify(messages) + " and are sent by " + JSON.stringify(sendlers) + " and " + JSON.stringify(memblers) + " are in the conversation."});
  
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

      return chatWithAi(retryCount + 1);

    }

    

  }else{
    text5 = result.choices?.[0]?.message?.content;
  }

  
  responses.push(result.choices?.[0]?.message?.content);


  
/* <div class="messager"> 
    <div class="content">
        
        <div class="text">Looks cool!</div>
        
    </div>
</div> */
  let extracted = text5.match(/"([^"]*)"/)?.[1] || text5;
  if(extracted == text5){
    extracted = text5.match(/`([^"]*)`/)?.[1] || text5;

  }

  
  let message = document.createElement("div");
  message.classList.add("recc");
  message.innerHTML = extracted;
  message.addEventListener("click", ()=>{
    document.getElementById("chatInput").value = message.innerHTML;
    menur.style.display = "none";
    menur.style.opacity = "0";
  })

  menur.appendChild(message);


  prompts.push("Find another message that makes sense for me to send to the others that is close to my speech but isn't gibberish. Be concise if possible. Focus on most recent messages to formulate a grasp of a the current topic.");
  isWaiting = false;
  if(trials < 3){
    chatWithAi(retryCount, trials + 1);
  }else{
    document.addEventListener("click", handleClickOutside);
  }
}

// let input = document.getElementById("aiInput");
// let wall = document.getElementById("wall");

// input.addEventListener("focus", ()=>{
//   if(!on){
//     on = true;
//     document.getElementById("searcher").style.top = "5vh";

//   }
//     aing = true;

//     wall.style.top = "0";
//     wall.style.opacity = '1';

// })


// input.addEventListener('keydown', function (event) {
//   if (event.key === 'Enter') {
//     if(input.value != null && input.value != "" && input.value != undefined){
//       if(!isWaiting){
        


    
//         isWaiting = true;
//         prompts.push(input.value);

//         document.getElementById("searcher").style.top = "80vh";

//         let messager2 = document.createElement("div");
//         messager2.classList.add('messager');
//         messager2.classList.add('own-messager');
//         let content2 = document.createElement('div');
//         content2.classList.add('content');
//         let text2 = document.createElement('div');
//         text2.classList.add('text');
//         text2.innerHTML = input.value;

//         content2.appendChild(text2);
//         messager2.appendChild(content2);
//         messages.appendChild(messager2);
//         chatWithAi(input.value, 0);
//         input.value = "";

//       }
      

//     }
//   }
// });


// input.addEventListener("blur", ()=>{
//     document.getElementById("searcher").style.top = "80vh";
//     wall.style.top = "90vh";
//     on = false;
//     wall.style.opacity = '0';
// })


// export {aing}



// let backBtn = document.getElementById("backerBtn");


// backBtn.addEventListener("click", ()=>{
//   document.getElementById("searcher").style.top = "80vh";
//   input.value = "";

//   wall.style.top = "90vh";
//   wall.style.opacity = '0';
//   aing = false;
  
// })
