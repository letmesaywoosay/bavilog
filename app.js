/* ==========================================================================
   BAVI Official Portfolio - Javascript Logic
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    
    // Initialize Lucide Icons
    lucide.createIcons();

    // ==========================================================================
    // 1. Core State & Data
    // ==========================================================================
    const albumData = {
        'album-3': {
            name: 'BAVIation',
            type: '1st Special EP',
            release: '2026.07.11',
            desc: '바비(BAVI)의 독보적인 예술성과 다채로운 음악 스펙트럼을 모은 스페셜 EP 앨범 "BAVIation"입니다. 몽환적이면서도 세련된 트랙들이 수록되어 아티스트의 고유한 감성을 깊이 있게 전합니다.',
            cover: 'assets/images/album_baviation.jpg',
            tracks: [
                { id: 'track-3-1', title: 'Easter Egg', duration: '2:43', isTitle: false, url: 'assets/audio/EP_BAVIation part1/01.BAVI_Easter Egg.wav', lyricsUrl: 'assets/audio/EP_BAVIation part1/01.BAVI_Easter Egg.txt' },
                { id: 'track-3-2', title: 'Secret Room', duration: '2:57', isTitle: false, url: 'assets/audio/EP_BAVIation part1/02.BAVI_Secret Room.wav', lyricsUrl: 'assets/audio/EP_BAVIation part1/02.BAVI_Secret Room.txt' },
                { id: 'track-3-3', title: 'Ocean Form', duration: '2:55', isTitle: false, url: 'assets/audio/EP_BAVIation part1/03.BAVI_Ocean Form.wav', lyricsUrl: 'assets/audio/EP_BAVIation part1/03.BAVI_Ocean Form.txt' },
                { id: 'track-3-4', title: 'Branch', duration: '2:51', isTitle: false, url: 'assets/audio/EP_BAVIation part1/04.BAVI_Branch.wav', lyricsUrl: 'assets/audio/EP_BAVIation part1/04.BAVI_Branch.txt' },
                { id: 'track-3-5', title: 'Hello, World!', duration: '3:40', isTitle: false, url: 'assets/audio/EP_BAVIation part1/05.BAVI_Hello, World!.wav', lyricsUrl: 'assets/audio/EP_BAVIation part1/05.BAVI_Hello, World!.txt' },
                { id: 'track-3-6', title: 'Perfect Glitch', duration: '3:03', isTitle: true, url: 'assets/audio/EP_BAVIation part1/06. BAVI_Perfect Glitch.wav', lyricsUrl: 'assets/audio/EP_BAVIation part1/06. BAVI_Perfect Glitch.txt' }
            ]
        },
        'album-4': {
            name: 'Just One Minute',
            type: 'Single',
            release: '2026.07.17',
            desc: '바비(BAVI)의 청량하면서도 위트 있는 음악적 시도를 담아낸 싱글 "Just One Minute"입니다. 중독성 있는 멜로디와 경쾌한 리듬이 어우러져 리스너들의 귓가를 매료시킵니다.',
            cover: 'assets/images/album_just_one_minute.png',
            tracks: [
                { id: 'track-4-1', title: 'Just One Minute', duration: '2:59', isTitle: true, url: 'assets/audio/Single_Just One Minute/BAVI_Just One Minute.wav', lyricsUrl: 'assets/audio/Single_Just One Minute/BAVI_Just One Minute.txt' }
            ]
        }
    };

    // Flatten track list for next/prev player navigation
    let playlist = [];
    Object.keys(albumData).forEach(albumId => {
        const album = albumData[albumId];
        album.tracks.forEach(track => {
            playlist.push({
                ...track,
                albumName: album.name,
                albumImg: album.cover
            });
        });
    });

    let currentTrackIndex = 0;
    let isPlaying = false;
    let currentVolume = 0.8;
    let isMuted = false;

    // Elements
    const audioElement = document.getElementById('audioElement');
    const playerBar = document.getElementById('playerBar');
    const playerAlbumImg = document.getElementById('playerAlbumImg');
    const playerSongTitle = document.getElementById('playerSongTitle');
    const playerSongArtist = document.getElementById('playerSongArtist');
    const playerBtnPlay = document.getElementById('playerBtnPlay');
    const playerBtnPrev = document.getElementById('playerBtnPrev');
    const playerBtnNext = document.getElementById('playerBtnNext');
    const playerBtnMute = document.getElementById('playerBtnMute');
    const playIcon = document.getElementById('playIcon');
    const muteIcon = document.getElementById('muteIcon');
    const miniVisualizer = document.getElementById('miniVisualizer');
    
    const progressBar = document.getElementById('progressBar');
    const progressBarWrapper = document.getElementById('progressBarWrapper');
    const currentTimeLabel = document.getElementById('currentTimeLabel');
    const durationLabel = document.getElementById('durationLabel');
    const volumeSliderWrapper = document.getElementById('volumeSliderWrapper');
    const volumeSliderBar = document.getElementById('volumeSliderBar');

    // Set initial volume
    audioElement.volume = currentVolume;

    // ==========================================================================
    // 2. Interactive Background & Custom Cursor
    // ==========================================================================
    const bgGlow = document.getElementById('bgGlow');
    const customCursor = document.getElementById('customCursor');

    window.addEventListener('mousemove', (e) => {
        // Move Background glow smoothly
        bgGlow.style.left = e.clientX + 'px';
        bgGlow.style.top = e.clientY + 'px';

        // Move Custom Cursor
        customCursor.style.left = e.clientX + 'px';
        customCursor.style.top = e.clientY + 'px';
    });

    // Hover effect for cursor
    const hoverableElements = document.querySelectorAll('a, button, .album-card, .gallery-item, .btn-icon-play, .btn-filter, .social-link');
    hoverableElements.forEach(elem => {
        elem.addEventListener('mouseenter', () => {
            customCursor.classList.add('hovered');
        });
        elem.addEventListener('mouseleave', () => {
            customCursor.classList.remove('hovered');
        });
    });


    // ==========================================================================
    // 3. Navigation Header & Scroll Sync
    // ==========================================================================
    const header = document.querySelector('.header');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section');

    // Header background transparency transition on scroll
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.style.background = 'rgba(9, 5, 20, 0.9)';
            header.style.padding = '10px 0';
        } else {
            header.style.background = 'rgba(9, 5, 20, 0.7)';
            header.style.padding = '0';
        }
    });

    // Update active GNB nav link on scroll
    const scrollObserverOptions = {
        root: null,
        threshold: 0.3,
        rootMargin: "-80px 0px 0px 0px"
    };

    const scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, scrollObserverOptions);

    sections.forEach(section => scrollObserver.observe(section));


    // ==========================================================================
    // 4. Mobile Navigation Hamburger Menu
    // ==========================================================================
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const navMobile = document.getElementById('navMobile');
    const navMobileLinks = document.querySelectorAll('.nav-mobile-link');

    hamburgerBtn.addEventListener('click', () => {
        hamburgerBtn.classList.toggle('active');
        navMobile.classList.toggle('active');
    });

    navMobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            hamburgerBtn.classList.remove('active');
            navMobile.classList.remove('active');
        });
    });


    // ==========================================================================
    // 5. Toast Notifications
    // ==========================================================================
    const toastContainer = document.getElementById('toastContainer');

    function showToast(message, iconName = 'info') {
        const toast = document.createElement('div');
        toast.className = 'toast glass';
        toast.innerHTML = `
            <i data-lucide="${iconName}" class="toast-icon"></i>
            <span>${message}</span>
        `;
        toastContainer.appendChild(toast);
        lucide.createIcons();

        // Trigger transition
        setTimeout(() => toast.classList.add('show'), 50);

        // Hide and remove toast
        setTimeout(() => {
            toast.classList.remove('show');
            toast.addEventListener('transitionend', () => toast.remove());
        }, 3000);
    }


    // ==========================================================================
    // 6. Custom Audio Player Engine
    // ==========================================================================
    
    // Load song and initialize player UI
    function loadSong(trackIndex, playImmediately = true) {
        currentTrackIndex = trackIndex;
        const track = playlist[trackIndex];

        audioElement.src = track.url;
        playerSongTitle.textContent = track.title;
        playerSongArtist.textContent = 'BAVI';
        playerAlbumImg.src = track.albumImg;

        // Open bottom bar player if it's hidden
        playerBar.classList.add('active');

        if (playImmediately) {
            playSong();
        } else {
            pauseSong();
        }
    }

    function playSong() {
        isPlaying = true;
        audioElement.play().then(() => {
            playerBtnPlay.innerHTML = '<i data-lucide="pause"></i>';
            miniVisualizer.classList.add('playing');
            lucide.createIcons();
        }).catch(err => {
            console.error("Audio playback error:", err);
            isPlaying = false;
        });
    }

    function pauseSong() {
        isPlaying = false;
        audioElement.pause();
        playerBtnPlay.innerHTML = '<i data-lucide="play"></i>';
        miniVisualizer.classList.remove('playing');
        lucide.createIcons();
    }

    // Toggle Play/Pause
    playerBtnPlay.addEventListener('click', () => {
        if (isPlaying) {
            pauseSong();
        } else {
            playSong();
        }
    });

    // Next Track
    playerBtnNext.addEventListener('click', () => {
        currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
        loadSong(currentTrackIndex);
        showToast(`Next track: ${playlist[currentTrackIndex].title}`, 'music');
    });

    // Previous Track
    playerBtnPrev.addEventListener('click', () => {
        currentTrackIndex = (currentTrackIndex - 1 + playlist.length) % playlist.length;
        loadSong(currentTrackIndex);
        showToast(`Previous track: ${playlist[currentTrackIndex].title}`, 'music');
    });

    // Handle audio metadata loaded (set duration)
    audioElement.addEventListener('durationchange', () => {
        durationLabel.textContent = formatTime(audioElement.duration);
    });

    // Timeupdate progress tracking
    audioElement.addEventListener('timeupdate', () => {
        const currentTime = audioElement.currentTime;
        const duration = audioElement.duration || 0;
        
        // Update Labels
        currentTimeLabel.textContent = formatTime(currentTime);
        
        // Update progress bar width
        if (duration > 0) {
            const progressPercent = (currentTime / duration) * 100;
            progressBar.style.width = `${progressPercent}%`;
        }
    });

    // End of song -> Next song auto play
    audioElement.addEventListener('ended', () => {
        currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
        loadSong(currentTrackIndex);
    });

    // Progress bar seeking interaction
    progressBarWrapper.addEventListener('click', (e) => {
        const width = progressBarWrapper.clientWidth;
        const clickX = e.offsetX;
        const duration = audioElement.duration;

        if (duration) {
            audioElement.currentTime = (clickX / width) * duration;
        }
    });

    // Volume Slider Seek
    volumeSliderWrapper.addEventListener('click', (e) => {
        const width = volumeSliderWrapper.clientWidth;
        const clickX = e.offsetX;
        let volume = clickX / width;
        
        // Clamp volume
        if (volume < 0) volume = 0;
        if (volume > 1) volume = 1;

        currentVolume = volume;
        audioElement.volume = volume;
        volumeSliderBar.style.width = `${volume * 100}%`;
        isMuted = false;
        
        updateMuteIcon();
    });

    // Mute/Unmute toggle
    playerBtnMute.addEventListener('click', () => {
        isMuted = !isMuted;
        audioElement.muted = isMuted;
        updateMuteIcon();
    });

    function updateMuteIcon() {
        if (isMuted || currentVolume === 0) {
            playerBtnMute.innerHTML = '<i data-lucide="volume-x"></i>';
        } else if (currentVolume < 0.4) {
            playerBtnMute.innerHTML = '<i data-lucide="volume-1"></i>';
        } else {
            playerBtnMute.innerHTML = '<i data-lucide="volume-2"></i>';
        }
        lucide.createIcons();
    }

    // Format helper function
    function formatTime(seconds) {
        if (isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }

    // ==========================================================================
    // Hero Crossfade — swap title/desc/img in-place every 5 s
    // ==========================================================================
    const heroAlbums = [
        {
            title: 'BAVIation',
            desc: 'BAVI의 스페셜 EP 앨범 \'BAVIation\' 발매.<br>몽환적이면서도 세련된 타이틀곡 \'Perfect Glitch\'를 지금 감상해보세요.',
            img: 'assets/images/album_baviation.jpg',
            imgAlt: 'BAVIation Album Cover',
            trackTitle: 'Perfect Glitch',
            toastMsg: 'Playing: Perfect Glitch (1st Special EP)'
        },
        {
            title: 'Just One Minute',
            desc: 'BAVI의 신보 싱글 \'Just One Minute\' 발매.<br>중독성 있는 멜로디와 경쾌한 리듬이 귓가를 매료시킵니다.',
            img: 'assets/images/album_just_one_minute.png',
            imgAlt: 'Just One Minute Album Cover',
            trackTitle: 'Just One Minute',
            toastMsg: 'Playing: Just One Minute (Single)'
        }
    ];

    const heroTitleEl = document.getElementById('heroTitle');
    const heroDescEl  = document.getElementById('heroDesc');
    const heroImgEl   = document.getElementById('heroImg');
    const heroDots    = document.querySelectorAll('.hero-dot');
    let currentHeroIdx = 0;
    let heroTimer = null;

    const FADE_DURATION = 550; // ms — must match CSS transition

    const swapHeroContent = (idx) => {
        const album = heroAlbums[idx];
        // 1. Fade out changing elements
        heroTitleEl.classList.add('hero-fading');
        heroDescEl.classList.add('hero-fading');
        heroImgEl.classList.add('hero-fading');

        setTimeout(() => {
            // 2. Swap content while invisible
            heroTitleEl.textContent = album.title;
            heroDescEl.innerHTML = album.desc;
            heroImgEl.src = album.img;
            heroImgEl.alt = album.imgAlt;

            // Update dots
            heroDots.forEach((d, i) => d.classList.toggle('active', i === idx));

            // 3. Fade back in
            heroTitleEl.classList.remove('hero-fading');
            heroDescEl.classList.remove('hero-fading');
            heroImgEl.classList.remove('hero-fading');
        }, FADE_DURATION);
    };

    const goToHeroSlide = (idx) => {
        currentHeroIdx = (idx + heroAlbums.length) % heroAlbums.length;
        swapHeroContent(currentHeroIdx);
    };

    const startHeroTimer = () => {
        heroTimer = setInterval(() => goToHeroSlide(currentHeroIdx + 1), 5000);
    };

    heroDots.forEach((dot, i) => {
        dot.addEventListener('click', () => {
            clearInterval(heroTimer);
            goToHeroSlide(i);
            startHeroTimer();
        });
    });

    startHeroTimer();

    // Hero LISTEN NOW — plays whichever album is currently shown
    const heroPlayBtn = document.getElementById('heroPlayBtn');
    heroPlayBtn.addEventListener('click', () => {
        const album = heroAlbums[currentHeroIdx];
        const trackIdx = playlist.findIndex(t => t.title === album.trackTitle);
        if (trackIdx !== -1) {
            loadSong(trackIdx);
            showToast(album.toastMsg, 'music');
        }
    });

    // Album hover play buttons (GNB & Page list triggers)
    document.querySelectorAll('.btn-icon-play').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const trackUrl = btn.getAttribute('data-track-url');
            const trackIdx = playlist.findIndex(t => t.url === trackUrl);
            if (trackIdx !== -1) {
                loadSong(trackIdx);
                showToast(`Playing Album Title: ${playlist[trackIdx].albumName}`, 'music');
            }
        });
    });


    // ==========================================================================
    // 7. Album Detail Modal Popup
    // ==========================================================================
    const albumModal = document.getElementById('albumModal');
    const modalCloseBtn = document.getElementById('modalCloseBtn');
    const modalAlbumImg = document.getElementById('modalAlbumImg');
    const modalAlbumType = document.getElementById('modalAlbumType');
    const modalAlbumName = document.getElementById('modalAlbumName');
    const modalAlbumDesc = document.getElementById('modalAlbumDesc');
    const modalTracklist = document.getElementById('modalTracklist');

    document.querySelectorAll('.btn-album-details').forEach((btn) => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const card = btn.closest('.album-card');
            const albumId = card.getAttribute('data-album-id');
            const album = albumData[albumId];

            if (album) {
                // Populate Modal Data
                modalAlbumImg.src = album.cover;
                modalAlbumImg.alt = album.name;
                modalAlbumType.textContent = album.type;
                modalAlbumName.textContent = album.name;
                modalAlbumDesc.textContent = album.desc;

                // Populate Tracklist
                modalTracklist.innerHTML = '';
                album.tracks.forEach((track, index) => {
                    const item = document.createElement('div');
                    item.className = 'track-item';
                    const hasLyrics = !!track.lyricsUrl;
                    item.innerHTML = `
                        <span class="track-number">${String(index + 1).padStart(2, '0')}</span>
                        <div class="track-info">
                            <span class="track-title ${track.isTitle ? 'is-title-song' : ''}">${track.title}</span>
                        </div>
                        <span class="track-duration">${track.duration}</span>
                        <button class="btn-lyrics ${hasLyrics ? '' : 'no-lyrics'}" data-lyrics-url="${track.lyricsUrl || ''}" data-track-title="${track.title}" ${hasLyrics ? '' : 'disabled'} title="${hasLyrics ? '가사 보기' : '가사 없음'}">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                <polyline points="14 2 14 8 20 8"/>
                                <line x1="16" y1="13" x2="8" y2="13"/>
                                <line x1="16" y1="17" x2="8" y2="17"/>
                                <polyline points="10 9 9 9 8 9"/>
                            </svg>
                        </button>
                        <button class="btn-track-play" data-track-url="${track.url}">
                            <i data-lucide="play"></i>
                        </button>
                    `;
                    modalTracklist.appendChild(item);
                });

                // Attach track item play handlers
                modalTracklist.querySelectorAll('.btn-track-play').forEach(playBtn => {
                    playBtn.addEventListener('click', () => {
                        const trackUrl = playBtn.getAttribute('data-track-url');
                        const trackIdx = playlist.findIndex(t => t.url === trackUrl);
                        if (trackIdx !== -1) {
                            loadSong(trackIdx);
                            showToast(`Playing: ${playlist[trackIdx].title}`, 'music');
                        }
                    });
                });

                // Attach lyrics button handlers
                modalTracklist.querySelectorAll('.btn-lyrics:not([disabled])').forEach(lyricsBtn => {
                    lyricsBtn.addEventListener('click', async () => {
                        const lyricsUrl = lyricsBtn.getAttribute('data-lyrics-url');
                        const trackTitle = lyricsBtn.getAttribute('data-track-title');
                        openLyricsModal(trackTitle, lyricsUrl);
                    });
                });

                lucide.createIcons();

                // Open modal
                albumModal.classList.add('active');
                document.body.style.overflow = 'hidden'; // prevent back scroll
            }
        });
    });

    // Close modal
    const closeModal = () => {
        albumModal.classList.remove('active');
        document.body.style.overflow = '';
    };

    modalCloseBtn.addEventListener('click', closeModal);
    albumModal.addEventListener('click', (e) => {
        if (e.target === albumModal) closeModal();
    });

    // ==========================================================================
    // Lyrics Modal Logic
    // ==========================================================================
    const lyricsModal = document.getElementById('lyricsModal');
    const lyricsModalCloseBtn = document.getElementById('lyricsModalCloseBtn');
    const lyricsSongTitle = document.getElementById('lyricsSongTitle');
    const lyricsBody = document.getElementById('lyricsBody');

    const openLyricsModal = async (trackTitle, lyricsUrl) => {
        // Set title
        lyricsSongTitle.textContent = trackTitle;
        // Loading state
        lyricsBody.innerHTML = '<p class="lyrics-loading">가사를 불러오는 중...</p>';
        lyricsModal.classList.add('active');

        try {
            const response = await fetch(lyricsUrl);
            if (!response.ok) throw new Error('Not found');
            const text = await response.text();
            // Render each line as a <p>; blank lines become spacer <p class="lyrics-spacer">
            const lines = text.split(/\r?\n/);
            lyricsBody.innerHTML = lines.map(line =>
                line.trim() === ''
                    ? '<p class="lyrics-spacer">&nbsp;</p>'
                    : `<p>${line}</p>`
            ).join('');
        } catch {
            lyricsBody.innerHTML = '<p class="lyrics-empty">가사 정보가 없습니다.</p>';
        }
    };

    const closeLyricsModal = () => {
        lyricsModal.classList.remove('active');
    };

    lyricsModalCloseBtn.addEventListener('click', closeLyricsModal);
    lyricsModal.addEventListener('click', (e) => {
        if (e.target === lyricsModal) closeLyricsModal();
    });


    // ==========================================================================
    // 8. Gallery Filters & Lightbox Slider (Dynamic Loader with Pagination)
    // ==========================================================================
    const filterButtons = document.querySelectorAll('.btn-filter');
    const galleryGrid = document.getElementById('galleryGrid');
    const galleryPagination = document.getElementById('galleryPagination');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxCaption = document.getElementById('lightboxCaption');
    const lightboxCloseBtn = document.getElementById('lightboxCloseBtn');
    const lightboxPrevBtn = document.getElementById('lightboxPrevBtn');
    const lightboxNextBtn = document.getElementById('lightboxNextBtn');

    let activeGalleryItems = [];
    let currentLightboxIndex = 0;

    let allGalleryData = [];
    let currentFilter = 'all';
    let currentPage = 1;
    const itemsPerPage = 9;

    // Load dynamic gallery data from JSON
    function loadGallery() {
        if (!galleryGrid) return;

        fetch('assets/images/gallery-data.json?t=' + new Date().getTime()) // Prevent browser caching
            .then(res => {
                if (!res.ok) throw new Error("Metadata file not found");
                return res.json();
            })
            .then(data => {
                allGalleryData = data || [];
                renderGallery();
            })
            .catch(err => {
                console.error("[Gallery] Failed to load gallery data:", err);
                galleryGrid.innerHTML = '<div class="gallery-error" style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--accent-pink);">Failed to load gallery. Make sure dev server/watcher is running.</div>';
                if (galleryPagination) galleryPagination.innerHTML = '';
            });
    }

    // Render gallery and pagination
    function renderGallery() {
        if (!galleryGrid) return;
        galleryGrid.innerHTML = '';

        // 1. Filter data based on active category
        const filteredData = allGalleryData.filter(item => {
            return currentFilter === 'all' || item.category.toLowerCase() === currentFilter;
        });

        const totalItems = filteredData.length;
        const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;

        // 2. Adjust current page bounds
        if (currentPage > totalPages) currentPage = totalPages;
        if (currentPage < 1) currentPage = 1;

        // 3. Check for empty gallery
        if (totalItems === 0) {
            galleryGrid.innerHTML = '<div class="gallery-empty" style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--text-muted);">No images found in CONCEPT, STAGE, or BEHIND folders.</div>';
            if (galleryPagination) galleryPagination.innerHTML = '';
            activeGalleryItems = [];
            return;
        }

        // 4. Slice data for the current page
        const startIndex = (currentPage - 1) * itemsPerPage;
        const slicedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

        // 5. Render items into grid
        slicedData.forEach(item => {
            const el = document.createElement('div');
            el.className = `gallery-item ${item.category.toLowerCase()}`;
            el.setAttribute('data-src', item.src);
            el.innerHTML = `
                <div class="gallery-img-wrapper">
                    <img src="${item.src}" alt="${item.title}" class="gallery-img" loading="lazy">
                    <div class="gallery-hover-overlay">
                        <span class="gallery-category">${item.category}</span>
                        <span class="gallery-title">${item.title}</span>
                        <i data-lucide="zoom-in" class="gallery-zoom-icon"></i>
                    </div>
                </div>
            `;
            
            // Bind click directly to open lightbox
            el.addEventListener('click', () => {
                currentLightboxIndex = activeGalleryItems.indexOf(el);
                if (currentLightboxIndex !== -1) {
                    openLightbox();
                }
            });

            galleryGrid.appendChild(el);
        });

        // 6. Set active gallery items for lightbox (sliced page items)
        const galleryItems = galleryGrid.querySelectorAll('.gallery-item');
        activeGalleryItems = Array.from(galleryItems);

        // 7. Render pagination controls
        renderPagination(totalPages);

        // 8. Run Lucide update to render dynamic zoom icon SVGs
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    // Render pagination buttons dynamically
    function renderPagination(totalPages) {
        if (!galleryPagination) return;
        galleryPagination.innerHTML = '';

        if (totalPages <= 1) return;

        // Prev Button
        const prevBtn = document.createElement('button');
        prevBtn.className = 'page-btn arrow-btn';
        prevBtn.innerHTML = '&laquo;';
        prevBtn.title = 'Previous Page';
        prevBtn.disabled = currentPage === 1;
        prevBtn.addEventListener('click', () => {
            currentPage--;
            renderGallery();
            document.getElementById('gallery').scrollIntoView({ behavior: 'smooth' });
        });
        galleryPagination.appendChild(prevBtn);

        // Number Buttons
        for (let i = 1; i <= totalPages; i++) {
            const pageBtn = document.createElement('button');
            pageBtn.className = `page-btn ${i === currentPage ? 'active' : ''}`;
            pageBtn.innerText = i;
            pageBtn.addEventListener('click', () => {
                currentPage = i;
                renderGallery();
                document.getElementById('gallery').scrollIntoView({ behavior: 'smooth' });
            });
            galleryPagination.appendChild(pageBtn);
        }

        // Next Button
        const nextBtn = document.createElement('button');
        nextBtn.className = 'page-btn arrow-btn';
        nextBtn.innerHTML = '&raquo;';
        nextBtn.title = 'Next Page';
        nextBtn.disabled = currentPage === totalPages;
        nextBtn.addEventListener('click', () => {
            currentPage++;
            renderGallery();
            document.getElementById('gallery').scrollIntoView({ behavior: 'smooth' });
        });
        galleryPagination.appendChild(nextBtn);
    }

    // Filter Logic
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            currentFilter = btn.getAttribute('data-filter').toLowerCase();
            currentPage = 1;
            renderGallery();
        });
    });

    function openLightbox() {
        if (activeGalleryItems.length === 0) return;
        const item = activeGalleryItems[currentLightboxIndex];
        const src = item.getAttribute('data-src');
        const captionTitle = item.querySelector('.gallery-title').textContent;
        const captionCategory = item.querySelector('.gallery-category').textContent;

        lightboxImg.src = src;
        lightboxCaption.innerHTML = `<span style="color:var(--accent-pink)">${captionCategory}</span> &mdash; ${captionTitle}`;

        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    // Lightbox navigation
    if (lightboxCloseBtn) lightboxCloseBtn.addEventListener('click', closeLightbox);
    
    if (lightboxPrevBtn) {
        lightboxPrevBtn.addEventListener('click', () => {
            if (activeGalleryItems.length === 0) return;
            currentLightboxIndex = (currentLightboxIndex - 1 + activeGalleryItems.length) % activeGalleryItems.length;
            openLightbox();
        });
    }

    if (lightboxNextBtn) {
        lightboxNextBtn.addEventListener('click', () => {
            if (activeGalleryItems.length === 0) return;
            currentLightboxIndex = (currentLightboxIndex + 1) % activeGalleryItems.length;
            openLightbox();
        });
    }

    if (lightbox) {
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) closeLightbox();
        });
    }

    function closeLightbox() {
        if (lightbox) lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }

    // Run initial gallery load
    loadGallery();

    // Keyboard navigation for lightbox & modal
    window.addEventListener('keydown', (e) => {
        if (lightbox.classList.contains('active')) {
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowRight') lightboxNextBtn.click();
            if (e.key === 'ArrowLeft') lightboxPrevBtn.click();
        }
        if (albumModal.classList.contains('active')) {
            if (e.key === 'Escape') closeModal();
        }
    });


    // ==========================================================================
    // 9. Launch Date Count-Up Timer
    // ==========================================================================
    const countdownTimer = document.getElementById('countdownTimer');
    // Set launch date (July 11, 2026 00:00:00 KST)
    const launchDate = new Date("2026-07-11T00:00:00+09:00").getTime();

    function updateCountdown() {
        const now = new Date().getTime();
        const difference = now - launchDate; // count up since launch date

        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        countdownTimer.textContent = `${days}D ${String(hours).padStart(2, '0')}H ${String(minutes).padStart(2, '0')}M ${String(seconds).padStart(2, '0')}S`;
    }

    updateCountdown(); // Run once initially
    const timerInterval = setInterval(updateCountdown, 1000);


    // ==========================================================================
    // 10. Contact Form Animations
    // ==========================================================================
    const contactForm = document.getElementById('contactForm');

    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const originalHtml = submitBtn.innerHTML;

        // Visual loading state
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<i data-lucide="loader" class="btn-icon animate-spin"></i> SENDING...`;
        lucide.createIcons();

        // Simulate network delay
        setTimeout(() => {
            showToast('Your message has been sent successfully!', 'check-circle-2');
            contactForm.reset();
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalHtml;
            lucide.createIcons();
        }, 1500);
    });


    // ==========================================================================
    // 11. Intersection Observer for Scroll Fade-In Effect
    // ==========================================================================
    const animObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
            }
        });
    }, {
        threshold: 0.1
    });

    // Make sections and primary cards fade in
    const sectionsToAnimate = document.querySelectorAll('section, .profile-card, .album-card, .gallery-item, .schedule-item, .contact-card');
    sectionsToAnimate.forEach(section => {
        section.classList.add('fade-in-section');
        animObserver.observe(section);
    });

    // Initialize player with the default Title song (Perfect Glitch) but do not show player bar or play automatically
    const defaultTrackIdx = playlist.findIndex(t => t.title === 'Perfect Glitch');
    if (defaultTrackIdx !== -1) {
        currentTrackIndex = defaultTrackIdx;
        audioElement.src = playlist[defaultTrackIdx].url;
    }

});
