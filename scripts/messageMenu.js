import {currentChat, messages, sendlers, timers } from "/scripts/chats.js";
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

let counter = 0;

function openCustomEmojiPicker(messageElement, menuPopup) {
    // Create a container for the emoji picker
    const pickerContainer = document.createElement('div');
    pickerContainer.className = 'custom-emoji-picker-container';
    document.body.appendChild(pickerContainer);


    const menuRect = menuPopup.getBoundingClientRect();
    pickerContainer.style.position = 'absolute';
    if(messageElement.classList[1] == "own-message"){
        if(window.screen.width < 768){
            pickerContainer.style.right = `${10}px`; 
            
        }else{
            pickerContainer.style.right = `${30}px`; 

        }


    }else{
        pickerContainer.style.left = `${menuRect.left}px`; 

    }
    
    pickerContainer.style.top = `${menuRect.top}px`;
    pickerContainer.style.zIndex = '1001'; 


    if (window.EmojiMart) {
        const picker = new window.EmojiMart.Picker({
           
            onEmojiSelect: (emoji) => {
              
                handleEmojiReaction(emoji.native, messageElement);
                
                
                if (document.body.contains(pickerContainer)) {
                    document.body.removeChild(pickerContainer);
                }
               
                document.removeEventListener('click', closePickerOnClickOutside);
            },
            theme: 'light',
            emojiSize: 20,
            perLine: 8,
            previewPosition: 'none',
            skinTonePosition: 'none',
            maxFrequentRows: 4,
            categories: ['frequent', 'people', 'nature', 'foods', 'activity', 'places', 'objects', 'symbols', 'flags'],
        });

        pickerContainer.appendChild(picker);
    } else {
        console.error('EmojiMart library not loaded!');
        
        if (document.body.contains(pickerContainer)) {
            document.body.removeChild(pickerContainer);
        }
        return;
    }


    const closePickerOnClickOutside = (event) => {

        if (!pickerContainer.contains(event.target)) {
            if (document.body.contains(pickerContainer)) {
                document.body.removeChild(pickerContainer);
            }
            document.removeEventListener('click', closePickerOnClickOutside);
        }
    };

   
    setTimeout(() => {
        document.addEventListener('click', closePickerOnClickOutside);
    }, 100);
}

// Function to create and show the popup menu
function createMessageMenu(messageElement, isOwnMessage) {
    
    // Create popup menu
    const popup = document.createElement('div');
    popup.className = 'message-popup';
    
    // Get message timestamp
    const timestamp = messageElement.querySelector('.timestamp').textContent;
    
    // Create date section
    const dateSection = document.createElement('div');
    dateSection.className = 'message-popup-date';
    dateSection.textContent = timestamp;
    popup.appendChild(dateSection);
    
    // Create emoji reactions section
    const emojiSection = document.createElement('div');
    emojiSection.className = 'message-popup-emoji';
    
    const emojis = [
        { emoji: '❤️', label: 'Heart' },
        { emoji: '😂', label: 'Laugh' },
        { emoji: '😠', label: 'Mad' },
        { emoji: '👍', label: 'Thumbs Up' }
    ];
    
    emojis.forEach(emoji => {
        const emojiButton = document.createElement('button');
        emojiButton.className = 'emoji-reaction';
        emojiButton.innerHTML = emoji.emoji;
        emojiButton.title = emoji.label;
        emojiButton.addEventListener('click', () => {
            handleEmojiReaction(emoji.emoji, messageElement);
            popup.classList.remove('show');
        });
        emojiSection.appendChild(emojiButton);
    });

    // Add custom emoji button
    const customEmojiButton = document.createElement('button');
    customEmojiButton.className = 'emoji-reaction custom-emoji';
    customEmojiButton.innerHTML = '<i class="fa-solid fa-plus"></i>';
    customEmojiButton.title = 'Add Custom Emoji';
    customEmojiButton.addEventListener('click', () => {
        //Code Goes Here


        openCustomEmojiPicker(messageElement, popup);
      
       
        popup.classList.remove('show');


        //Code Above here
    });
    emojiSection.appendChild(customEmojiButton);
    
    popup.appendChild(emojiSection);
    
    // Create action buttons section
    const actionsSection = document.createElement('div');
    actionsSection.className = 'message-popup-actions';
    
    // Reply button
    const replyButton = document.createElement('button');
    replyButton.className = 'message-popup-action';
    replyButton.innerHTML = '<i class="fa-solid fa-reply"></i> Reply';
    replyButton.addEventListener('click', () => {
        handleReply(messageElement);
        popup.classList.remove('show');
    });
    actionsSection.appendChild(replyButton);
    
    // Copy button
    const copyButton = document.createElement('button');
    copyButton.className = 'message-popup-action';
    copyButton.innerHTML = '<i class="fa-solid fa-copy"></i> Copy';
    copyButton.addEventListener('click', () => {
        handleCopy(messageElement);
        popup.classList.remove('show');
    });
    actionsSection.appendChild(copyButton);

    // Add different buttons based on message ownership
    if (isOwnMessage) {
        // Edit button for own messages
        const editButton = document.createElement('button');
        editButton.className = 'message-popup-action';
        editButton.innerHTML = '<i class="fa-solid fa-pen"></i> Edit';
        editButton.addEventListener('click', () => {
            handleEdit(messageElement);
            popup.classList.remove('show');
        });
        actionsSection.appendChild(editButton);


        const deleteButton = document.createElement('button');
        deleteButton.className = 'message-popup-action delete-action';
        deleteButton.innerHTML = '<i class="fa-solid fa-trash"></i> Delete for me';
        deleteButton.addEventListener('click', () => {
            handleDelete(messageElement);
            popup.classList.remove('show');
        });
        actionsSection.appendChild(deleteButton);
        // Delete (unsend) button for own messages
        const unsendButton = document.createElement('button');
        unsendButton.className = 'message-popup-action delete-action';
        unsendButton.innerHTML = '<i class="fa-solid fa-trash"></i> Unsend';
        unsendButton.addEventListener('click', () => {
            handleUnsend(messageElement);
            popup.classList.remove('show');
        });
        actionsSection.appendChild(unsendButton);

        
    } else {
        // Delete button for received messages
        const deleteButton = document.createElement('button');
        deleteButton.className = 'message-popup-action delete-action';
        deleteButton.innerHTML = '<i class="fa-solid fa-trash"></i> Delete for me';
        deleteButton.addEventListener('click', () => {
            handleDelete(messageElement);
            popup.classList.remove('show');
        });
        actionsSection.appendChild(deleteButton);
    }
    
    popup.appendChild(actionsSection);
    
    // Position the popup
    const rect = messageElement.getBoundingClientRect();
    const chatRect = document.getElementById('chat-messages').getBoundingClientRect();
    
    // Temporarily append to get accurate height, then remove
    document.body.appendChild(popup);
    const popupHeight = popup.offsetHeight;
   
    
    document.body.removeChild(popup);

    // Calculate available space below the message
    const spaceBelow = window.innerHeight - rect.bottom;

    // Determine if the popup would overflow if placed below
    let overflowsBottom;
    if(isOwnMessage){
        overflowsBottom = (rect.bottom + 400) > window.innerHeight;

    }else{
        overflowsBottom = (rect.bottom + 300) > window.innerHeight;

    }

    console.log(rect.bottom);
    console.log(popupHeight);

    if (!overflowsBottom) {
        // Position below the message
        popup.style.top = `${rect.bottom + 5}px`; // 5px padding below the message
        // Center horizontally below the message or align with message start/end
        if (isOwnMessage) {
            popup.style.right = `${window.innerWidth - rect.right}px`;
            popup.style.left = 'auto'; // Ensure left is not set if right is
        } else {
            popup.style.left = `${rect.left}px`;
            popup.style.right = 'auto'; // Ensure right is not set if left is
        }
    } else {
        // Position below the message
        // Center horizontally below the message or align with message start/end
        if (isOwnMessage) {
            popup.style.top = `${rect.top - 405}px`; // 5px padding below the message

            popup.style.right = `${window.innerWidth - rect.right}px`;
            popup.style.left = 'auto'; // Ensure left is not set if right is
        } else {
            popup.style.top = `${rect.top - 305}px`; // 5px padding below the message

            popup.style.left = `${rect.left}px`;
            popup.style.right = 'auto'; // Ensure right is not set if left is
        }
    }
    
    
    // Add to document
    document.body.appendChild(popup);
    
    // --- Push up messages above on mobile (tap/hold) ---
    if (window.innerWidth <= 768) {
        // Remove previous push-up-above classes
        document.querySelectorAll('.message.push-up-above').forEach(m => m.classList.remove('push-up-above'));
        // Find all next siblings (above, due to column-reverse)
        let next = messageElement.nextElementSibling;
        while (next) {
            if (next.classList.contains('message')) {
                next.classList.add('push-up-above');
            }
            next = next.nextElementSibling;
        }
    }
    // --- End push up ---

    // Show popup
    popup.classList.add('show');

    // Close popup when clicking outside, moving cursor away, or scrolling
    const closePopup = (e) => {
        // If it's a scroll event, close immediately
        if (e.type === 'scroll') {
            // Add falling animation to emojis
            const emojis = popup.querySelectorAll('.emoji-reaction');
            emojis.forEach((emoji, index) => {
                setTimeout(() => {
                    emoji.classList.add('falling');
                }, index * 100);
            });

            // Add closing animation to popup
            popup.classList.add('closing');
            setTimeout(() => {
                popup.remove();
            }, 800);
            document.removeEventListener('click', closePopup, true);
            document.removeEventListener('scroll', closePopup, true);
            document.removeEventListener('mousemove', closePopup, true);
            return;
        }

        // For mouse movement and click, check distance
        const isOverPopup = popup.contains(e.target);
        const isOverMessage = messageElement.contains(e.target);
        const isOverEmojiPicker = e.target.closest('em-emoji-picker');
        if (isOverPopup || isOverEmojiPicker) {
            return;
        }
        // Get popup position
        const popupRect = popup.getBoundingClientRect();
        // If mousemove, check if cursor is far from popup
        if (e.type === 'mousemove') {
            const dx = Math.max(popupRect.left - e.clientX, e.clientX - popupRect.right, 0);
            const dy = Math.max(popupRect.top - e.clientY, e.clientY - popupRect.bottom, 0);
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < 100) return; // Only close if >100px away
        }
        // If not over message or popup, or mouse is far, close
        // Add falling animation to emojis
        const emojis = popup.querySelectorAll('.emoji-reaction');
        emojis.forEach((emoji, index) => {
            setTimeout(() => {
                emoji.classList.add('falling');
            }, index * 100);
        });
        // Add closing animation to popup
        popup.classList.add('closing');
        setTimeout(() => {
            popup.remove();
        }, 800);
        document.removeEventListener('click', closePopup, true);
        document.removeEventListener('scroll', closePopup, true);
        document.removeEventListener('mousemove', closePopup, true);
    };
    document.addEventListener('click', closePopup, true);
    document.addEventListener('scroll', closePopup, true);
    document.addEventListener('mousemove', closePopup, true);
}

// Handle emoji reactions
function handleEmojiReaction(emoji, messageElement) {
    // Get or create reactions container
    let reactionsContainer = messageElement.querySelector('.message-reactions');
    if (!reactionsContainer) {

        
        reactionsContainer = document.createElement('div');
        reactionsContainer.className = 'message-reactions';
        if(messageElement.classList.contains('own-message')){
            
            messageElement.children[0].children[1].appendChild(reactionsContainer); // Changed from .content to messageElement
            
        }else{
            messageElement.children[1].children[1].appendChild(reactionsContainer); // Changed from .content to messageElement

        }
    }

    // Check if this emoji reaction already exists
    const existingReaction = reactionsContainer.querySelector(`[data-emoji="${emoji}"]`);
    if (existingReaction) {
        // Toggle the reaction
        if (existingReaction.classList.contains('active')) {
            // Remove reaction
            existingReaction.remove();
            if (reactionsContainer.children.length === 0) {
                reactionsContainer.remove();
            }
        } else {
            // Add reaction
            existingReaction.classList.add('active');
        }
    } else {
        // Create new reaction
        const reactionElement = document.createElement('div');
        reactionElement.className = 'message-reaction active';
        reactionElement.setAttribute('data-emoji', emoji);
        reactionElement.textContent = emoji;
        
        // Add click handler to toggle reaction
        reactionElement.addEventListener('click', () => {
            handleEmojiReaction(emoji, messageElement);
        });
        
        reactionsContainer.appendChild(reactionElement);
    }
    if(messageElement.classList.contains("own-message")){
        UpdateMessageReact(messageElement, messageElement.children[0].children[1].innerHTML);

    }else{
        UpdateMessageReact(messageElement, messageElement.children[1].children[1].innerHTML);

    }
}

async function UpdateMessageReact(messEl, updatedText){
    let newMess = messages;
    newMess[parseInt(messEl.querySelector('.messId').innerHTML)] = updatedText;

    const { data, error } = await db
      .from('Chats') 
      .update({messages: newMess}) 
      .eq('chat_id', currentChat); 
    console.log("Menu " + counter++);
    
}

// Handle reply
function handleReply(messageElement) {

    
    const sender = messageElement.querySelector('.username').textContent;
    let messageText = messageElement.querySelector('.text').innerHTML;
    const chatInput = document.getElementById('chatInput');









    if(messageText.includes('<div class="replyMessage">')){
        const parser = new DOMParser();
        const doc = parser.parseFromString(messageText, 'text/html');

        
        doc.querySelectorAll('.replyMessage').forEach(el => el.remove());

        

        
        messageText = doc.body.textContent.trim();

    }
    if(messageText.includes('<div class="message-reactions">')){
        const parser = new DOMParser();
        const doc = parser.parseFromString(messageText, 'text/html');

        
        doc.querySelectorAll('.message-reaction').forEach(el => el.remove());

        

        
        messageText = doc.body.textContent.trim();

    }
    
    if(messageText.length > 50){
        messageText = messageText.slice(0, 50) + "...";
    }
    



    chatInput.value = `<div class="replyMessage"><div class="replyUser">${sender}</div><div class="replyContent">${messageText}</div><div style="display:none" class="ider">${messageElement.id}</div></div>`;
    chatInput.focus();
}

// Handle copy
function handleCopy(messageElement) {
    // Try different selectors to find the text content
    const textElement = messageElement.querySelector('.content .text') || 
                       messageElement.querySelector('.text') ||
                       messageElement.querySelector('.content');
    
    if (!textElement) {
        console.error('Could not find text element in message:', messageElement);
        return;
    }

    const messageText = textElement.textContent;
    console.log('Attempting to copy text:', messageText); // Debug log

    // Use a fallback method if clipboard API fails
    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(messageText);
            console.log('Successfully copied to clipboard');
        } catch (err) {
            console.error('Clipboard API failed, trying fallback method:', err);
            // Fallback method
            const textArea = document.createElement('textarea');
            textArea.value = messageText;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            
            try {
                document.execCommand('copy');
                console.log('Successfully copied using fallback method');
            } catch (err) {
                console.error('Fallback copy method failed:', err);
                return;
            } finally {
                textArea.remove();
            }
        }
    };

    copyToClipboard().then(() => {
        // Show a temporary "Copied!" tooltip
        const tooltip = document.createElement('div');
        tooltip.className = 'copy-tooltip';
        tooltip.textContent = 'Copied!';
        document.body.appendChild(tooltip);
        
        // Position tooltip to the side of the message
        const rect = messageElement.getBoundingClientRect();
        const isOwnMessage = messageElement.classList.contains('own-message');
        
        if (isOwnMessage) {
            // For own messages, show tooltip on the left
            tooltip.style.left = `${rect.left - 80}px`;
        } else {
            // For received messages, show tooltip on the right
            tooltip.style.left = `${rect.right + 20}px`;
        }
        
        // Center vertically
        tooltip.style.top = `${rect.top + (rect.height / 2)}px`;
        tooltip.style.transform = 'translateY(-50%)';
        
        // Force a reflow to ensure the transition works
        tooltip.offsetHeight;
        
        // Add show class to trigger animation
        tooltip.classList.add('show');
        
        // Remove tooltip after 2 seconds
        setTimeout(() => {
            tooltip.classList.remove('show');
            // Wait for fade out animation to complete before removing
            setTimeout(() => {
                tooltip.remove();
            }, 200);
        }, 1800);
    });
}

// Handle edit
function handleEdit(messageElement) {
    
    const messageText = messageElement.querySelector('.text');
    const originalText = messageText.textContent;
    
    // Create edit input
    const editInput = document.createElement('input');
    editInput.type = 'text';
    editInput.value = originalText;
    editInput.className = 'message-edit-input';
    
    // Replace text with input
    messageText.replaceWith(editInput);
    editInput.focus();
    editInput.select();

    // Handle edit completion
    const finishEdit = () => {
        const newText = editInput.value.trim();
        if (newText && newText !== originalText) {
            messageText.textContent = newText;
            // TODO: Update message in database
            UpdateMessage(messageElement, newText);
        } else {
            messageText.textContent = originalText;
        }
        editInput.replaceWith(messageText);
    };

    // Handle edit submission
    editInput.addEventListener('blur', finishEdit);
    editInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            finishEdit();
        } else if (e.key === 'Escape') {
            editInput.value = originalText;
            finishEdit();
        }
    });
}

async function UpdateMessage(messEl, updatedText){
    let newMess = messages;
    newMess[parseInt(messEl.querySelector('.messId').innerHTML)] = updatedText;

    const { data, error } = await db
      .from('Chats') 
      .update({messages: newMess}) 
      .eq('chat_id', currentChat); 
    
    
}

// Handle unsend (delete for everyone)
function handleUnsend(messageElement) {
    customConfirm('Do you really want to unsend this message? This action cannot be undone.')
        .then((userConfirmation) => {
            if(userConfirmation){
                messageElement.style.opacity = '0.5';
                const text = messageElement.querySelector('.text');
                text.textContent = 'This message was unsent';
                text.style.fontStyle = 'italic';
                UnsendMessage(messageElement);
            }
        })

    
}

function customConfirm(message){
    return new Promise((resolve) =>{
        let popup = document.createElement('div');
        popup.style.position = 'fixed';
        
        popup.style.height = '30vh';

        popup.classList.add('popup');

        popup.style.top = '35vh';
       

        popup.style.backgroundColor = 'white';

        popup.style.border = '2px solid #FDA523';
        popup.style.borderRadius = '8px';
        popup.style.padding = '20px';
     
        popup.style.boxShadow = '0px 4px 8px rgba(0,0,0,0.2)';
        popup.style.zIndex = '9999';

        let x = document.createElement('i');
        x.classList.add("fa-regular");
        x.classList.add("fa-trash");
        popup.appendChild(x);

        let title = document.createElement('h2');
        title.innerHTML = 'Are you sure?';
        popup.appendChild(title);


        let text = document.createElement('p');
        text.innerText = message;
        popup.appendChild(text);
        let btns = document.createElement('div');
        btns.classList.add("btnsMenu");
        let yesButton = document.createElement('button');
        yesButton.innerText = 'Yes';
        yesButton.onclick = () => {
            document.body.removeChild(popup);
            resolve(true);
        };
        btns.appendChild(yesButton);

        const noButton = document.createElement('button');
        noButton.innerText = 'No';
        noButton.onclick = () => {
            document.body.removeChild(popup);
            resolve(false);
        };
        btns.appendChild(noButton);
        popup.appendChild(btns);

        document.body.appendChild(popup);
    });

}

async function UnsendMessage(messEl){
    let newMess = messages;
    newMess.splice(parseInt(messEl.querySelector('.messId').innerHTML), 1);
    let newSend = sendlers;
    newSend.splice(parseInt(messEl.querySelector('.messId').innerHTML), 1);
    let newTime = timers;
    newTime.splice(parseInt(messEl.querySelector('.messId').innerHTML), 1);

    const { data, error } = await db
      .from('Chats') 
      .update({messages: newMess, senders: newSend, times: newTime}) 
      .eq('chat_id', currentChat); 
}


// Handle delete (delete for me)
function handleDelete(messageElement) {
    customConfirm('Are you sure you want to delete this message? This will only remove it from your view.')
        .then((userConfirmation) =>{
            if(userConfirmation){
                messageElement.style.opacity = '0.5';
                const text = messageElement.querySelector('.text');
                text.textContent = 'This message was deleted';
                text.style.fontStyle = 'italic';
                DeleteMessage(messageElement);
            }
        })
    
}

async function DeleteMessage(messEl){

    let newMess = messages;
    newMess[parseInt(messEl.querySelector('.messId').innerHTML)] += "<deleted for='" + username + "' style='display:none'></deleted>";

    const { data, error } = await db
    .from('Chats') 
    .update({messages: newMess}) 
    .eq('chat_id', currentChat); 
}

// Add right-click handlers to all messages
document.addEventListener('DOMContentLoaded', () => {
    const chatMessages = document.getElementById('chat-messages');
    
    // Use event delegation for dynamically added messages
    chatMessages.addEventListener('contextmenu', (e) => {
        e.preventDefault(); // Prevent default context menu
        const message = e.target.closest('.message');
        if (message) {
            // Add squish animation
            message.classList.add('squish');
            // Remove the class after animation completes
            setTimeout(() => {
                message.classList.remove('squish');
            }, 300);
            
            const isOwnMessage = message.classList.contains('own-message');
            createMessageMenu(message, isOwnMessage);
        }
    });

    // MOBILE: Tap handler for push-up effect
    chatMessages.addEventListener('click', (e) => {
        if (window.innerWidth > 768) return; // Only on mobile
        if (window.isSelectionMode && window.isSelectionMode()) return;
        const message = e.target.closest('.message');
        if (!message) return;

        // Always remove previous push-up classes before applying new ones
        document.querySelectorAll('.message.push-up-above').forEach(m => m.classList.remove('push-up-above'));

        // Find all next siblings (above, due to column-reverse)
        let next = message.nextElementSibling;
        while (next) {
            if (next.classList.contains('message')) {
                next.classList.add('push-up-above');
            }
            next = next.nextElementSibling;
        }
    });

    // GLOBAL: Remove push-up effect if clicking outside messages or popups (mobile only)
    document.addEventListener('click', (e) => {
        if (window.innerWidth > 768) return;
        const isMessage = e.target.closest('.message');
        const isPopup = e.target.closest('.message-popup');
        if (!isMessage && !isPopup) {
            const pushedMessages = document.querySelectorAll('.message.push-up-above');
            pushedMessages.forEach(m => m.offsetHeight); // Force reflow
            pushedMessages.forEach(m => m.classList.remove('push-up-above'));
        }
    });

    // MOBILE: Scroll-in animation for messages (dynamic)
    if (window.innerWidth <= 768) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.intersectionRatio > 0.3) {
                    entry.target.classList.add('visible');
                } else if (entry.intersectionRatio === 0) {
                    entry.target.classList.remove('visible');
                }
            });
        }, {
            threshold: [0, 0.3]
        });

        function observeMessages() {
            document.querySelectorAll('.message').forEach(msg => {
                if (!msg.classList.contains('message-scroll-animate')) {
                    msg.classList.add('message-scroll-animate');
                    observer.observe(msg);
                }
            });
        }
        observeMessages();

        // MutationObserver to handle dynamically added messages
        const chatMessages = document.getElementById('chat-messages');
        const mutationObserver = new MutationObserver(() => {
            observeMessages();
        });
        mutationObserver.observe(chatMessages, { childList: true, subtree: true });
    }
}); 