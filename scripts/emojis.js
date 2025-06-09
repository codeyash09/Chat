// Emoji picker functionality for chat application

document.addEventListener('DOMContentLoaded', () => {
    // Get DOM elements
    const emojiButton = document.querySelector('.fa-face-smile');
    const chatInput = document.getElementById('chatInput');
    let emojiPickerContainer = null;
    let emojiPicker = null;
    
    // Create emoji picker container if it doesn't exist
    function createEmojiPickerContainer() {
        if (!emojiPickerContainer) {
            emojiPickerContainer = document.createElement('div');
            emojiPickerContainer.id = 'emojiPickerContainer';
            emojiPickerContainer.className = 'emoji-picker-container';
            document.querySelector('.main-chat').appendChild(emojiPickerContainer);
        }
    }
    
    // Initialize emoji-mart
    async function initEmojiPicker() {
        if (emojiPicker) return;
        
        try {
            // Create container if it doesn't exist
            createEmojiPickerContainer();
            
            // Initialize emoji-mart data
            if (window.EmojiMart) {
                // Create the picker
                emojiPicker = new EmojiMart.Picker({
                    onEmojiSelect: (emoji) => {
                        // Insert emoji at cursor position
                        const cursorPos = chatInput.selectionStart;
                        const text = chatInput.value;
                        const newText = text.slice(0, cursorPos) + emoji.native + text.slice(cursorPos);
                        chatInput.value = newText;
                        chatInput.focus();
                        chatInput.selectionStart = cursorPos + emoji.native.length;
                        chatInput.selectionEnd = cursorPos + emoji.native.length;
                    },
                    theme: 'light',
                    emojiSize: 20,
                    perLine: 8,
                    previewPosition: 'none',
                    skinTonePosition: 'none',
                    maxFrequentRows: 4,
                    categories: ['frequent', 'people', 'nature', 'foods', 'activity', 'places', 'objects', 'symbols', 'flags'],
                });
                
                emojiPickerContainer.appendChild(emojiPicker);
                console.log('Emoji picker initialized');
            } else {
                console.error('EmojiMart library not loaded');
            }
        } catch (error) {
            console.error('Error initializing emoji picker:', error);
        }
    }
    
    // Toggle emoji picker
    function toggleEmojiPicker() {
        if (!emojiPickerContainer) {
            createEmojiPickerContainer();
        }
        
        if (!emojiPicker) {
            initEmojiPicker();
        }
        
        // Toggle visibility
        if (emojiPickerContainer.classList.contains('active')) {
            emojiPickerContainer.classList.remove('active');
            emojiButton.classList.remove('emoji-button-active');
        } else {
            emojiPickerContainer.classList.add('active');
            emojiButton.classList.add('emoji-button-active');
            
            // Close GIF picker if it's open
            const gifPickerContainer = document.getElementById('gifPickerContainer');
            if (gifPickerContainer && gifPickerContainer.classList.contains('active')) {
                gifPickerContainer.classList.remove('active');
                document.querySelector('#gifButton').classList.remove('gif-button-active');
            }
        }
    }
    
    // Add click event to emoji button
    if (emojiButton) {
        emojiButton.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleEmojiPicker();
        });
        console.log('Emoji button event listener added');
    } else {
        console.error('Emoji button not found');
    }
    
    // Close emoji picker when clicking outside
    document.addEventListener('click', (e) => {
        if (emojiPickerContainer && !emojiPickerContainer.contains(e.target) && e.target !== emojiButton) {
            emojiPickerContainer.classList.remove('active');
            emojiButton.classList.remove('emoji-button-active');
        }
    });
});