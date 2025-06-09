document.addEventListener('DOMContentLoaded', function() {
    // Target the welcome text elements
    const welcomeHeading = document.querySelector('.welcome-text h1');
    const welcomeSubheading = document.querySelector('.welcome-text h2');
    const welcomeParagraph = document.querySelector('.welcome-text .bold-text');
    
    // Set initial styles - position elements above the viewport
    if (welcomeHeading) {
        welcomeHeading.style.opacity = '0';
        welcomeHeading.style.transform = 'translateY(-50px)';
        welcomeHeading.style.transition = 'opacity 0.8s ease, transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)';
    }
    
    if (welcomeSubheading) {
        welcomeSubheading.style.opacity = '0';
        welcomeSubheading.style.transform = 'translateY(-40px)';
        welcomeSubheading.style.transition = 'opacity 0.8s ease, transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)';
    }
    
    if (welcomeParagraph) {
        welcomeParagraph.style.opacity = '0';
        welcomeParagraph.style.transform = 'translateY(-30px)';
        welcomeParagraph.style.transition = 'opacity 0.8s ease, transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)';
    }
    
    // Trigger animations with slight delays for cascading effect
    setTimeout(() => {
        if (welcomeHeading) {
            welcomeHeading.style.opacity = '1';
            welcomeHeading.style.transform = 'translateY(0)';
        }
    }, 300);
    
    setTimeout(() => {
        if (welcomeSubheading) {
            welcomeSubheading.style.opacity = '1';
            welcomeSubheading.style.transform = 'translateY(0)';
        }
    }, 600);
    
    setTimeout(() => {
        if (welcomeParagraph) {
            welcomeParagraph.style.opacity = '1';
            welcomeParagraph.style.transform = 'translateY(0)';
        }
    }, 900);
});