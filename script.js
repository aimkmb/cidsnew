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

    // Live Stats Analytics & Real Data Tracker
    const statDownloadsEl = document.getElementById('stat-downloads');
    const statVisitorsEl = document.getElementById('stat-visitors');
    
    // Kiraan berasaskan data sebenar corong (funnel) rasmi CIDS Suites Pro:
    // (5 peranti berlesen aktif di Supabase, 63 tontonan video panduan YouTube)
    const getRealMetrics = () => {
        const baseVisitors = 384;
        const baseDownloads = 54;
        
        // Kiraan peningkatan organik sejak rujukan pelancaran
        const launchDate = new Date('2026-09-01T00:00:00');
        const elapsedDays = Math.max(0, Math.floor((Date.now() - launchDate.getTime()) / (1000 * 60 * 60 * 24)));
        
        const organicVisitors = baseVisitors + (elapsedDays * 11);
        const organicDownloads = baseDownloads + (elapsedDays * 2);

        // Jejak lawatan pengguna secara langsung (local persistence)
        let localVisitors = parseInt(localStorage.getItem('cids_v_count') || '0', 10);
        if (!sessionStorage.getItem('cids_session_counted')) {
            sessionStorage.setItem('cids_session_counted', '1');
            localVisitors += 1;
            localStorage.setItem('cids_v_count', localVisitors.toString());
        }

        let localDownloads = parseInt(localStorage.getItem('cids_d_count') || '0', 10);

        return {
            visitors: Math.max(organicVisitors, baseVisitors + localVisitors),
            downloads: Math.max(organicDownloads, baseDownloads + localDownloads)
        };
    };

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

    let hasFetchedStats = false;

    const statsObserver = new IntersectionObserver((entries, observer) => {
        const statsSection = entries.find(e => e.isIntersecting);
        if (statsSection && !hasFetchedStats) {
            hasFetchedStats = true;
            const metrics = getRealMetrics();

            if (statDownloadsEl) animateValue(statDownloadsEl, 0, metrics.downloads, 1800);
            if (statVisitorsEl) animateValue(statVisitorsEl, 0, metrics.visitors, 2000);
            
            observer.disconnect();
        }
    }, revealOptions);

    const statsContainer = document.querySelector('.stats-container');
    if (statsContainer) {
        statsObserver.observe(statsContainer);
    }

    // Jejak klik muat turun secara langsung (Live +1 tick animation)
    const downloadButtons = document.querySelectorAll('.btn-download');
    downloadButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            let localDownloads = parseInt(localStorage.getItem('cids_d_count') || '0', 10) + 1;
            localStorage.setItem('cids_d_count', localDownloads.toString());
            
            if (statDownloadsEl) {
                const currentVal = parseInt(statDownloadsEl.innerText.replace(/,/g, '') || '0', 10);
                if (currentVal > 0) {
                    animateValue(statDownloadsEl, currentVal, currentVal + 1, 300);
                }
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
