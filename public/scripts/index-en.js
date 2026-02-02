
window.addEventListener('scroll', function() {
    const header = document.querySelector('.navbar');
    if (window.scrollY > 10) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});


const solution = [
    {
        id: 1,
        img: "https://www.mpedigitalsolutions.com/_next/image?url=%2Fimages%2FWordPressWebSite%2Fwordpress_img.jpg&w=1080&q=85",
        titre: "PROFESSIONAL WEBSITES",
        badge: "Web Development",
        bg: "bg-warning",
        paragraphe: "Custom, fast, and high-performing websites that perfectly represent your business online."
    },
    {
        id: 2,
        img: "https://www.mpedigitalsolutions.com/_next/image?url=%2Fimages%2Fe-commerce%2Fecommerce_main_img_1.jpg&w=1080&q=85",
        titre: "E-COMMERCE",
        badge: "E-commerce",
        bg: "bg-primary",
        paragraphe: "Secure and optimized online stores designed to maximize your sales and grow your business."
    },
    {
        id: 3,
        img: "https://www.mpedigitalsolutions.com/_next/image?url=%2Fimages%2FMarketingDigital%2Fmarketing_digital_main_1.jpg&w=1080&q=85",
        titre: "DIGITAL MARKETING",
        badge: "Digital Marketing",
        bg: "bg-warning",
        paragraphe: "Powerful digital marketing strategies to attract more customers and boost your visibility."
    },
    {
        id: 4,
        img: "https://www.mpedigitalsolutions.com/_next/image?url=%2Fimages%2Fseo-sea%2Fseo%2Fseo_img_1.avif&w=1080&q=85",
        titre: "VISIBILITY",
        badge: "Visibility & SEO",
        bg: "bg-primary",
        paragraphe: "Optimize your presence on Google and search engines to be easily found by your clients."
    },
    {
        id: 5,
        img: "https://www.mpedigitalsolutions.com/_next/image?url=%2Fimages%2Fui-ux%2Fui-ux_img_1.jpeg&w=1080&q=85",
        titre: "DESIGN & UX",
        badge: "Design & UX",
        bg: "bg-warning",
        paragraphe: "Modern and intuitive interfaces that offer an exceptional user experience and increase conversions."
    },
    {
        id: 6,
        img: "https://www.mpedigitalsolutions.com/_next/image?url=%2Fimages%2FMaintenancedeSiteWeb%2Fsoftware_maintenance_hero.jpeg&w=1080&q=85",
        titre: "MOBILE APPLICATIONS",
        badge: "Mobile Apps",
        bg: "bg-primary",
        paragraphe: "Native and cross-platform mobile applications for iOS and Android that perfectly represent your company."
    }
];

const cardsContainer = document.getElementById('card-solutions');

// Génération du HTML
cardsContainer.innerHTML = solution.map(item => `
<div class="col-12 col-md-6 col-lg-4 reveal-card-bottom">
<a href="#" class="card card-zoom h-100 border-0 shadow-lg rounded-4 overflow-hidden text-decoration-none">
    <div class="position-relative overflow-hidden"> <img src="${item.img}" class="card-img-top object-fit-cover transition-img" style="height: 220px;" alt="${item.titre}">
        <div class="position-absolute top-0 start-0 w-100 h-100 bg-gradient-card"></div>
        <span class="position-absolute top-0 start-0 m-3 badge rounded-pill ${item.bg} text-white px-3 py-2">
            ${item.badge}
        </span>
    </div>
    <div class="card-body text-start p-4">
        <h2 class="h5 fw-bold text-dark text-uppercase">${item.titre}</h2>
        <p class="text-muted mb-0" style="font-size: 1rem; line-height: 1.6;">
            ${item.paragraphe}
        </p>
    </div>
</a>
</div>
`).join('');



const atouts = [
    {
        id: 1,
        img: "bi-graph-up-arrow",
        num: 340,
        unite: "%",
        bg: "bg-warning",
        textColor: "#d97706",
        sujet: "Avg Growth",
        obj: "Multiply Your Sales",
        border: "border-warning",
        paragraphe: "Generate maximum opportunities for your company's business development."
    },
    {
        id: 2,
        img: "bi-megaphone",
        num: 5,
        unite: "M+",
        bg: "bg-primary",
        textColor: "blue",
        sujet: "Reach",
        obj: "Increase Your Awareness",
        border: "border-primary",
        paragraphe: "Be present and active to leave a lasting impression on your future clients and prospects."
    },
    {
        id: 3,
        img: "bi-emoji-smile",
        num: 95,
        unite: "%",
        bg: "bg-warning",
        textColor: "#d97706",
        sujet: "Satisfaction",
        obj: "Enhance Your Brand Image",
        border: "border-warning",
        paragraphe: "Improve how your customers perceive you to stand out and gain market share."
    }
];

// 1. Injection du HTML
const containerAtouts = document.getElementById('atout');
containerAtouts.innerHTML = atouts.map(atout => `
    <div class="col-12 col-md-4 reveal-card-bottom">
        <div class="card h-100 p-4 border-0 shadow-sm rounded-4 ${atout.bg} bg-opacity-10 border-start border-4 ${atout.border}">
            <div class="icon-box ${atout.bg} bg-opacity-25 rounded-3 mb-4 d-inline-flex align-items-center justify-content-center" style="width: 50px; height: 50px;">
                <i class="bi ${atout.img} fs-3" style="color:${atout.textColor}"></i>
            </div>
            
            <div class="mb-3">
                <span class="display-5 fw-bold  counter" data-target="${atout.num}" style="color:${atout.textColor}">0</span>
                <span class="display-5 fw-bold " style="color:${atout.textColor}">${atout.unite}</span>
                <div class="small fw-bold text-muted text-uppercase tracking-wider">${atout.sujet}</div>
            </div>
            
            <h3 class="h5 fw-bold mb-3 text-dark">${atout.obj}</h3>
            <p class="text-muted  mb-0">${atout.paragraphe}</p>
        </div>
    </div>
`).join('');



// afficher promo-banner

document.addEventListener('DOMContentLoaded', function() {
    
    // On attend 10 000 ms (10 secondes)
    setTimeout(function() {
        const sr = ScrollReveal();

        sr.reveal('#promo-banner', {
            origin: 'top',      // Arrive du haut
            distance: '50px',   // Glisse sur 50px
            duration: 1000,     // Animation d'une seconde
            opacity: 0,
            easing: 'ease-out',
            beforeReveal: (el) => {
                el.style.visibility = 'visible';
            }
        });
    }, 10000); 

    // Gestion du bouton de fermeture
    const closeBtn = document.querySelector('.btn-close-banner');
    if(closeBtn) {
        closeBtn.addEventListener('click', function() {
            document.getElementById('promo-banner').style.display = 'none';
        });
    }
});




// 2. Logique de l'animation des compteurs
const animateCounters = () => {
    const counters = document.querySelectorAll('.counter');
    const speed = 60; // Plus le chiffre est petit, plus c'est rapide

    counters.forEach(counter => {
        const updateCount = () => {
            const target = +counter.getAttribute('data-target');
            const count = +counter.innerText;
            
            // Calcul de l'incrément (on gère les entiers et les décimaux)
            const inc = target / speed;

            if (count < target) {
                // Si c'est un décimal (comme 2.5), on garde une décimale
                const newValue = count + inc;
                counter.innerText = target % 1 === 0 ? Math.ceil(newValue) : newValue.toFixed(1);
                setTimeout(updateCount, 15);
            } else {
                counter.innerText = target;
            }
        };
        updateCount();
    });
};

// 3. Déclenchement au scroll (Intersection Observer)
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if(entry.isIntersecting) {
            animateCounters();
            observer.unobserve(entry.target); // On n'anime qu'une seule fois
        }
    });
}, { threshold: 0.5 });

observer.observe(containerAtouts);


const services = [
    {
        id: "01",
        title: "Personal Advisor",
        desc: "Benefit from a dedicated point of contact to answer your questions, whatever your needs may be.",
        icon: '<i class="bi bi-people-fill fs-4"></i>',
        colorClass: "warning", 
        textColor: "#d97706"
    },
    {
        id: "02",
        title: "24/7 Support",
        desc: "Local teams at your service, responding by phone, email, or chat, whenever you need them.",
        icon: '<i class="bi bi-headphones fs-4"></i>',
        colorClass: "primary",
        textColor: "#0d6efd"
    },
    {
        id: "03",
        title: "Risk-Free Contracts",
        desc: "30-day money-back guarantee. Easy online cancellation available 24/7.",
        icon: '<i class="bi bi-shield-check fs-4"></i>',
        colorClass: "warning",
        textColor: "#d97706"
    },
    {
        id: "04",
        title: "Transparent Offers",
        desc: "No hidden asterisks or surprises! All details are clearly communicated before your purchase.",
        icon: '<i class="bi bi-file-earmark-check fs-4"></i>',
        colorClass: "primary",
        textColor: "#0d6efd"
    }
];

const servicesContainer = document.getElementById('services-grid');

servicesContainer.innerHTML = services.map(ser => `
    <div class="col-12 col-sm-6 col-lg-3 reveal-card-top">
        <div class="card h-100 p-4 border-0 shadow-sm transition-all service-card bg-${ser.colorClass} bg-opacity-10 rounded-4">
            <div class="d-flex justify-content-between align-items-start mb-4">
                <div class="rounded-3 d-flex align-items-center justify-content-center bg-white shadow-sm border border-${ser.colorClass} border-opacity-25" style="width: 50px; height: 50px; color: ${ser.textColor}">
                    ${ser.icon}
                </div>
                <span class="display-5 fw-bold opacity-25 text-secondary">${ser.id}</span>
            </div>
            
            <h4 class="h6 fw-bold mb-3 text-dark text-hover-${ser.colorClass}">${ser.title}</h4>
            <p class="text-muted small mb-0 lh-base">
                ${ser.desc}
            </p>
        </div>
    </div>
`).join('');




// Fonction pour animer les chiffres
const animateStats = () => {
    const counters = document.querySelectorAll('.counter');
    const duration = 2000; // Durée totale de l'animation en ms (2 secondes)

    counters.forEach(counter => {
        const target = +counter.getAttribute('data-target');
        const startTime = performance.now();
        
        const updateNumber = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1); // Progression de 0 à 1
            
            // Calcul de la valeur actuelle avec un effet de ralentissement (easeOutQuad)
            const easedProgress = progress * (2 - progress);
            const currentValue = Math.floor(easedProgress * target);

            // Formatage spécial pour les milliers (ex: 1 200)
            counter.innerText = currentValue.toLocaleString('fr-FR');

            if (progress < 1) {
                requestAnimationFrame(updateNumber);
            } else {
                counter.innerText = target.toLocaleString('fr-FR');
            }
        };

        requestAnimationFrame(updateNumber);
    });
};

// Déclencheur : Lance l'animation quand le bandeau devient visible
const statsSection = document.querySelector('.stats-banner');
const observerOptions = {
    threshold: 0.5 // Se déclenche quand 50% du bandeau est visible
};

const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            animateStats();
            statsObserver.unobserve(entry.target); // Ne l'anime qu'une seule fois
        }
    });
}, observerOptions);

if (statsSection) {
    statsObserver.observe(statsSection);
}


// new


document.addEventListener('DOMContentLoaded', function() {
    const carouselEl = document.querySelector('#portfolioCarousel');
    const carousel = new bootstrap.Carousel(carouselEl);
    
    const currentSlideTxt = document.querySelector('#currentSlide');
    const progressSegments = document.querySelectorAll('.progress-segment');
    const pauseBtn = document.querySelector('#btnPause');

    // Mise à jour lors du changement de slide
    carouselEl.addEventListener('slide.bs.carousel', function (e) {
        // Update le numéro 01 / 02
        let step = e.to + 1;
        currentSlideTxt.innerText = step.toString().padStart(2, '0');

        // Update les segments de la barre de progression
        progressSegments.forEach((seg, index) => {
            if(index === e.to) {
                seg.classList.add('active');
                seg.classList.remove('idle');
            } else {
                seg.classList.add('idle');
                seg.classList.remove('active');
            }
        });
    });

    // Bouton Pause/Play
    let isPaused = false;
    pauseBtn.addEventListener('click', function() {
        if(!isPaused) {
            carousel.pause();
            pauseBtn.innerHTML = '<i class="bi bi-play-fill"></i>';
        } else {
            carousel.cycle();
            pauseBtn.innerHTML = '<i class="bi bi-pause-fill"></i>';
        }
        isPaused = !isPaused;
    });
});


// new


document.addEventListener('DOMContentLoaded', function() {
    const marquee = document.getElementById('marquee');
    
    // On clone le contenu pour créer l'effet de boucle infinie
    const content = marquee.innerHTML;
    marquee.innerHTML = content + content; // On double les cartes

    // Optionnel : Ajuster la vitesse en fonction du nombre de cartes
    const cards = marquee.querySelectorAll('.testimonial-card');
    const duration = cards.length * 5; // 5 secondes par carte environ
    marquee.style.animationDuration = duration + 's';
});

document.addEventListener('DOMContentLoaded', function() {
    const navBtns = document.querySelectorAll('.nav-btn');
    
    navBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Effet de clic
            this.style.transform = 'scale(0.95)';
            setTimeout(() => this.style.transform = 'scale(1)', 100);
            
            // Logique de changement (à lier à vos données)
            console.log('Navigation cliquée');
        });
    });

    // Effet parallaxe léger sur l'image au survol
    const card = document.querySelector('.main-case-card');
    const img = document.querySelector('.case-img');

    card.addEventListener('mouseenter', () => {
        img.style.transition = 'transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)';
        img.style.transform = 'scale(1.05)';
    });

    card.addEventListener('mouseleave', () => {
        img.style.transform = 'scale(1)';
    });
});

// new
document.addEventListener('DOMContentLoaded', function() {
    const cards = document.querySelectorAll('.main-case-card > .row');
    const dots = document.querySelectorAll('.dot');
    const prevBtn = document.querySelector('[aria-label="Précédent"]');
    const nextBtn = document.querySelector('[aria-label="Suivant"]');
    const pauseBtn = document.querySelector('[aria-label="Pause"]');
    const counterText = document.querySelector('.counter-badge span:first-child');
    
    let currentIndex = 0;
    let isPaused = false;
    let slideInterval;
    const intervalTime = 5000; // 5 secondes par projet

    function showProject(index) {
        // Cacher tous les projets
        cards.forEach(card => card.style.display = 'none');
        dots.forEach(dot => dot.classList.remove('active'));

        // Afficher le projet actuel
        cards[index].style.display = 'flex';
        cards[index].style.opacity = '0';
        setTimeout(() => {
            cards[index].style.transition = 'opacity 0.5s ease';
            cards[index].style.opacity = '1';
        }, 10);

        // Mise à jour visuelle
        dots[index].classList.add('active');
        counterText.textContent = `0${index + 1}`;
        currentIndex = index;
    }

    function nextSlide() {
        let next = (currentIndex + 1) % cards.length;
        showProject(next);
    }

    function prevSlide() {
        let prev = (currentIndex - 1 + cards.length) % cards.length;
        showProject(prev);
    }

    // --- Logique du Timer ---
    function startAutoSlide() {
        stopAutoSlide(); // Sécurité
        slideInterval = setInterval(nextSlide, intervalTime);
    }

    function stopAutoSlide() {
        clearInterval(slideInterval);
    }

    // --- Événements ---
    nextBtn.addEventListener('click', () => {
        nextSlide();
        startAutoSlide(); // Relance le timer après le clic
    });

    prevBtn.addEventListener('click', () => {
        prevSlide();
        startAutoSlide();
    });

    // Bouton Pause/Play
    pauseBtn.addEventListener('click', () => {
        isPaused = !isPaused;
        const icon = pauseBtn.querySelector('i');
        
        if (isPaused) {
            stopAutoSlide();
            icon.classList.replace('bi-pause-fill', 'bi-play-fill');
            pauseBtn.classList.add('btn-active-pause'); // Optionnel: style CSS
        } else {
            startAutoSlide();
            icon.classList.replace('bi-play-fill', 'bi-pause-fill');
            pauseBtn.classList.remove('btn-active-pause');
        }
    });

    // Pause au survol de la carte (UX moderne)
    const mainCard = document.querySelector('.main-case-card');
    mainCard.addEventListener('mouseenter', stopAutoSlide);
    mainCard.addEventListener('mouseleave', () => {
        if (!isPaused) startAutoSlide();
    });

    // Initialisation
    showProject(0);
    startAutoSlide();
});


// new

document.addEventListener('DOMContentLoaded', function() {
    const backToTopBtn = document.getElementById('backToTop');

    // Surveiller le défilement de la page
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            // Affiche le bouton après 300px de défilement
            backToTopBtn.classList.add('show');
        } else {
            // Cache le bouton
            backToTopBtn.classList.remove('show');
        }
    });

    // Action de clic pour remonter
    backToTopBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth' // Défilement fluide
        });
    });
});

//new

document.querySelector('.btn-close-banner').addEventListener('click', function() {
    document.getElementById('promo-banner').classList.add('d-none');
});


// new langues

document.addEventListener('DOMContentLoaded', function() {
    const langBtn = document.getElementById('lang-switcher');
    const langLabel = document.getElementById('lang-label');
    const flagIcon = document.getElementById('flag-icon');

    langBtn.addEventListener('click', function() {
        let currentLang = langBtn.getAttribute('data-current-lang');
       
        if (currentLang === 'FR') {
            // --- ACTION : PASSER EN ANGLAIS ---
            langBtn.setAttribute('data-current-lang', 'EN');
            langLabel.innerText = 'FR'; // Le texte propose de revenir au Français
            flagIcon.src = "https://flagcdn.com/w80/fr.png"; // Le fond montre le drapeau français
            // On redirige vers la version anglaise
             window.location.href = 'index-en.html';
        
        } else {
            // --- ACTION : PASSER EN FRANÇAIS ---
            langBtn.setAttribute('data-current-lang', 'FR');
            langLabel.innerText = 'EN'; // Le texte propose de passer à l'Anglais
            flagIcon.src = "https://flagcdn.com/w80/gb.png"; // Le fond montre le drapeau UK
            // On redirige vers la version anglaise
           window.location.href = 'index.html';
        }
    });
});
// new

document.addEventListener('DOMContentLoaded', function() {
    const themeBtn = document.getElementById('theme-toggler');
    const themeIcon = document.getElementById('theme-icon');
    const htmlElement = document.documentElement;

    // 1. Vérifier s'il y a déjà une préférence enregistrée
    const savedTheme = localStorage.getItem('theme') || 'light';
    applyTheme(savedTheme);

    themeBtn.addEventListener('click', function() {
        // Basculer entre light et dark
        const currentTheme = htmlElement.getAttribute('data-bs-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        applyTheme(newTheme);
    });

    function applyTheme(theme) {
        // Appliquer le thème à la balise <html>
        htmlElement.setAttribute('data-bs-theme', theme);
        localStorage.setItem('theme', theme);

        // Changer l'icône
        if (theme === 'dark') {
            themeIcon.className = 'bi bi-sun-fill';
            themeBtn.style.background = '#facc15'; // Jaune soleil
            themeBtn.style.color = '#0f172a';      // Texte sombre
        } else {
            themeIcon.className = 'bi bi-moon-stars-fill';
            themeBtn.style.background = '#1e3a8a'; // Bleu nuit
            themeBtn.style.color = '#ffc107';      // Texte jaune
        }
    }
});

// new

document.addEventListener('DOMContentLoaded', function() {
    const navBtn = document.getElementById('nav-icon-trigger');
    const navIcon = navBtn.querySelector('.nav-icon');

    navBtn.addEventListener('click', function() {
        // Ajoute ou retire la classe 'open' pour déclencher l'animation CSS
        navIcon.classList.toggle('open');
    });

    // Optionnel : Refermer le X si on clique sur un lien du menu
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navIcon.classList.remove('open');
        });
    });
});

// new


// annimation cover
document.addEventListener('DOMContentLoaded', function() {
    // Configuration globale
    const sr = ScrollReveal({
        reset: true,
        duration: 600, // Réduit de 800 à 600 pour plus de nervosité
        distance: '70px',
        mobile: true,
        viewFactor: 0.05 // Se déclenche quasi immédiatement (5% de visibilité)
    });

    const myCarousel = document.getElementById('carouselExampleAutoplaying');

    function triggerReveal(target) {
        // 1. On "réveille" ScrollReveal pour les éléments de cette slide
        sr.reveal(target.querySelector('.reveal-bg'), {
            scale: 0.9,
            opacity: 0,
            distance: '0px',
            afterReveal: (el) => el.style.visibility = 'visible'
        });

        sr.reveal(target.querySelector('.reveal-title'), {
            origin: 'top',
            distance: '40px',
            delay: 150
        });

        

        sr.reveal(target.querySelector('.reveal-text'), {
            origin: 'left',
            distance: '40px',
            delay: 300
        });

        sr.reveal(target.querySelector('.reveal-action'), {
            origin: 'bottom',
            distance: '30px',
            delay: 450
        });
    }

    // Initialisation première slide
    triggerReveal(myCarousel.querySelector('.carousel-item.active'));

    // À CHAQUE changement de slide (Début du mouvement)
    myCarousel.addEventListener('slide.bs.carousel', function (e) {
        // On remet à zéro la slide qui arrive pour qu'elle puisse se "re-révéler"
        const nextElements = e.relatedTarget.querySelectorAll('.reveal-bg, .reveal-title, .reveal-text, .reveal-action');
        nextElements.forEach(el => {
            el.style.visibility = 'hidden'; 
            // On retire les styles inline injectés par ScrollReveal pour forcer le refresh
            el.removeAttribute('style'); 
        });
    });

    // Quand la slide est en place (Fin du mouvement)
    myCarousel.addEventListener('slid.bs.carousel', function (e) {
        triggerReveal(e.relatedTarget);
    });
});


document.addEventListener('DOMContentLoaded', function() {
    // Animation des éléments de la page
    const sr = ScrollReveal({
        distance: '40px',      // Réduit de 80) pour plus de nervosité
        duration: 900,        // BEAUCOUP plus rapide (1s au lieu de 2.5s)
        delay: 100,            // Délai initial réduit
        reset: true,
        viewFactor: 0.1       // Déclenche l'animation dès que 10% de l'élément est visible
    });
    
    // Utilisation d'un intervalle pour les classes répétées
    // Cela permet aux éléments du bas de s'animer indépendamment du haut
    const revealElements = [
        { selector: '.reveal-section-left', options: { origin: 'left', interval: 100 } },
        { selector: '.reveal-section-right', options: { origin: 'right', interval: 100 } },
        { selector: '.reveal-section-bottom', options: { origin: 'bottom', interval: 100 } },
        { selector: '.reveal-section-top', options: { origin: 'top', interval: 100 } },
        { 
            selector: '.reveal-section-aggrandire', 
            options: {
                scale: 0.4,      // Moins extrême que 0.1 pour être plus rapide
                distance: '0px',
                duration: 800,
                opacity: 0,
                viewFactor: 0.1  // Crucial pour ne pas attendre que la div soit trop sortie
            } 
        },
    ];
    
    revealElements.forEach(item => {
        sr.reveal(item.selector, item.options);
    });

   // On ajoute la nouvelle configuration au reste de vos révélations
sr.reveal('.reveal-card-bottom', {
    origin: 'bottom',      // Vient du bas
    distance: '50px',      // Distance de déplacement
    duration: 800,         // Durée de l'animation pour chaque carte
    delay: 100,            // Attente avant le début de la séquence
    interval: 150,         // TEMPS ENTRE CHAQUE APPARITION (Effet cascade)
    opacity: 0,
    scale: 0.95,           // Léger effet de zoom en arrivant
    easing: 'ease-out',
    reset: true            // Permet de rejouer l'animation au scroll
});

sr.reveal('.reveal-card-top', {
    origin: 'top',      // Vient du bas
    distance: '50px',      // Distance de déplacement
    duration: 800,         // Durée de l'animation pour chaque carte
    delay: 100,            // Attente avant le début de la séquence
    interval: 150,         // TEMPS ENTRE CHAQUE APPARITION (Effet cascade)
    opacity: 0,
    scale: 0.95,           // Léger effet de zoom en arrivant
    easing: 'ease-out',
    reset: true            // Permet de rejouer l'animation au scroll
});

});
   
