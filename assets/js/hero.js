// Hero section functionality
document.addEventListener('DOMContentLoaded', function() {
    const heroSection = document.querySelector('.hero-section');
    if (!heroSection) return;

    // Add animation class after a short delay
    setTimeout(() => {
        heroSection.classList.add('animate');
    }, 100);

    // Handle scroll animations
    const handleScroll = () => {
        const scrollPosition = window.scrollY;
        const heroHeight = heroSection.offsetHeight;
        
        if (scrollPosition < heroHeight) {
            const opacity = 1 - (scrollPosition / heroHeight);
            heroSection.style.opacity = opacity;
        }
    };

    window.addEventListener('scroll', handleScroll);
}); 