// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', function() {
    initializeUI();
    setupEventListeners();
    initializeLibraries();
});

// Initialize UI components
function initializeUI() {
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            // Only prevent default if it's a hash in the same page
            if (href.startsWith('#') && href.length > 1) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    window.scrollTo({
                        top: target.offsetTop - 80, // Adjust for fixed navbar
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

    // Mobile menu toggle
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
            
            // Toggle icon between bars and X
            const icon = mobileMenuButton.querySelector('i');
            if (icon) {
                if (mobileMenu.classList.contains('hidden')) {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                } else {
                    icon.classList.remove('fa-bars');
                    icon.classList.add('fa-times');
                }
            }
        });
    }

    // Show/hide back-to-top button based on scroll position
    const backToTopButton = document.getElementById('back-to-top');
    if (backToTopButton) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                backToTopButton.style.opacity = '1';
            } else {
                backToTopButton.style.opacity = '0';
            }
        });
        
        backToTopButton.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // Cookie banner
    const cookieBanner = document.getElementById('cookieBanner');
    const acceptCookiesBtn = document.getElementById('acceptCookies');
    const rejectCookiesBtn = document.getElementById('rejectCookies');
    const customizeCookiesBtn = document.getElementById('customizeCookies');
    const showCookiesPolicyBtn = document.getElementById('showCookiesPolicy');
    
    // Check if cookie banner exists
    if (cookieBanner) {
        // Check if cookies have been accepted
        const cookiesAccepted = localStorage.getItem('modofit_cookies_aceptadas');
        
        if (cookiesAccepted === null) {
            // Show cookie banner after a brief delay
            setTimeout(() => {
                cookieBanner.classList.add('show');
            }, 2000);
        }
        
        // Accept cookies button
        if (acceptCookiesBtn) {
            acceptCookiesBtn.addEventListener('click', () => {
                localStorage.setItem('modofit_cookies_aceptadas', 'true');
                cookieBanner.classList.remove('show');
            });
        }
        
        // Reject cookies button
        if (rejectCookiesBtn) {
            rejectCookiesBtn.addEventListener('click', () => {
                localStorage.setItem('modofit_cookies_aceptadas', 'false');
                cookieBanner.classList.remove('show');
            });
        }
        
        // Customize cookies button
        if (customizeCookiesBtn) {
            customizeCookiesBtn.addEventListener('click', showCookiesPolicy);
        }
    }
    
    // Show cookies policy
    if (showCookiesPolicyBtn) {
        showCookiesPolicyBtn.addEventListener('click', showCookiesPolicy);
    }

    // Show privacy policy
    const showPrivacyPolicyBtn = document.getElementById('showPrivacyPolicy');
    if (showPrivacyPolicyBtn) {
        showPrivacyPolicyBtn.addEventListener('click', showPrivacyPolicy);
    }

    // Navbar scroll effect
    const mainNavbar = document.getElementById('mainNavbar');
    if (mainNavbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                mainNavbar.classList.add('navbar-scrolled');
            } else {
                // Only remove the class if we're on the homepage with a hero section
                if (document.querySelector('.hero-section')) {
                    mainNavbar.classList.remove('navbar-scrolled');
                }
            }
        });
        
        // Trigger scroll event on page load to set initial state
        window.dispatchEvent(new Event('scroll'));
    }
}

// Set up event listeners
function setupEventListeners() {
    // Play video button
    const playVideoBtn = document.getElementById('playVideo');
    if (playVideoBtn) {
        playVideoBtn.addEventListener('click', function() {
            Swal.fire({
                html: '<iframe width="100%" height="400" src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>',
                width: '80%',
                showConfirmButton: false,
                showCloseButton: true,
                background: '#000',
                padding: '0'
            });
        });
    }

    // Share button
    const shareButton = document.getElementById('shareButton');
    if (shareButton) {
        shareButton.addEventListener('click', function() {
            Swal.fire({
                title: '¡Comparte tu logro!',
                html: `
                    <p class='mb-4'>Comparte tu nueva membresía con tus amigos y motívalos a unirse a ModoFit.</p>
                    <div class='flex justify-center space-x-4 mt-4'>
                        <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}" target="_blank" class='bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full transition duration-300'>
                            <i class='fab fa-facebook-f text-xl'></i>
                        </a>
                        <a href="https://www.instagram.com/" target="_blank" class='bg-pink-600 hover:bg-pink-700 text-white p-3 rounded-full transition duration-300'>
                            <i class='fab fa-instagram text-xl'></i>
                        </a>
                        <a href="https://wa.me/?text=${encodeURIComponent('¡Me he unido a ModoFit! 💪 Únete tú también: ' + window.location.origin)}" target="_blank" class='bg-green-600 hover:bg-green-700 text-white p-3 rounded-full transition duration-300'>
                            <i class='fab fa-whatsapp text-xl'></i>
                        </a>
                    </div>
                `,
                showConfirmButton: false,
                showCloseButton: true
            });
        });
    }
}

// Initialize third-party libraries
function initializeLibraries() {
    // Initialize AOS
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            once: false,
            mirror: true,
            offset: 50,
            easing: 'ease-out-cubic'
        });
    }

    // Initialize Swiper if elements exist
    if (typeof Swiper !== 'undefined') {
        // Trainers slider
        const trainersSwiper = document.querySelector('.trainers-swiper');
        if (trainersSwiper) {
            new Swiper('.trainers-swiper', {
                slidesPerView: 1,
                spaceBetween: 30,
                loop: true,
                autoplay: {
                    delay: 4000,
                    disableOnInteraction: false,
                },
                pagination: {
                    el: '.swiper-pagination',
                    clickable: true,
                },
                breakpoints: {
                    640: {
                        slidesPerView: 2,
                    },
                    768: {
                        slidesPerView: 3,
                    },
                    1024: {
                        slidesPerView: 4,
                    },
                }
            });
        }

        // Testimonials slider
        const testimonialsSwiper = document.querySelector('.testimonials-swiper');
        if (testimonialsSwiper) {
            new Swiper('.testimonials-swiper', {
                slidesPerView: 1,
                spaceBetween: 30,
                loop: true,
                autoplay: {
                    delay: 5000,
                    disableOnInteraction: false,
                },
                pagination: {
                    el: '.swiper-pagination',
                    clickable: true,
                },
                navigation: {
                    nextEl: '.swiper-button-next',
                    prevEl: '.swiper-button-prev',
                },
                breakpoints: {
                    640: {
                        slidesPerView: 1,
                    },
                    768: {
                        slidesPerView: 2,
                    },
                    1024: {
                        slidesPerView: 3,
                    },
                }
            });
        }
    }

    // Initialize GSAP if available
    if (typeof gsap !== 'undefined') {
        // GSAP animations for hero content
        /*const heroContent = document.querySelector('.hero-content');
        if (heroContent) {
            gsap.from('.hero-content', {
                opacity: 0,
                y: 50,
                duration: 1,
                ease: 'power3.out',
                stagger: 0.2
            });
        }*/

        // Animate counter elements
        const counterElements = document.querySelectorAll('.counter');
        if (counterElements.length > 0 && typeof ScrollTrigger !== 'undefined') {
            counterElements.forEach(counter => {
                const target = parseInt(counter.getAttribute('data-target'));
                
                ScrollTrigger.create({
                    trigger: counter,
                    start: 'top 80%',
                    onEnter: () => {
                        let count = 0;
                        const duration = 2000; // 2 seconds
                        const frameDuration = 1000 / 60; // 60fps
                        const totalFrames = Math.round(duration / frameDuration);
                        const increment = target / totalFrames;
                        
                        const updateCount = () => {
                            count += increment;
                            if (count < target) {
                                counter.innerText = Math.ceil(count).toLocaleString();
                                requestAnimationFrame(updateCount);
                            } else {
                                counter.innerText = target.toLocaleString();
                            }
                        };
                        
                        counter.classList.add('animate-count-up');
                        updateCount();
                    },
                    once: true
                });
            });
        }
    }

    // Initialize Barba.js if available
    if (typeof barba !== 'undefined') {
        barba.init({
            transitions: [{
                name: 'opacity-transition',
                leave(data) {
                    return gsap.to(data.current.container, {
                        opacity: 0,
                        y: -20,
                        duration: 0.5,
                        ease: 'power3.inOut'
                    });
                },
                enter(data) {
                    return gsap.from(data.next.container, {
                        opacity: 0,
                        y: 20,
                        duration: 0.5,
                        ease: 'power3.out'
                    });
                }
            }]
        });
    }
}

// Show privacy policy
function showPrivacyPolicy() {
    Swal.fire({
        title: 'Política de Privacidad',
        html: `
            <div class='text-left'>
                <p class='mb-4'>En ModoFit, nos tomamos muy en serio la privacidad de nuestros usuarios. Esta política describe cómo recopilamos, usamos y protegemos tu información personal.</p>
                
                <h3 class='font-bold mb-2'>Información que recopilamos</h3>
                <p class='mb-4'>Recopilamos información personal como tu nombre, dirección de correo electrónico, número de teléfono y, en algunos casos, información de pago.</p>
                
                <h3 class='font-bold mb-2'>Cómo usamos tu información</h3>
                <p class='mb-4'>Utilizamos tu información para proporcionar y mejorar nuestros servicios, procesar pagos, comunicarnos contigo y personalizar tu experiencia.</p>
                
                <h3 class='font-bold mb-2'>Protección de datos</h3>
                <p>Implementamos medidas de seguridad para proteger tu información personal contra acceso no autorizado o divulgación.</p>
                
                <p class='mt-4'><a href="/politica_privacidad" class="text-primary">Ver política completa</a></p>
            </div>
        `,
        confirmButtonColor: '#FFCC29',
        confirmButtonText: 'Entendido',
        width: '600px'
    });
}

// Show cookies policy
function showCookiesPolicy() {
    Swal.fire({
        title: 'Política de Cookies',
        html: `
            <div class='text-left'>
                <p class='mb-4'>Utilizamos cookies para mejorar tu experiencia en nuestro sitio web. Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo cuando visitas nuestro sitio.</p>
                
                <h3 class='font-bold mb-2'>Tipos de cookies que utilizamos</h3>
                <p class='mb-4'>
                    <strong>Cookies esenciales:</strong> Necesarias para el funcionamiento básico del sitio.<br>
                    <strong>Cookies de preferencias:</strong> Permiten recordar tus preferencias.<br>
                    <strong>Cookies de análisis:</strong> Nos ayudan a entender cómo interactúas con nuestro sitio.<br>
                    <strong>Cookies de marketing:</strong> Utilizadas para mostrarte anuncios relevantes.
                </p>
                
                <h3 class='font-bold mb-2'>Control de cookies</h3>
                <p>Puedes controlar y/o eliminar las cookies según tu preferencia. Puedes eliminar todas las cookies que ya están en tu dispositivo y puedes configurar la mayoría de los navegadores para evitar que se coloquen.</p>
            </div>
        `,
        confirmButtonColor: '#FFCC29',
        confirmButtonText: 'Entendido',
        width: '600px'
    });
}

// Add CSRF token to all AJAX requests
function setupCSRF() {
    const token = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
    
    // Add CSRF token to AJAX requests
    document.addEventListener('DOMContentLoaded', function() {
        const xhr = window.XMLHttpRequest;
        const ajax = xhr.prototype.open;
        
        xhr.prototype.open = function() {
            ajax.apply(this, arguments);
            this.setRequestHeader('X-CSRF-Token', token);
        };
    });
}
setupCSRF();