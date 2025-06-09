// Image upload functionality for chat application

document.addEventListener('DOMContentLoaded', () => {
    // Get DOM elements
    const plusButton = document.querySelector('.input-actions.left .fa-plus');
    const chatInput = document.getElementById('chatInput');
    let imageUploadContainer = null;
    
    // Create image upload container if it doesn't exist
    function createImageUploadContainer() {
        if (!imageUploadContainer) {
            imageUploadContainer = document.createElement('div');
            imageUploadContainer.id = 'imageUploadContainer';
            imageUploadContainer.className = 'image-upload-container';
            
            // Create the content of the popup
            const uploadContent = document.createElement('div');
            uploadContent.className = 'upload-content';
            
            // Create header
            const header = document.createElement('div');
            header.className = 'upload-header';
            header.innerHTML = '<h3>Upload Image</h3><button class="close-upload"><i class="fa-solid fa-xmark"></i></button>';
            
            // Create upload area
            const uploadArea = document.createElement('div');
            uploadArea.className = 'upload-area';
            uploadArea.innerHTML = '<i class="fa-solid fa-cloud-arrow-up"></i><p>Click to select an image or drag and drop</p>';
            
            // Create file input (hidden)
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.id = 'imageFileInput';
            fileInput.accept = 'image/*';
            fileInput.style.display = 'none';
            
            // Create preview area
            const previewArea = document.createElement('div');
            previewArea.className = 'preview-area';
            previewArea.style.display = 'none';
            
            // Create upload button
            const uploadButton = document.createElement('button');
            uploadButton.className = 'upload-button';
            uploadButton.textContent = 'Send Image';
            uploadButton.style.display = 'none';
            
            // Append all elements
            uploadContent.appendChild(header);
            uploadContent.appendChild(uploadArea);
            uploadContent.appendChild(fileInput);
            uploadContent.appendChild(previewArea);
            uploadContent.appendChild(uploadButton);
            
            imageUploadContainer.appendChild(uploadContent);
            document.querySelector('.main-chat').appendChild(imageUploadContainer);
            
            // Add event listeners
            header.querySelector('.close-upload').addEventListener('click', () => {
                toggleImageUpload(false);
            });
            
            uploadArea.addEventListener('click', () => {
                fileInput.click();
            });
            
            // Drag and drop functionality
            uploadArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                uploadArea.classList.add('dragover');
            });
            
            uploadArea.addEventListener('dragleave', () => {
                uploadArea.classList.remove('dragover');
            });
            
            uploadArea.addEventListener('drop', (e) => {
                e.preventDefault();
                uploadArea.classList.remove('dragover');
                
                if (e.dataTransfer.files.length) {
                    handleFile(e.dataTransfer.files[0]);
                }
            });
            
            fileInput.addEventListener('change', () => {
                if (fileInput.files.length) {
                    handleFile(fileInput.files[0]);
                }
            });
            
            uploadButton.addEventListener('click', () => {
                // Here you would typically upload the image to your server or storage
                // For now, we'll just simulate sending the image to the chat
                const imageUrl = previewArea.querySelector('img').src;
                sendImageToChat(imageUrl);
                toggleImageUpload(false);
                resetUpload();
            });
        }
    }
    
    // Handle the selected file
    function handleFile(file) {
        if (!file.type.match('image.*')) {
            alert('Please select an image file');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            const previewArea = document.querySelector('.preview-area');
            const uploadArea = document.querySelector('.upload-area');
            const uploadButton = document.querySelector('.upload-button');
            
            // Show preview
            previewArea.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
            previewArea.style.display = 'block';
            uploadArea.style.display = 'none';
            uploadButton.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
    
    // Reset upload form
    function resetUpload() {
        const previewArea = document.querySelector('.preview-area');
        const uploadArea = document.querySelector('.upload-area');
        const uploadButton = document.querySelector('.upload-button');
        const fileInput = document.getElementById('imageFileInput');
        
        previewArea.innerHTML = '';
        previewArea.style.display = 'none';
        uploadArea.style.display = 'flex';
        uploadButton.style.display = 'none';
        fileInput.value = '';
    }
    
    // Send image to chat (placeholder function)
    function sendImageToChat(imageUrl) {
        // Compose the HTML string for the image
        const imgHtml = `<img src="${imageUrl}" alt="uploaded image" class="chat-image" style="max-width: 200px; max-height: 200px; cursor: pointer;" />`;
        // Set the chat input value to the image HTML
        chatInput.value = imgHtml;
        // Create and dispatch an Enter key event to trigger the normal send logic
        const enterEvent = new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', which: 13, keyCode: 13, bubbles: true });
        chatInput.dispatchEvent(enterEvent);
    }
    
    // Toggle image upload popup
    function toggleImageUpload(show) {
        if (!imageUploadContainer) {
            createImageUploadContainer();
        }
        
        if (show === undefined) {
            imageUploadContainer.classList.toggle('active');
            plusButton.classList.toggle('active');
        } else if (show) {
            imageUploadContainer.classList.add('active');
            plusButton.classList.add('active');
        } else {
            imageUploadContainer.classList.remove('active');
            plusButton.classList.remove('active');
        }
    }
    
    // Add click event to plus button
    if (plusButton) {
        plusButton.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleImageUpload();
        });
        console.log('Image upload button event listener added');
    } else {
        console.error('Plus button not found');
    }
    
    // Close image upload when clicking outside
    document.addEventListener('click', (e) => {
        if (imageUploadContainer && 
            !imageUploadContainer.contains(e.target) && 
            e.target !== plusButton) {
            imageUploadContainer.classList.remove('active');
            plusButton.classList.remove('active');
        }
    });
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('chat-image')) {
            openImageViewer(e.target.src);
        }
    });
    
    function openImageViewer(src) {
        // Create overlay
        const overlay = document.createElement('div');
        overlay.style.position = 'fixed';
        overlay.style.top = 0;
        overlay.style.left = 0;
        overlay.style.width = '100vw';
        overlay.style.height = '100vh';
        overlay.style.background = 'rgba(0,0,0,0.9)';
        overlay.style.display = 'flex';
        overlay.style.alignItems = 'center';
        overlay.style.justifyContent = 'center';
        overlay.style.zIndex = 9999;
    
        // Create image
        const img = document.createElement('img');
        img.src = src;
        img.style.maxWidth = '90vw';
        img.style.maxHeight = '90vh';
        img.style.transition = 'transform 0.2s';
        img.style.cursor = 'zoom-in';
        let scale = 1;
    
        // Zoom in/out on wheel
        img.addEventListener('wheel', function(e) {
            e.preventDefault();
            scale += e.deltaY < 0 ? 0.1 : -0.1;
            scale = Math.max(1, Math.min(5, scale));
            img.style.transform = `scale(${scale})`;
        });
    
        // Close on overlay click
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) document.body.removeChild(overlay);
        });
    
        overlay.appendChild(img);
        document.body.appendChild(overlay);
    }
});