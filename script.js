document.addEventListener('DOMContentLoaded', () => {
    // Reveal Animations using IntersectionObserver for better scroll performance
    const reveals = document.querySelectorAll('.reveal, .reveal-right');

    const revealOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    };

    const revealOnScroll = new IntersectionObserver(function(entries, observer) {
        entries.forEach(entry => {
            if (!entry.isIntersecting) {
                return;
            } else {
                entry.target.classList.add('active');
                observer.unobserve(entry.target); // Optional: stop observing once revealed
            }
        });
    }, revealOptions);

    reveals.forEach((reveal) => {
        revealOnScroll.observe(reveal);
    });

    // 3D Kinetic Word Rotator (Aesthetic Dynamic Typography)
    const wordSlides = document.querySelectorAll('.kinetic-word-slide');
    if (wordSlides.length > 1) {
        let currentWordIdx = 0;
        setInterval(() => {
            const currentSlide = wordSlides[currentWordIdx];
            if (currentSlide) {
                currentSlide.classList.remove('active');
                currentSlide.classList.add('exit');
                setTimeout(() => {
                    currentSlide.classList.remove('exit');
                }, 650);
            }

            currentWordIdx = (currentWordIdx + 1) % wordSlides.length;
            const nextSlide = wordSlides[currentWordIdx];
            if (nextSlide) {
                nextSlide.classList.add('active');
            }
        }, 2600);
    }

    // Live Stats Analytics & Real Data Tracker
    const statActiveUsersEl = document.getElementById('stat-active-users');
    const statDownloadsEl = document.getElementById('stat-downloads');
    const statVisitorsEl = document.getElementById('stat-visitors');

    const animateValue = (obj, start, end, duration) => {
        if (!obj) return;
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            obj.innerHTML = Math.floor(progress * (end - start) + start).toLocaleString();
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    };

    let latestStats = {
        activeUsers: 5,
        visitors: 521,
        downloads: 78
    };

    let hasAnimated = false;

    const triggerStatsAnimation = () => {
        if (hasAnimated) return;
        hasAnimated = true;
        if (statActiveUsersEl) animateValue(statActiveUsersEl, 0, latestStats.activeUsers, 1200);
        if (statDownloadsEl) animateValue(statDownloadsEl, 0, latestStats.downloads, 1400);
        if (statVisitorsEl) animateValue(statVisitorsEl, 0, latestStats.visitors, 1400);
    };

    // Ambil data langsung dari API (Supabase & Hits.sh external tracker)
    // Setiap kali pelawat buka web (dari iPhone / PC / Mac), sistem hantar hit=1 ke backend
    const cacheBuster = Date.now();
    fetch('/api/stats?hit=1&t=' + cacheBuster)
        .then(res => res.json())
        .then(data => {
            if (data) {
                if (typeof data.activeUsers === 'number') latestStats.activeUsers = data.activeUsers;
                if (typeof data.visitors === 'number') latestStats.visitors = data.visitors;
                if (typeof data.downloads === 'number') latestStats.downloads = data.downloads;

                if (hasAnimated) {
                    if (statActiveUsersEl) statActiveUsersEl.innerText = latestStats.activeUsers.toLocaleString();
                    if (statVisitorsEl) statVisitorsEl.innerText = latestStats.visitors.toLocaleString();
                    if (statDownloadsEl) statDownloadsEl.innerText = latestStats.downloads.toLocaleString();
                }
            }
        })
        .catch(err => {
            console.warn('Live stats fetch fallback:', err);
        });

    const statsObserver = new IntersectionObserver((entries, observer) => {
        const statsSection = entries.find(e => e.isIntersecting);
        if (statsSection) {
            triggerStatsAnimation();
            observer.disconnect();
        }
    }, revealOptions);

    const statsContainer = document.querySelector('.stats-container');
    if (statsContainer) {
        statsObserver.observe(statsContainer);
    }

    // Jejak klik muat turun secara langsung (Live +1 tick ke DB & skrin)
    const downloadButtons = document.querySelectorAll('.btn-download');
    downloadButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            latestStats.downloads += 1;
            if (statDownloadsEl) {
                const currentVal = parseInt(statDownloadsEl.innerText.replace(/,/g, '') || '0', 10);
                animateValue(statDownloadsEl, currentVal, latestStats.downloads, 400);
            }
            const dlUrl = '/api/stats?download=1&t=' + Date.now();
            try {
                if (navigator.sendBeacon) {
                    navigator.sendBeacon(dlUrl);
                } else {
                    fetch(dlUrl, { keepalive: true }).catch(() => {});
                }
            } catch (err) {
                fetch(dlUrl, { keepalive: true }).catch(() => {});
            }
        });
    });

    // Interactive Mockup Logic
    const mockupImg = document.getElementById('mockupImage');
    const mockupBtns = document.querySelectorAll('.mockup-btn');
    const centerOverlay = document.getElementById('mockupCenterOverlay');
    
    if (mockupImg && mockupBtns.length > 0) {
        mockupBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const targetSrc = btn.getAttribute('data-target');
                
                // Optional fade out effect
                mockupImg.style.opacity = '0.5';
                
                setTimeout(() => {
                    mockupImg.src = targetSrc;
                    mockupImg.style.opacity = '1';
                    
                    // Hide center cards overlay if not on main menu
                    if (centerOverlay) {
                        if (targetSrc.includes('main_menu.png')) {
                            centerOverlay.style.display = 'block';
                        } else {
                            centerOverlay.style.display = 'none';
                        }
                    }
                }, 150);
                // Update active state
                mockupBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });
    }

    // Countdown Timer Logic
    const targetDate = new Date('2026-08-01T08:00:00+08:00').getTime();

    function updateCountdown() {
        const now = new Date().getTime();
        const distance = targetDate - now;

        const countdownContainer = document.getElementById('countdown-container');
        const downloadLinksContainer = document.getElementById('download-links-container');

        if (!countdownContainer || !downloadLinksContainer) return;

        if (distance < 0) {
            // Time's up! Show the download links
            countdownContainer.style.display = 'none';
            downloadLinksContainer.style.display = 'flex';
            return;
        }

        // Calculate time left
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        // Update DOM
        const cdDays = document.getElementById('cd-days');
        const cdHours = document.getElementById('cd-hours');
        const cdMinutes = document.getElementById('cd-minutes');
        const cdSeconds = document.getElementById('cd-seconds');
        
        if (cdDays) cdDays.textContent = days.toString().padStart(2, '0');
        if (cdHours) cdHours.textContent = hours.toString().padStart(2, '0');
        if (cdMinutes) cdMinutes.textContent = minutes.toString().padStart(2, '0');
        if (cdSeconds) cdSeconds.textContent = seconds.toString().padStart(2, '0');
    }

    // Run initially and then every second
    updateCountdown();
    setInterval(updateCountdown, 1000);

    // --- Tutorial Onboarding Logic ---
    const tutorialWrapper = document.getElementById('tutorialWrapper');
    const btnTontonTutorial = document.getElementById('btn-tonton-tutorial');
    const btnTutorialSudah = document.getElementById('btn-tutorial-sudah');
    const titleElement = document.querySelector('.hero-content .antique-title');
    const descElement = document.querySelector('.hero-content .hero-desc');

    const hasWatchedTutorial = localStorage.getItem('tutorialWatched') === 'true';

    let cloneWrapper = null;
    let cloneTitle = null;
    let cloneDesc = null;

    if (!hasWatchedTutorial && tutorialWrapper) {
        document.body.classList.add('tutorial-active');
        
        // Helper to clone and position elements over overlay
        const cloneAndPosition = (el, extraClass = '') => {
            if (!el) return null;
            const clone = el.cloneNode(true);
            clone.id = clone.id ? clone.id + "Clone" : "";
            const rect = el.getBoundingClientRect();
            clone.style.position = 'fixed';
            clone.style.top = rect.top + 'px';
            clone.style.left = rect.left + 'px';
            clone.style.width = rect.width + 'px';
            clone.style.height = rect.height + 'px';
            clone.style.zIndex = '10000';
            clone.style.margin = '0';
            clone.style.pointerEvents = 'none';
            clone.style.textAlign = 'center'; // so we can't click the text and mess up things
            
            // if it's the wrapper, we need pointer events
            if (extraClass) {
                clone.classList.add(extraClass);
                clone.style.pointerEvents = 'auto';
            }
            
            document.body.appendChild(clone);
            return clone;
        };

        cloneTitle = cloneAndPosition(titleElement);
        cloneDesc = cloneAndPosition(descElement);
        cloneWrapper = cloneAndPosition(tutorialWrapper, 'tutorial-highlight');
        
        // Add events to the clone wrapper
        const cloneBtnTonton = cloneWrapper.querySelector('#btn-tonton-tutorial');
        const cloneBtnSudah = cloneWrapper.querySelector('#btn-tutorial-sudah');
        
        const closeTutorial = () => {
            localStorage.setItem('tutorialWatched', 'true');
            document.body.classList.remove('tutorial-active');
            if (cloneWrapper) cloneWrapper.remove();
            if (cloneTitle) cloneTitle.remove();
            if (cloneDesc) cloneDesc.remove();
        };

        if (cloneBtnTonton) {
            cloneBtnTonton.addEventListener('click', (e) => {
                closeTutorial();
            });
        }

        if (cloneBtnSudah) {
            cloneBtnSudah.addEventListener('click', (e) => {
                e.preventDefault();
                closeTutorial();
            });
        }
        
        // Handle resize to keep position accurate
        window.addEventListener('resize', () => {
            if (document.body.classList.contains('tutorial-active')) {
                if (cloneWrapper && tutorialWrapper) {
                    const rect = tutorialWrapper.getBoundingClientRect();
                    cloneWrapper.style.top = rect.top + 'px';
                    cloneWrapper.style.left = rect.left + 'px';
                    cloneWrapper.style.width = rect.width + 'px';
                    cloneWrapper.style.height = rect.height + 'px';
                }
                if (cloneTitle && titleElement) {
                    const rect = titleElement.getBoundingClientRect();
                    cloneTitle.style.top = rect.top + 'px';
                    cloneTitle.style.left = rect.left + 'px';
                    cloneTitle.style.width = rect.width + 'px';
                    cloneTitle.style.height = rect.height + 'px';
                }
                if (cloneDesc && descElement) {
                    const rect = descElement.getBoundingClientRect();
                    cloneDesc.style.top = rect.top + 'px';
                    cloneDesc.style.left = rect.left + 'px';
                    cloneDesc.style.width = rect.width + 'px';
                    cloneDesc.style.height = rect.height + 'px';
                }
            }
        });
    }

    // Still keep original events in case it's clicked normally
    const closeTutorialNormal = () => {
        localStorage.setItem('tutorialWatched', 'true');
        document.body.classList.remove('tutorial-active');
        if (tutorialWrapper) {
            tutorialWrapper.classList.remove('tutorial-highlight');
        }
    };

    if (btnTontonTutorial) {
        btnTontonTutorial.addEventListener('click', () => {
            closeTutorialNormal();
        });
    }

    if (btnTutorialSudah) {
        btnTutorialSudah.addEventListener('click', (e) => {
            e.preventDefault();
            closeTutorialNormal();
        });
    }
});

// Function to copy terminal code in macOS guide
function copyTerminalCode() {
    const codeText = document.getElementById('terminalCode').innerText;
    navigator.clipboard.writeText(codeText).then(() => {
        alert('Arahan telah disalin. Sila tampal (paste) terus ke dalam Terminal.');
    }).catch(err => {
        console.error('Gagal menyalin:', err);
        alert('Gagal menyalin arahan. Sila salin secara manual.');
    });
}
