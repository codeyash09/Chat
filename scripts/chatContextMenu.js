// Chat context menu functionality
let contextMenu = null;
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

function createContextMenu() {
    // Remove existing context menu if any
    if (contextMenu) {
        document.body.removeChild(contextMenu);
    }

    // Create new context menu
    contextMenu = document.createElement('div');
    contextMenu.className = 'chat-context-menu';
    contextMenu.style.display = 'none';
    contextMenu.style.position = 'fixed';
    contextMenu.style.zIndex = '1000';
    contextMenu.style.touchAction = 'none';

    // Add menu items
    const menuItems = [
        { text: 'Chat Settings', icon: 'fa-gear', action: 'settings' },
        { text: 'Mute Notifications', icon: 'fa-bell-slash', action: 'mute' },
        { text: 'Clear Chat', icon: 'fa-trash', action: 'clear' },
        { text: 'Leave Chat', icon: 'fa-right-from-bracket', action: 'leave' }
    ];

    menuItems.forEach(item => {
        const menuItem = document.createElement('div');
        menuItem.className = 'context-menu-item';
        menuItem.innerHTML = `
            <i class="fa-solid ${item.icon}"></i>
            <span>${item.text}</span>
        `;

        menuItem.addEventListener('click', () => {
            handleContextMenuAction(item.action);
            hideContextMenu();
        });

        menuItem.addEventListener('touchstart', (e) => {
            e.preventDefault();
        }, { passive: false });

        menuItem.addEventListener('touchmove', (e) => {
            e.preventDefault();
        }, { passive: false });

        contextMenu.appendChild(menuItem);
    });

    contextMenu.addEventListener('touchstart', (e) => {
        e.preventDefault();
    }, { passive: false });

    contextMenu.addEventListener('touchmove', (e) => {
        e.preventDefault();
    }, { passive: false });

    document.body.appendChild(contextMenu);
}

function showContextMenu(event, chatId) {
    event.preventDefault();
    
    if (!contextMenu) {
        createContextMenu();
    }
    console.log("hi");
    // Store the chat ID for the menu actions
    contextMenu.dataset.chatId = chatId;

    // Show the menu first to calculate its dimensions
    contextMenu.style.display = 'block';
    const menuRect = contextMenu.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;

    // Calculate position with larger boundary padding
    let left = event.pageX;
    let top = event.pageY;
    const boundaryPadding = 30; // Increased from 10 to 30

    // If menu would overflow right edge, position it to the left of the cursor
    if (left + menuRect.width > viewportWidth - boundaryPadding) {
        left = Math.max(boundaryPadding, event.pageX - menuRect.width);
    }

    // If menu would overflow bottom edge, position it above the cursor
    if (top + menuRect.height > viewportHeight - boundaryPadding) {
        top = Math.max(boundaryPadding, event.pageY - menuRect.height);
    }

    // If menu would overflow left edge, ensure it's at least boundaryPadding from the left
    if (left < boundaryPadding) {
        left = boundaryPadding;
    }

    // If menu would overflow top edge, ensure it's at least boundaryPadding from the top
    if (top < boundaryPadding) {
        top = boundaryPadding;
    }

    // Apply the calculated position
    contextMenu.style.left = `${left}px`;
    contextMenu.style.top = `${top}px`;
}

function hideContextMenu() {
    if (contextMenu) {
        contextMenu.style.display = 'none';
    }
}

async function handleContextMenuAction(action) {
    const chatId = contextMenu.dataset.chatId;
    
    switch (action) {
        case 'settings':
            // TODO: Implement chat settings
            console.log('Opening settings for chat:', chatId);
            break;
        case 'mute':
            // TODO: Implement mute notifications
            console.log('Muting notifications for chat:', chatId);
            break;
        case 'clear':
            let newMess = messages;

            for(let i = 0; i < messages.length; i++){
                newMess[i] += "<deleted for='" + username + "' style='display:none'></deleted>";
            }

            const { data, error } = await db
                .from('Chats') 
                .update({messages: newMess}) 
                .eq('chat_id', chatId); 
            
            break;
        case 'leave':
            // TODO: Implement leave chat
            console.log('Leaving chat:', chatId);
            break;
    }
}


// Close context menu when clicking outside
document.addEventListener('click', (event) => {
    contextMenu = document.querySelector('.chat-context-menu'); 
    if (contextMenu && !contextMenu.contains(event.target)) {
        hideContextMenu();
    }
});
// Close context menu when clicking outside
document.addEventListener('focus', (event) => {
    contextMenu = document.querySelector('.chat-context-menu'); 

    if (contextMenu && !contextMenu.contains(event.target)) {
        hideContextMenu();
    }
});

document.querySelector(".homeBtn").addEventListener('click', (event) => {
    contextMenu = document.querySelector('.chat-context-menu'); 

    if (contextMenu && !contextMenu.contains(event.target)) {
        hideContextMenu();
    }
});




// Prevent context menu from showing on right-click of the menu itself
document.addEventListener('contextmenu', (event) => {
    if (contextMenu && contextMenu.contains(event.target)) {
        event.preventDefault();
    }
});

export { showContextMenu }; 