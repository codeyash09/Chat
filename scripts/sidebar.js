document.addEventListener('DOMContentLoaded', function() {
    const sidebar = document.getElementById('sidebar');
    const collapseBtn = document.getElementById('collapseBtn');
    const mainContainer = document.getElementById('mainContainer');
    
    // Function to handle text visibility
    function updateTextVisibility() {
        const textElements = sidebar.querySelectorAll('.nav-text, .section-header span, .folder-name');
        textElements.forEach(function(element) {
            if (sidebar.classList.contains('collapsed')) {
                element.style.display = 'none';
            } else {
                element.style.display = '';
            }
        });
    }
    
    // Check if elements exist before adding event listeners
    if (collapseBtn && sidebar) {
        // Check localStorage for saved state when page loads
        if (localStorage.getItem('sidebarCollapsed') === 'true') {
            sidebar.classList.add('collapsed');
            if (mainContainer) {
                mainContainer.classList.add('expanded');
            }
            collapseBtn.classList.add('rotated');
            
            // Update text visibility immediately
            updateTextVisibility();
        }
        
        collapseBtn.addEventListener('click', function() {
            // Toggle collapsed class on sidebar
            sidebar.classList.toggle('collapsed');
            
            // Toggle expanded class on main container if it exists
            if (mainContainer) {
                mainContainer.classList.toggle('expanded');
            }
            
            // Toggle the direction of the chevron icon
            const icon = collapseBtn.querySelector('i');
            if (icon) {
                if (sidebar.classList.contains('collapsed')) {
                    icon.classList.remove('fa-chevron-left');
                    icon.classList.add('fa-chevron-right');
                } else {
                    icon.classList.remove('fa-chevron-right');
                    icon.classList.add('fa-chevron-left');
                }
            }
            
            // Update text visibility
            updateTextVisibility();
            
            // Save state to localStorage
            localStorage.setItem('sidebarCollapsed', sidebar.classList.contains('collapsed'));
        });
    }
});