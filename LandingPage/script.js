// ===== PRODUCTONEX LANDING PAGE JAVASCRIPT =====

// Global variables
let currentSlide = 0;
let totalSlides = 0;
let autoPlayInterval;
let isAutoPlayActive = true;
let isModalOpen = false;

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    initNavigation();
    initCarousel();
    initImageModal();
    initScrollAnimations();
    initParticles();
    initFloatingCards();
    initSmoothScrolling();
    initMobileMenu();
}

// ===== NAVIGATION =====
function initNavigation() {
    const navbar = document.getElementById('navbar');
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Navbar scroll effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
    
    // Active link highlighting
    const sections = document.querySelectorAll('section[id]');
    
    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (scrollY >= (sectionTop - 200)) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
}

// ===== CAROUSEL FUNCTIONALITY =====
function initCarousel() {
    const track = document.getElementById('carousel-track');
    const slides = document.querySelectorAll('.carousel-slide');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const dotsContainer = document.getElementById('carousel-dots');
    
    totalSlides = slides.length;
    
    // Create dots
    createDots();
    
    // Event listeners
    prevBtn.addEventListener('click', () => moveSlide(-1));
    nextBtn.addEventListener('click', () => moveSlide(1));
    
    // Touch/swipe support
    let startX = 0;
    let endX = 0;
    
    track.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
    });
    
    track.addEventListener('touchend', (e) => {
        endX = e.changedTouches[0].clientX;
        handleSwipe();
    });
    
    function handleSwipe() {
        const threshold = 50;
        const diff = startX - endX;
        
        if (Math.abs(diff) > threshold) {
            if (diff > 0) {
                moveSlide(1); // Swipe left - next slide
            } else {
                moveSlide(-1); // Swipe right - previous slide
            }
        }
    }
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (isModalOpen) return;
        
        if (e.key === 'ArrowLeft') {
            moveSlide(-1);
        } else if (e.key === 'ArrowRight') {
            moveSlide(1);
        }
    });
    
    // Auto-play
    startAutoPlay();
    
    // Pause on hover
    const carousel = document.querySelector('.modules-carousel');
    carousel.addEventListener('mouseenter', pauseAutoPlay);
    carousel.addEventListener('mouseleave', resumeAutoPlay);
}

function createDots() {
    const dotsContainer = document.getElementById('carousel-dots');
    dotsContainer.innerHTML = '';
    
    for (let i = 0; i < totalSlides; i++) {
        const dot = document.createElement('div');
        dot.className = 'carousel-dot';
        if (i === currentSlide) {
            dot.classList.add('active');
        }
        dot.addEventListener('click', () => goToSlide(i));
        dotsContainer.appendChild(dot);
    }
}

function moveSlide(direction) {
    currentSlide += direction;
    
    if (currentSlide < 0) {
        currentSlide = totalSlides - 1;
    } else if (currentSlide >= totalSlides) {
        currentSlide = 0;
    }
    
    updateCarousel();
}

function goToSlide(slideIndex) {
    currentSlide = slideIndex;
    updateCarousel();
}

function updateCarousel() {
    const track = document.getElementById('carousel-track');
    const translateX = -currentSlide * 100;
    
    track.style.transform = `translateX(${translateX}%)`;
    
    // Update dots
    const dots = document.querySelectorAll('.carousel-dot');
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentSlide);
    });
    
    // Update button states
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    
    if (prevBtn && nextBtn) {
        prevBtn.disabled = currentSlide === 0;
        nextBtn.disabled = currentSlide === totalSlides - 1;
    }
}

function startAutoPlay() {
    if (autoPlayInterval) {
        clearInterval(autoPlayInterval);
    }
    
    autoPlayInterval = setInterval(() => {
        if (isAutoPlayActive) {
            moveSlide(1);
        }
    }, 5000);
}

function pauseAutoPlay() {
    isAutoPlayActive = false;
}

function resumeAutoPlay() {
    isAutoPlayActive = true;
}

// ===== IMAGE MODAL =====
function initImageModal() {
    const modal = document.getElementById('imageModal');
    const closeBtn = document.querySelector('.image-modal-close');
    
    // Close modal events
    closeBtn.addEventListener('click', closeImageModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeImageModal();
        }
    });
    
    // Escape key to close
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isModalOpen) {
            closeImageModal();
        }
    });
}

function openImageModal(imageSrc, title) {
    const modal = document.getElementById('imageModal');
    const modalImage = document.getElementById('modalImage');
    const modalTitle = document.getElementById('modalTitle');
    
    modalImage.src = imageSrc;
    modalTitle.textContent = title;
    modal.style.display = 'block';
    isModalOpen = true;
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
    
    // Pause carousel auto-play
    pauseAutoPlay();
}

function closeImageModal() {
    const modal = document.getElementById('imageModal');
    modal.style.display = 'none';
    isModalOpen = false;
    
    // Restore body scroll
    document.body.style.overflow = 'auto';
    
    // Resume carousel auto-play
    resumeAutoPlay();
}

// ===== SCROLL ANIMATIONS =====
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    const animateElements = document.querySelectorAll('.feature-card, .module-card, .section-header');
    animateElements.forEach(el => {
        observer.observe(el);
    });
}

// ===== PARTICLES ANIMATION =====
function initParticles() {
    const particlesContainer = document.querySelector('.hero-particles');
    if (!particlesContainer) return;
    
    // Create floating particles
    for (let i = 0; i < 50; i++) {
        createParticle(particlesContainer);
    }
}

function createParticle(container) {
    const particle = document.createElement('div');
    particle.style.position = 'absolute';
    particle.style.width = Math.random() * 4 + 1 + 'px';
    particle.style.height = particle.style.width;
    particle.style.background = 'rgba(255, 255, 255, 0.1)';
    particle.style.borderRadius = '50%';
    particle.style.left = Math.random() * 100 + '%';
    particle.style.top = Math.random() * 100 + '%';
    particle.style.animation = `float ${Math.random() * 3 + 2}s ease-in-out infinite`;
    particle.style.animationDelay = Math.random() * 2 + 's';
    
    container.appendChild(particle);
}

// ===== FLOATING CARDS ANIMATION =====
function initFloatingCards() {
    const cards = document.querySelectorAll('.floating-card');
    
    cards.forEach((card, index) => {
        // Add random animation delays
        card.style.animationDelay = `${index * 0.5}s`;
        
        // Add hover effects
        card.addEventListener('mouseenter', () => {
            card.style.animationPlayState = 'paused';
            card.style.transform = 'translateY(-10px) scale(1.05)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.animationPlayState = 'running';
            card.style.transform = '';
        });
    });
}

// ===== SMOOTH SCROLLING =====
function initSmoothScrolling() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            const targetId = link.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const offsetTop = targetElement.offsetTop - 80; // Account for fixed navbar
                
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ===== MOBILE MENU =====
function initMobileMenu() {
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
        });
        
        // Close menu when clicking on a link
        const navLinks = navMenu.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
            });
        });
    }
}

// ===== EXPORT FUNCTIONS FOR GLOBAL ACCESS =====
window.ProductOneX = {
    // Carousel functions
    moveSlide,
    goToSlide,
    startAutoPlay,
    pauseAutoPlay,
    resumeAutoPlay,
    
    // Modal functions
    openImageModal,
    closeImageModal
};

// ===== CSS ANIMATIONS =====
// Add CSS for scroll animations
const style = document.createElement('style');
style.textContent = `
    .feature-card,
    .module-card,
    .section-header {
        opacity: 0;
        transform: translateY(30px);
        transition: all 0.6s ease;
    }
    
    .feature-card.animate-in,
    .module-card.animate-in,
    .section-header.animate-in {
        opacity: 1;
        transform: translateY(0);
    }
    
    .nav-menu.active {
        display: flex;
        flex-direction: column;
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: white;
        box-shadow: var(--shadow-lg);
        padding: var(--space-4);
        gap: var(--space-4);
    }
    
    .nav-toggle.active .hamburger:nth-child(1) {
        transform: rotate(45deg) translate(5px, 5px);
    }
    
    .nav-toggle.active .hamburger:nth-child(2) {
        opacity: 0;
    }
    
    .nav-toggle.active .hamburger:nth-child(3) {
        transform: rotate(-45deg) translate(7px, -6px);
    }
    
    @media (max-width: 768px) {
        .nav-menu {
            display: none;
        }
    }
`;
document.head.appendChild(style);
