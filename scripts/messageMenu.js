import {currentChat, messages, sendlers, timers } from "/scripts/chats.js";
import {db} from '/scripts/createChat.js';


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
        // Get the emoji picker element
        const emojiPicker = document.querySelector('em-emoji-picker');
        if (emojiPicker) {
            // Position the emoji picker near the plus button
            const rect = customEmojiButton.getBoundingClientRect();
            emojiPicker.style.position = 'fixed';
            emojiPicker.style.left = `${rect.left - 320}px`; // Move 320px to the left
            emojiPicker.style.top = `${rect.bottom + 10}px`;
            emojiPicker.style.zIndex = '1000';
            emojiPicker.style.display = 'block';

            // Add click handler for emoji selection
            const handleEmojiSelect = (e) => {
                if (e.detail && e.detail.emoji) {
                    handleEmojiReaction(e.detail.emoji, messageElement);
                    emojiPicker.style.display = 'none';
                    popup.classList.remove('show');
                    emojiPicker.removeEventListener('emoji-click', handleEmojiSelect);
                }
            };

            emojiPicker.addEventListener('emoji-click', handleEmojiSelect);
        }
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

        // Delete (unsend) button for own messages
        const deleteButton = document.createElement('button');
        deleteButton.className = 'message-popup-action delete-action';
        deleteButton.innerHTML = '<i class="fa-solid fa-trash"></i> Unsend';
        deleteButton.addEventListener('click', () => {
            handleUnsend(messageElement);
            popup.classList.remove('show');
        });
        actionsSection.appendChild(deleteButton);
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
    
    // Check if message is near the bottom of the chat
    const chatMessages = document.getElementById('chat-messages');
    const chatRect = chatMessages.getBoundingClientRect();
    const isRecentMessage = rect.bottom > chatRect.bottom - 200; // If message is within 200px of bottom
    const isVeryRecentMessage = rect.bottom > chatRect.bottom - 100; // If message is within 100px of bottom
    const isSecondMostRecent = rect.bottom > chatRect.bottom - 150 && rect.bottom <= chatRect.bottom - 100; // If message is between 100-150px from bottom
    
    // Position based on message type
    if (isOwnMessage) {
        // For own messages, position to the left of the message
        popup.style.left = `${rect.left - 220}px`; // Move 220px to the left (was 245px)
        popup.style.top = isVeryRecentMessage ? `${rect.top - 200}px` : 
                         isSecondMostRecent ? `${rect.top - 200}px` :
                         isRecentMessage ? `${rect.top - 120}px` : 
                         `${rect.top - 80}px`; // Move higher for very recent messages
    } else {
        // For received messages, position to the right side of the message
        popup.style.left = `${rect.right + 20}px`; // Move 20px to the right (was 30px)
        popup.style.top = isVeryRecentMessage ? `${rect.top - 200}px` : 
                         isRecentMessage ? `${rect.top - 120}px` : 
                         `${rect.top - 80}px`; // Move higher for very recent messages
    }
    
    // Add to document
    document.body.appendChild(popup);
    
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
            
            // Remove popup after animations complete
            setTimeout(() => {
                popup.remove();
            }, 800);
            
            document.removeEventListener('mousemove', closePopup);
            document.removeEventListener('scroll', closePopup);
            return;
        }

        // For mouse movement, check distance
        const isOverPopup = popup.contains(e.target);
        const isOverMessage = messageElement.contains(e.target);
        const isOverEmojiPicker = e.target.closest('em-emoji-picker');
        
        // If cursor is over popup or emoji picker, don't close
        if (isOverPopup || isOverEmojiPicker) {
            return;
        }
        
        // Get popup position
        const popupRect = popup.getBoundingClientRect();
        const messageRect = messageElement.getBoundingClientRect();
        
        // Calculate distance from popup and message
        const distanceFromPopup = Math.min(
            Math.abs(e.clientX - popupRect.left),
            Math.abs(e.clientX - popupRect.right),
            Math.abs(e.clientY - popupRect.top),
            Math.abs(e.clientY - popupRect.bottom)
        );
        
        const distanceFromMessage = Math.min(
            Math.abs(e.clientX - messageRect.left),
            Math.abs(e.clientX - messageRect.right),
            Math.abs(e.clientY - messageRect.top),
            Math.abs(e.clientY - messageRect.bottom)
        );
        
        // If cursor is not over message and is far enough away
        if (!isOverMessage && distanceFromMessage > 30) {
            // Add falling animation to emojis
            const emojis = popup.querySelectorAll('.emoji-reaction');
            emojis.forEach((emoji, index) => {
                setTimeout(() => {
                    emoji.classList.add('falling');
                }, index * 100);
            });

            // Add closing animation to popup
            popup.classList.add('closing');
            
            // Remove popup after animations complete
            setTimeout(() => {
                popup.remove();
            }, 800);
            
            document.removeEventListener('mousemove', closePopup);
            document.removeEventListener('scroll', closePopup);
        }
    };
    
    // Use mousemove instead of click for smoother cursor tracking
    document.addEventListener('mousemove', closePopup);
    // Add scroll event listener
    document.addEventListener('scroll', closePopup, true);
}

// Handle emoji reactions
function handleEmojiReaction(emoji, messageElement) {
    // Get or create reactions container
    let reactionsContainer = messageElement.querySelector('.message-reactions');
    if (!reactionsContainer) {
        reactionsContainer = document.createElement('div');
        reactionsContainer.className = 'message-reactions';
        messageElement.children[1].children[1].appendChild(reactionsContainer); // Changed from .content to messageElement
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

    UpdateMessageReact(messageElement, messageElement.children[1].children[1].innerHTML);
}

async function UpdateMessageReact(messEl, updatedText){
    let newMess = messages;
    newMess[parseInt(messEl.querySelector('.messId').innerHTML)] = updatedText;

    const { data, error } = await db
      .from('Chats') 
      .update({messages: newMess}) 
      .eq('chat_id', currentChat); 
}

// Handle reply
function handleReply(messageElement) {
    const sender = messageElement.querySelector('.username').textContent;
    const messageText = messageElement.querySelector('.text').textContent;
    const chatInput = document.getElementById('chatInput');













    chatInput.value = `<div class="replyMessage"><div class="replyUser">${sender}</div><div class="replyContent">${messageText}</div></div>`;
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
        popup.style.width = '15vw';
        popup.style.height = '30vh';

        popup.classList.add('popup');

        popup.style.top = '35vh';
        popup.style.left = '42.5vw';

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
    if (confirm('Are you sure you want to delete this message? This will only remove it from your view.')) {
        // TODO: Update message in database to show as deleted for this user
        messageElement.style.display = 'none';
        console.log('Message deleted for user');
    }
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
}); 