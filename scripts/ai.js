const OPENROUTER_API_KEY = "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"; // Get this from https://openrouter.ai
let on = false;
let aing = false;
let responses = [];
let prompts = [];

let isWaiting = false;
let messages = document.querySelector('.messagers');

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


async function chatWithAi(prompt, retryCount) {
  

  await delay(2000);

  let mess = [];

 

  for (let i = 0; i < prompts.length; i++) {
    mess.push({ role: "user", content: prompts[i] });
    if (responses[i]) {
      mess.push({ role: "assistant", content: responses[i] });
    }
  }
  console.log(mess);

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.0-flash-exp:free", // or "qwen/qwen3-235b-a22b:free"
      messages: mess
    }),
  });

  const result = await response.json();

  let text5;
  if(response.status == 429){
    if(retryCount >= 3){
      text5 = "Sorry, an unexpected error has occured please try again later.";
      
    }else{
      await delay(7000);
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