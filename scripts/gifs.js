// GIF picker functionality for chat application using Giphy API

document.addEventListener('DOMContentLoaded', () => {
    // Giphy API key
    const GIPHY_API_KEY = 'yFTq60mZg1NjOKpGnyw7lZw8RFL9knnh';
    
    // Get DOM elements
    const gifButton = document.querySelector('#gifButton'); // Changed to select by ID
    const chatInput = document.getElementById('chatInput');
    let gifPickerContainer = null;
    
    // Create GIF picker container if it doesn't exist
    function createGifPickerContainer() {
        if (!gifPickerContainer) {
            gifPickerContainer = document.createElement('div');
            gifPickerContainer.id = 'gifPickerContainer';
            gifPickerContainer.className = 'gif-picker-container';
            
            // Create search input
            const searchContainer = document.createElement('div');
            searchContainer.className = 'gif-search-container';
            
            const searchInput = document.createElement('input');
            searchInput.type = 'text';
            searchInput.placeholder = 'Search GIFs...';
            searchInput.className = 'gif-search-input';
            
            const searchButton = document.createElement('button');
            searchButton.className = 'gif-search-button';
            searchButton.innerHTML = '<i class="fa-solid fa-search"></i>';
            
            searchContainer.appendChild(searchInput);
            searchContainer.appendChild(searchButton);
            
            // Create GIF results container
            const resultsContainer = document.createElement('div');
            resultsContainer.className = 'gif-results-container';
            
            // Add elements to the main container
            gifPickerContainer.appendChild(searchContainer);
            gifPickerContainer.appendChild(resultsContainer);
            
            document.querySelector('.main-chat').appendChild(gifPickerContainer);
            
            // Add event listeners for search
            searchButton.addEventListener('click', () => {
                searchGifs(searchInput.value);
            });
            
            searchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    searchGifs(searchInput.value);
                }
            });
            
            // Load trending GIFs by default
            loadTrendingGifs();
        }
    }
    
    // Load trending GIFs
    async function loadTrendingGifs() {
        try {
            const response = await fetch(`https://api.giphy.com/v1/gifs/trending?api_key=${GIPHY_API_KEY}&limit=20`);
            const data = await response.json();
            displayGifs(data.data);
        } catch (error) {
            console.error('Error loading trending GIFs:', error);
        }
    }
    
    // Search GIFs
    async function searchGifs(query) {
        if (!query.trim()) {
            loadTrendingGifs();
            return;
        }
        
        try {
            const response = await fetch(`https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_API_KEY}&q=${encodeURIComponent(query)}&limit=20`);
            const data = await response.json();
            displayGifs(data.data);
        } catch (error) {
            console.error('Error searching GIFs:', error);
        }
    }
    
    // Display GIFs in the container
    function displayGifs(gifs) {
        const resultsContainer = document.querySelector('.gif-results-container');
        resultsContainer.innerHTML = '';
        
        if (gifs.length === 0) {
            resultsContainer.innerHTML = '<p class="no-results">No GIFs found</p>';
            return;
        }
        
        gifs.forEach(gif => {
            const gifItem = document.createElement('div');
            gifItem.className = 'gif-item';
            
            const gifImage = document.createElement('img');
            gifImage.src = gif.images.fixed_height_small.url;
            gifImage.alt = gif.title;
            gifImage.loading = 'lazy';
            
            gifItem.appendChild(gifImage);
            resultsContainer.appendChild(gifItem);
            
            // Add click event to insert GIF URL into chat
            gifItem.addEventListener('click', () => {
                insertGif(gif.images.original.url, gif.title);
                toggleGifPicker(); // Close the picker after selection
            });
        });
    }
    
    // Insert GIF into chat input
    function insertGif(url, title) {
        // For chat applications, you might want to send the GIF directly
        // Here we're creating a message with the GIF URL that will be rendered as an image
        const gifMessage = `<img src="${url}" alt="${title}" class="chat-gif">`;
        
        // Send the GIF message
        // This simulates clicking the send button with the GIF HTML
        chatInput.value = gifMessage;
        document.querySelector('.fa-paper-plane').click();
    }
    
    // Toggle GIF picker
    function toggleGifPicker() {
        if (!gifPickerContainer) {
            createGifPickerContainer();
        }
        
        // Toggle visibility
        if (gifPickerContainer.classList.contains('active')) {
            gifPickerContainer.classList.remove('active');
            gifButton.classList.remove('gif-button-active');
        } else {
            gifPickerContainer.classList.add('active');
            gifButton.classList.add('gif-button-active');
            
            // Close emoji picker if it's open
            const emojiPickerContainer = document.getElementById('emojiPickerContainer');
            if (emojiPickerContainer && emojiPickerContainer.classList.contains('active')) {
                emojiPickerContainer.classList.remove('active');
                document.querySelector('#emojiButton').classList.remove('emoji-button-active');
            }
        }
    }
    
    // Add click event to GIF button
    if (gifButton) {
        gifButton.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleGifPicker();
        });
        console.log('GIF button event listener added');
    } else {
        console.error('GIF button not found');
    }
    
    // Close GIF picker when clicking outside
    document.addEventListener('click', (e) => {
        if (gifPickerContainer && !gifPickerContainer.contains(e.target) && e.target !== gifButton) {
            gifPickerContainer.classList.remove('active');
            gifButton.classList.remove('gif-button-active');
        }
    });
});