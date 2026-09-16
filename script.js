(() => {
    'use strict';

    function initSite() {
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        const desktop = window.matchMedia('(min-width: 901px)');
        const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
        const menuToggle = document.getElementById('menuToggle');
        const siteNav = document.getElementById('siteNav');
        const motionToggle = document.getElementById('motionToggle');
        const heroArt = document.getElementById('heroArt');
        let userMotionChoice = false;

        function resetHero() {
            if (!heroArt) return;
            heroArt.style.setProperty('--pointer-x', '0deg');
            heroArt.style.setProperty('--pointer-y', '0deg');
        }

        function setMotionPaused(paused) {
            document.body.classList.toggle('motion-paused', paused);
            if (motionToggle) {
                motionToggle.setAttribute('aria-pressed', String(paused));
                motionToggle.textContent = paused ? 'Main animasi' : 'Jeda animasi';
            }
            if (paused) resetHero();
        }

        setMotionPaused(reducedMotion.matches);
        motionToggle?.addEventListener('click', () => {
            userMotionChoice = true;
            setMotionPaused(!document.body.classList.contains('motion-paused'));
        });
        reducedMotion.addEventListener('change', () => {
            if (!userMotionChoice) setMotionPaused(reducedMotion.matches);
            if (reducedMotion.matches) {
                resetHero();
                document.querySelectorAll('.reveal').forEach(element => {
                    element.classList.add('is-visible');
                });
            }
        });

        function closeMenu(restoreFocus = false) {
            if (!menuToggle || !siteNav) return;
            const wasOpen = menuToggle.getAttribute('aria-expanded') === 'true';
            menuToggle.setAttribute('aria-expanded', 'false');
            menuToggle.setAttribute('aria-label', 'Buka menu');
            siteNav.classList.remove('is-open');
            document.body.classList.remove('menu-open');
            if (restoreFocus && wasOpen) menuToggle.focus();
        }

        if (menuToggle && siteNav) {
            menuToggle.addEventListener('click', () => {
                const open = menuToggle.getAttribute('aria-expanded') !== 'true';
                menuToggle.setAttribute('aria-expanded', String(open));
                menuToggle.setAttribute('aria-label', open ? 'Tutup menu' : 'Buka menu');
                siteNav.classList.toggle('is-open', open);
                document.body.classList.toggle('menu-open', open);
            });
            siteNav.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', () => closeMenu());
            });
            document.addEventListener('click', event => {
                if (!siteNav.contains(event.target) && !menuToggle.contains(event.target)) closeMenu();
            });
            document.addEventListener('keydown', event => {
                if (event.key === 'Escape') closeMenu(true);
            });
            desktop.addEventListener('change', () => {
                if (desktop.matches) closeMenu();
                resetHero();
            });
        }

        const modules = [
            {
                id: 'rpt', name: 'RPT Assist', category: 'PERANCANGAN TAHUNAN',
                description: 'Susun Rancangan Pengajaran Tahunan berdasarkan kurikulum, standard kandungan dan takwim sekolah. Mulakan tahun dengan perancangan yang lebih teratur.',
                features: ['Selaras dengan kurikulum kebangsaan', 'Berpandukan takwim sekolah', 'Kurangkan pengisian berulang'],
                image: 'assets/screenshots/rpt_assist.png'
            },
            {
                id: 'schedule', name: 'Schedule Assist', category: 'PENGURUSAN JADUAL',
                description: 'Ekstrak dan selaraskan jadual waktu ke dalam sistem CIDS. Susun masa mengajar dengan aliran kerja yang lebih mudah.',
                features: ['Ekstrak maklumat jadual waktu', 'Selaraskan jadual ke dalam CIDS', 'Kurangkan kemasukan data manual'],
                image: 'assets/screenshots/schedule_assist.png'
            },
            {
                id: 'rph', name: 'RPH Assist', category: 'PERSEDIAAN HARIAN',
                description: 'Bantu sediakan Rancangan Pengajaran Harian mengikut objektif pembelajaran dan pedagogi abad ke-21. Lebih ruang untuk fokus pada pengajaran.',
                features: ['Berpandukan objektif pembelajaran', 'Sokongan pedagogi abad ke-21', 'Bantuan AI untuk penyediaan RPH'],
                image: 'assets/screenshots/rph_assist.png'
            },
            {
                id: 'deleter', name: 'RPH Deleter', category: 'PENGURUSAN REKOD',
                description: 'Urus rekod RPH lama atau yang tidak lagi diperlukan. Kemaskan rekod supaya urusan harian lebih teratur.',
                features: ['Urus rekod RPH yang tidak diperlukan', 'Kurangkan kerja pemadaman berulang', 'Kekalkan rekod yang lebih tersusun'],
                image: 'assets/screenshots/rph_deleter.png'
            },
            {
                id: 'settings', name: 'Tetapan Lanjutan', category: 'KAWALAN FLEKSIBEL',
                description: 'Laraskan kelajuan automasi dan tetapan aplikasi mengikut keselesaan anda serta keupayaan komputer.',
                features: ['Kawal kelajuan automasi', 'Sesuaikan dengan keupayaan peranti', 'Tetapan mengikut aliran kerja anda'],
                image: 'assets/SETTING BANNER.png'
            }
        ];
        const moduleStage = document.getElementById('moduleStage');
        const moduleButtons = [...document.querySelectorAll('[data-module-select]')];
        const moduleImage = document.getElementById('moduleImage');
        const moduleImageButton = document.getElementById('moduleImageButton');
        let currentModule = Math.max(0, modules.findIndex(module => module.id === moduleStage?.dataset.module));

        function selectModule(index, announce = true) {
            currentModule = (index + modules.length) % modules.length;
            const module = modules[currentModule];
            if (moduleStage) moduleStage.dataset.module = module.id;
            const text = {
                moduleNumber: String(currentModule + 1).padStart(2, '0'),
                moduleName: module.name,
                moduleCategory: module.category,
                moduleDescription: module.description,
                moduleFeature1: module.features[0],
                moduleFeature2: module.features[1],
                moduleFeature3: module.features[2]
            };
            Object.entries(text).forEach(([id, value]) => {
                const element = document.getElementById(id);
                if (element) element.textContent = value;
            });
            moduleButtons.forEach(button => {
                const active = button.dataset.moduleSelect === module.id;
                button.setAttribute('aria-pressed', String(active));
                button.classList.toggle('is-active', active);
            });
            if (moduleImage) {
                moduleImage.src = module.image;
                moduleImage.alt = `Paparan ${module.name} dalam CIDS Suites Pro`;
            }
            moduleImageButton?.setAttribute('aria-label', `Besarkan paparan ${module.name}`);
            const announcement = document.getElementById('moduleAnnouncement');
            if (announce && announcement) {
                announcement.textContent = `${module.name}, modul ${currentModule + 1} daripada ${modules.length}.`;
            }
        }

        if (moduleStage) {
            selectModule(currentModule, false);
            moduleButtons.forEach(button => {
                button.addEventListener('click', () => {
                    const index = modules.findIndex(module => module.id === button.dataset.moduleSelect);
                    if (index !== -1) selectModule(index);
                });
            });
            document.getElementById('moduleNext')?.addEventListener('click', () => selectModule(currentModule + 1));
            document.getElementById('modulePrev')?.addEventListener('click', () => selectModule(currentModule - 1));
        }

        const imageDialog = document.getElementById('imageDialog');
        const dialogImage = document.getElementById('dialogImage');
        const dialogTitle = document.getElementById('dialogTitle');
        let dialogTrigger = null;

        function closeImageDialog() {
            if (!imageDialog?.open) return;
            imageDialog.close();
        }

        function openImageDialog(source, title, trigger) {
            if (!source || !imageDialog || !dialogImage || imageDialog.open) return;
            dialogTrigger = trigger;
            dialogImage.src = source;
            dialogImage.alt = title;
            if (dialogTitle) dialogTitle.textContent = title;
            imageDialog.showModal();
            document.body.classList.add('dialog-open');
            imageDialog.querySelector('[data-close-dialog]')?.focus();
        }

        if (imageDialog) {
            imageDialog.querySelectorAll('[data-close-dialog]').forEach(button => {
                button.addEventListener('click', closeImageDialog);
            });
            imageDialog.addEventListener('click', event => {
                if (event.target !== imageDialog) return;
                const bounds = imageDialog.getBoundingClientRect();
                if (event.clientX < bounds.left || event.clientX > bounds.right ||
                    event.clientY < bounds.top || event.clientY > bounds.bottom) closeImageDialog();
            });
            imageDialog.addEventListener('close', () => {
                document.body.classList.remove('dialog-open');
                if (dialogTrigger?.isConnected) dialogTrigger.focus();
            });
            moduleImageButton?.addEventListener('click', () => {
                const module = modules[currentModule];
                openImageDialog(module.image, `Paparan ${module.name}`, moduleImageButton);
            });
            document.querySelectorAll('[data-preview-image]').forEach(button => {
                if (button === moduleImageButton) return;
                button.addEventListener('click', () => {
                    const image = button.querySelector('img');
                    const source = button.dataset.src || button.dataset.previewImage || image?.currentSrc || image?.src;
                    const title = button.dataset.previewTitle || button.dataset.title || image?.alt || 'Pratonton CIDS Suites Pro';
                    openImageDialog(source, title, button);
                });
            });
        }

        const previewToggle = document.getElementById('previewToggle');
        const previewPanel = document.getElementById('previewPanel');
        const livePreview = document.getElementById('livePreview');
        if (previewToggle && previewPanel && livePreview) {
            const closedLabel = previewToggle.textContent.trim();
            const labelNode = [...previewToggle.childNodes].find(node => node.nodeType === Node.TEXT_NODE && node.textContent.trim());
            previewToggle.addEventListener('click', () => {
                const opening = previewPanel.hidden;
                if (opening && !livePreview.getAttribute('src') && livePreview.dataset.src) {
                    livePreview.src = livePreview.dataset.src;
                }
                previewPanel.hidden = !opening;
                previewToggle.setAttribute('aria-expanded', String(opening));
                const label = opening ? 'Tutup pratonton' : closedLabel;
                if (labelNode) labelNode.textContent = `${label} `;
                else previewToggle.textContent = label;
            });
        }

        const copyCode = document.getElementById('copyCode');
        const terminalCode = document.getElementById('terminalCode');
        const copyStatus = document.getElementById('copyStatus');
        copyCode?.addEventListener('click', async () => {
            if (!terminalCode) return;
            try {
                if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
                await navigator.clipboard.writeText(terminalCode.textContent.trim());
                if (copyStatus) copyStatus.textContent = 'Arahan disalin.';
            } catch {
                const selection = window.getSelection();
                const range = document.createRange();
                range.selectNodeContents(terminalCode);
                selection?.removeAllRanges();
                selection?.addRange(range);
                if (copyStatus) copyStatus.textContent = 'Salinan automatik tidak tersedia. Pilih dan salin arahan secara manual.';
            }
        });

        const statistics = document.getElementById('statistics');
        if (statistics) {
            const controller = new AbortController();
            const timeout = window.setTimeout(() => controller.abort(), 8000);
            fetch('/api/stats?hit=1', { signal: controller.signal })
                .then(response => {
                    if (!response.ok) throw new Error('Statistics unavailable');
                    return response.json();
                })
                .then(data => {
                    const stats = data?.stats;
                    const fields = [
                        ['activeUsers', 'stat-active-users'],
                        ['downloads', 'stat-downloads'],
                        ['visitors', 'stat-visitors']
                    ];
                    if (!stats || !fields.every(([key]) => typeof stats[key] === 'number' && Number.isFinite(stats[key]) && stats[key] >= 0)) return;
                    fields.forEach(([key, id]) => {
                        const element = document.getElementById(id);
                        if (element) element.textContent = stats[key].toLocaleString('ms-MY', { maximumFractionDigits: 0 });
                    });
                    statistics.hidden = false;
                })
                .catch(() => {})
                .finally(() => window.clearTimeout(timeout));
        }
        document.querySelectorAll('[data-download]').forEach(link => {
            link.addEventListener('click', () => {
                fetch('/api/stats?download=1', { keepalive: true }).catch(() => {});
            });
        });

        const revealElements = document.querySelectorAll('.reveal');
        if ('IntersectionObserver' in window && !reducedMotion.matches) {
            const revealObserver = new IntersectionObserver(entries => {
                entries.forEach(entry => {
                    if (!entry.isIntersecting) return;
                    entry.target.classList.add('is-visible');
                    revealObserver.unobserve(entry.target);
                });
            }, { threshold: 0.08, rootMargin: '0px 0px 32px 0px' });
            revealElements.forEach(element => {
                revealObserver.observe(element);
                element.classList.add('reveal-ready');
            });
        } else {
            revealElements.forEach(element => element.classList.add('is-visible'));
        }

        const siteHeader = document.getElementById('siteHeader');
        const sectionLinks = siteNav ? [...siteNav.querySelectorAll('a[href^="#"]')]
            .map(link => ({ link, section: document.getElementById(link.hash.slice(1)) }))
            .filter(item => item.section) : [];
        let scrollFrame = 0;

        function updateScrollState() {
            scrollFrame = 0;
            siteHeader?.classList.toggle('is-scrolled', window.scrollY > 24);
            let active = null;
            const offset = (siteHeader?.offsetHeight || 80) + 80;
            sectionLinks.forEach(item => {
                if (item.section.getBoundingClientRect().top <= offset) active = item;
            });
            sectionLinks.forEach(item => {
                const current = item === active;
                item.link.classList.toggle('is-active', current);
                if (current) item.link.setAttribute('aria-current', 'location');
                else item.link.removeAttribute('aria-current');
            });
        }

        window.addEventListener('scroll', () => {
            if (!scrollFrame) scrollFrame = window.requestAnimationFrame(updateScrollState);
        }, { passive: true });
        updateScrollState();

        if (heroArt) {
            heroArt.addEventListener('pointermove', event => {
                if (!desktop.matches || !finePointer.matches || reducedMotion.matches ||
                    document.body.classList.contains('motion-paused')) return;
                const bounds = heroArt.getBoundingClientRect();
                if (!bounds.width || !bounds.height) return;
                const x = (event.clientX - bounds.left) / bounds.width - 0.5;
                const y = (event.clientY - bounds.top) / bounds.height - 0.5;
                heroArt.style.setProperty('--pointer-x', `${(-y * 8).toFixed(2)}deg`);
                heroArt.style.setProperty('--pointer-y', `${(x * 8).toFixed(2)}deg`);
            });
            heroArt.addEventListener('pointerleave', resetHero);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSite, { once: true });
    } else {
        initSite();
    }
})();
