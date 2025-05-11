document.addEventListener('DOMContentLoaded', function() {
    // Animations for counters
    const counterElements = document.querySelectorAll('.counter');
    
    if (counterElements.length > 0) {
        const animateCounters = (entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const counter = entry.target;
                    const target = parseInt(counter.getAttribute('data-target'));
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
                    
                    updateCount();
                    observer.unobserve(counter);
                }
            });
        };
        
        const counterObserver = new IntersectionObserver(animateCounters, {
            threshold: 0.1
        });
        
        counterElements.forEach(counter => {
            counterObserver.observe(counter);
        });
    }

    // Video play button
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

    // Initialize Swiper for testimonials
    const testimonialsSwiper = document.querySelector('.testimonials-swiper');
    if (testimonialsSwiper && typeof Swiper !== 'undefined') {
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

    // Initialize Swiper for trainers
    const trainersSwiper = document.querySelector('.trainers-swiper');
    if (trainersSwiper && typeof Swiper !== 'undefined') {
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

    // Animate elements on scroll
    const fadeElements = document.querySelectorAll('.fade-in-up');
    
    if (fadeElements.length > 0) {
        const fadeObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, { threshold: 0.1 });
        
        fadeElements.forEach(element => {
            fadeObserver.observe(element);
        });
    }

    // Navbar scroll effect
    const mainNavbar = document.getElementById('mainNavbar');
    if (mainNavbar) {
        const heroSection = document.querySelector('.hero-section');
        
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                mainNavbar.classList.add('navbar-scrolled');
            } else if (heroSection) {
                // Only remove the class if we're on the homepage with a hero section
                mainNavbar.classList.remove('navbar-scrolled');
            }
        });
        
        // Trigger scroll event on page load to set initial state
        window.dispatchEvent(new Event('scroll'));
    }

    // GSAP animations for hero content
    if (typeof gsap !== 'undefined') {
        const heroContent = document.querySelector('.hero-content');
        if (heroContent) {
            gsap.from('.hero-content', {
                //opacity: 0,
                y: 50,
                duration: 1,
                ease: 'power3.out',
                //stagger: 0.2
            });
        }
    }
});