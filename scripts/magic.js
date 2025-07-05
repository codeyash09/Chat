import {db} from '/scripts/createchat.js';
import {username, userId, messages, sendlers, timers, memblers} from '/scripts/chats.js';




const OPENROUTER_API_KEY = "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"; // Get this from https://openrouter.ai


// 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


let on = false;
let aing = false;
let responses = [];
let inputs = document.getElementById("chatInput");

let prompts = [
  `You are a helpful autocomplete assistant for the user who goes by ${username} and needs to complete this sentence: ${inputs.value}. Use this background context: ${JSON.stringify(messages)} sent by ${JSON.stringify(sendlers)} in a chat with ${JSON.stringify(memblers)}`
];
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
async function chatWithAi(retryCount = 0, trials = 1) {
  await delay(2000);

  // ⛔️ Skip if input too short
  const rawInput = inputs.value.trim();
  if (!rawInput || rawInput.length < 3) {
    console.warn("Input too short for completion.");
    return;
  }

  // 🎯 Clear, focused message setup
  const mess = [
    {
      role: "system",
      content: `You're Qubit AI, an autocomplete assistant for ${username}. Your job is to finish the user's partial sentence in a casual chat style. No full replies, greetings, or off-topic sentences—just a clean continuation.`
    },
    {
      role: "system",
      content: `Chat background context: ${JSON.stringify(messages)} from ${JSON.stringify(sendlers)} with members ${JSON.stringify(memblers)}. Use this only to match tone.`
    },
    {
      role: "user",
      content: rawInput
    }
  ];

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer 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`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama3-8b-8192",
        messages: mess,
        temperature: 0.7,
        max_tokens: 40,
        stop: ["\n", ".", "!", "?"] // 💡 Force short completion
      })
    });

    const result = await response.json();
    let rawResponse = result.choices?.[0]?.message?.content?.trim() || "";

    // 🧼 Clean and validate output
    if ((rawResponse.length < 3) || /^[.?!]$/.test(rawResponse)) {
      rawResponse = "Sorry, couldn’t generate a usable completion.";
    } else {
      // Remove wrapping quotes or ticks
      if ((rawResponse.startsWith('"') && rawResponse.endsWith('"')) ||
          (rawResponse.startsWith('`') && rawResponse.endsWith('`'))) {
        rawResponse = rawResponse.slice(1, -1).trim();
      }

      // Trim after first punctuation (optional)
      rawResponse = rawResponse.split(/[.!?]/)[0].trim();
    }

    // ✅ Display suggestion
    const message = document.createElement("div");
    message.classList.add("recc");
    message.textContent = rawResponse;

    message.addEventListener("click", () => {
      inputs.value = inputs.value.trim() + " " + rawResponse.trim();

      menur.style.display = "none";
      menur.style.opacity = "0";
    });

    menur.appendChild(message);
    responses.push(rawResponse);

    // 🔁 Optional multiple suggestions
    if (trials < 3) {
      chatWithAi(retryCount, trials + 1);
    } else {
      document.addEventListener("click", handleClickOutside);
    }

    isWaiting = false;
  } catch (err) {
    console.error("AI fetch failed:", err);
    if (retryCount < 3) {
      await delay(5000);
      return chatWithAi(retryCount + 1, trials);
    } else {
      const fallback = document.createElement("div");
      fallback.classList.add("recc");
      fallback.textContent = "Sorry, couldn't generate a suggestion.";
      menur.appendChild(fallback);
    }

    isWaiting = false;
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
