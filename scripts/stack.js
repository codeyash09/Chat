
import {sendlers, messages, username } from "/scripts/chats.js";
import {aing } from "/scripts/ai.js";


setInterval(check, 10);
let lastSender = null;
function stacker(){
    lastSender = null;
    if(sendlers){
        for(let x = sendlers.length - 1; x >= 0; x--){
            if(messages[x].includes("<deleted for='" + username + "' style='display:none'></deleted>")){
                sendlers.splice(x,1);
                messages.splice(x,1);
            }
        }
    
    }
  
    let contents = document.querySelectorAll('.content');
   
    for(let i = contents.length - 1; i >= 0; i--){
        
        
        let content = contents[i];

        if(lastSender == sendlers[sendlers.length - 1 - i]){

            if(sendlers[sendlers.length - i]){

                if(sendlers[sendlers.length - 1 -i] == sendlers[sendlers.length - i]){
                    
                    content.style.borderRadius = "5px";

                    if(sendlers[sendlers.length - 1 - i] == username){
                        content.style.borderTopLeftRadius = "18px";
                        content.style.borderBottomLeftRadius = "18px";
                       

                    }else{
                        content.style.borderTopRightRadius = "18px";
                        content.style.borderBottomRightRadius = "18px";

                        content.parentElement.children[0].style.opacity = "0";

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

                    content.parentElement.style.setProperty('margin-bottom', '40px', 'important');


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
                }


            }
            
        }




        lastSender = sendlers[sendlers.length - 1 - i];
    }




    
}

function check(){
    if(!aing){
        
        stacker();
    }
}