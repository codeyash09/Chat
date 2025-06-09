let isSelectionMode = false;
let selectedMessages = new Set();
let lastClickTime = 0;
const DOUBLE_CLICK_DURATION = 300; // 300ms for double click

// Initialize selection mode functionality
function initMessageSelection() {
    const chatMessages = document.getElementById('chat-messages');
    const selectionMode = document.getElementById('selectionMode');
    const selectedCount = document.getElementById('selectedCount');
    const deleteSelected = document.getElementById('deleteSelected');
    const cancelSelection = document.getElementById('cancelSelection');

    // Handle clicks on messages
    chatMessages.addEventListener('click', (e) => {
        const message = e.target.closest('.message');
        if (!message || !message.dataset.messageId) return;

        const currentTime = new Date().getTime();
        const timeDiff = currentTime - lastClickTime;

        if (timeDiff < DOUBLE_CLICK_DURATION && !isSelectionMode) {
            // Double click detected - enter selection mode
            enterSelectionMode();
            selectMessage(message);
        } else if (isSelectionMode) {
            // Single click in selection mode - toggle selection
            e.preventDefault();
            e.stopPropagation();
            toggleMessageSelection(message);
        }

        lastClickTime = currentTime;
    });

    // Add hover effect for messages in selection mode
    chatMessages.addEventListener('mouseover', (e) => {
        if (!isSelectionMode) return;
        
        const message = e.target.closest('.message');
        if (!message) return;
        
        message.classList.add('selection-hover');
    });

    chatMessages.addEventListener('mouseout', (e) => {
        const message = e.target.closest('.message');
        if (!message) return;
        
        message.classList.remove('selection-hover');
    });

    // Handle delete selected messages
    deleteSelected.addEventListener('click', async () => {
        if (selectedMessages.size === 0) return;

        if (confirm(`Are you sure you want to delete ${selectedMessages.size} message(s)?`)) {
            for (const messageId of selectedMessages) {
                const message = document.querySelector(`.message[data-message-id="${messageId}"]`);
                if (message) {
                    await deleteMessage(messageId);
                }
            }
            exitSelectionMode();
        }
    });

    // Handle cancel selection
    cancelSelection.addEventListener('click', exitSelectionMode);

    // Add escape key handler to exit selection mode
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isSelectionMode) {
            exitSelectionMode();
        }
    });

    // Prevent text selection while in selection mode
    chatMessages.addEventListener('selectstart', (e) => {
        if (isSelectionMode) {
            e.preventDefault();
        }
    });
}

function enterSelectionMode() {
    if (isSelectionMode) return;
    
    isSelectionMode = true;
    document.getElementById('selectionMode').classList.add('active');
    document.body.style.userSelect = 'none';
    
    const chatMessages = document.getElementById('chat-messages');
    chatMessages.classList.add('selection-mode-active');

    // Add a tooltip or instruction
    const tooltip = document.createElement('div');
    tooltip.className = 'selection-tooltip';
    tooltip.textContent = 'Click messages to select them';
    document.body.appendChild(tooltip);
    
    setTimeout(() => {
        tooltip.remove();
    }, 2000);
}

function exitSelectionMode() {
    isSelectionMode = false;
    selectedMessages.clear();
    document.getElementById('selectionMode').classList.remove('active');
    document.getElementById('selectedCount').textContent = '0';
    document.body.style.userSelect = '';
    
    document.querySelectorAll('.message.selected, .message.selection-hover').forEach(message => {
        message.classList.remove('selected', 'selection-hover');
    });

    const chatMessages = document.getElementById('chat-messages');
    chatMessages.classList.remove('selection-mode-active');
}

function selectMessage(message) {
    if (!message.dataset.messageId) return;
    
    selectedMessages.add(message.dataset.messageId);
    message.classList.add('selected');
    updateSelectionCount();
}

function toggleMessageSelection(message) {
    if (!message.dataset.messageId) return;
    
    const messageId = message.dataset.messageId;
    
    if (selectedMessages.has(messageId)) {
        selectedMessages.delete(messageId);
        message.classList.remove('selected');
    } else {
        selectedMessages.add(messageId);
        message.classList.add('selected');
    }

    updateSelectionCount();

    if (selectedMessages.size === 0) {
        exitSelectionMode();
    }
}

function updateSelectionCount() {
    document.getElementById('selectedCount').textContent = selectedMessages.size;
}

// Initialize when the DOM is loaded
document.addEventListener('DOMContentLoaded', initMessageSelection);

export { initMessageSelection }; 