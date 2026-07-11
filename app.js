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
                { id: 'track-3-1', title: 'Easter Egg', duration: '3:45', isTitle: false, url: 'assets/audio/01.BAVI_Easter Egg.wav' },
                { id: 'track-3-2', title: 'Secret Room', duration: '3:12', isTitle: false, url: 'assets/audio/02.BAVI_Secret Room.wav' },
                { id: 'track-3-3', title: 'Ocean Form', duration: '4:01', isTitle: false, url: 'assets/audio/03.BAVI_Ocean Form.wav' },
                { id: 'track-3-4', title: 'Branch', duration: '3:30', isTitle: false, url: 'assets/audio/04.BAVI_Branch.wav' },
                { id: 'track-3-5', title: 'Hello, World!', duration: '3:20', isTitle: false, url: 'assets/audio/05.BAVI_Hello, World!.wav' },
                { id: 'track-3-6', title: 'Perfect Glitch', duration: '3:55', isTitle: true, url: 'assets/audio/06. BAVI_Perfect Glitch.wav' }
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
            playIcon.setAttribute('data-lucide', 'pause');
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
        playIcon.setAttribute('data-lucide', 'play');
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
            muteIcon.setAttribute('data-lucide', 'volume-x');
        } else if (currentVolume < 0.4) {
            muteIcon.setAttribute('data-lucide', 'volume-1');
        } else {
            muteIcon.setAttribute('data-lucide', 'volume-2');
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

    // Hero banner Play trigger
    const heroPlayBtn = document.getElementById('heroPlayBtn');
    heroPlayBtn.addEventListener('click', () => {
        // Find Perfect Glitch track in playlist
        const trackIdx = playlist.findIndex(t => t.title === 'Perfect Glitch');
        if (trackIdx !== -1) {
            loadSong(trackIdx);
            showToast('Playing: Perfect Glitch (1st Special EP)', 'music');
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
                    item.innerHTML = `
                        <span class="track-number">${String(index + 1).padStart(2, '0')}</span>
                        <div class="track-info">
                            <span class="track-title ${track.isTitle ? 'is-title-song' : ''}">${track.title}</span>
                        </div>
                        <span class="track-duration">${track.duration}</span>
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
    // 8. Gallery Filters & Lightbox Slider
    // ==========================================================================
    const filterButtons = document.querySelectorAll('.btn-filter');
    const galleryItems = document.querySelectorAll('.gallery-item');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxCaption = document.getElementById('lightboxCaption');
    const lightboxCloseBtn = document.getElementById('lightboxCloseBtn');
    const lightboxPrevBtn = document.getElementById('lightboxPrevBtn');
    const lightboxNextBtn = document.getElementById('lightboxNextBtn');

    let activeGalleryItems = Array.from(galleryItems);
    let currentLightboxIndex = 0;

    // Filter Logic
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from buttons
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.getAttribute('data-filter');
            activeGalleryItems = [];

            galleryItems.forEach(item => {
                if (filter === 'all' || item.classList.contains(filter)) {
                    item.style.display = 'block';
                    activeGalleryItems.push(item);
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });

    // Lightbox Open
    galleryItems.forEach(item => {
        item.addEventListener('click', () => {
            // Find current index in filtered list
            currentLightboxIndex = activeGalleryItems.indexOf(item);
            if (currentLightboxIndex !== -1) {
                openLightbox();
            }
        });
    });

    function openLightbox() {
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
    lightboxCloseBtn.addEventListener('click', closeLightbox);
    
    lightboxPrevBtn.addEventListener('click', () => {
        if (activeGalleryItems.length === 0) return;
        currentLightboxIndex = (currentLightboxIndex - 1 + activeGalleryItems.length) % activeGalleryItems.length;
        openLightbox();
    });

    lightboxNextBtn.addEventListener('click', () => {
        if (activeGalleryItems.length === 0) return;
        currentLightboxIndex = (currentLightboxIndex + 1) % activeGalleryItems.length;
        openLightbox();
    });

    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) closeLightbox();
    });

    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }

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
    // 9. Debut Release Schedule Countdown
    // ==========================================================================
    const countdownTimer = document.getElementById('countdownTimer');
    // Set target date for next release (August 20, 2026 12:00:00 KST)
    const targetDate = new Date("2026-08-20T12:00:00+09:00").getTime();

    function updateCountdown() {
        const now = new Date().getTime();
        const difference = targetDate - now;

        if (difference < 0) {
            countdownTimer.textContent = "ALBUM LAUNCHED!";
            clearInterval(timerInterval);
            return;
        }

        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        countdownTimer.textContent = `D-${days}D ${String(hours).padStart(2, '0')}H ${String(minutes).padStart(2, '0')}M ${String(seconds).padStart(2, '0')}S`;
    }

    updateCountdown(); // Run once initially
    const timerInterval = setInterval(updateCountdown, 1000);


    // ==========================================================================
    // 10. Contact Form & EPK Download Animations
    // ==========================================================================
    const contactForm = document.getElementById('contactForm');
    const btnDownloadEPK = document.getElementById('btnDownloadEPK');

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

    btnDownloadEPK.addEventListener('click', () => {
        btnDownloadEPK.classList.add('loading');
        showToast('Preparing download package...', 'loader');

        setTimeout(() => {
            showToast('Download started: BAVI_Official_EPK_2026.zip', 'download-cloud');
            // Mock download action by triggering a fake download event
            const link = document.createElement('a');
            link.href = '#';
            link.setAttribute('download', 'BAVI_Official_EPK_2026.zip');
            document.body.appendChild(link);
            link.click();
            link.remove();
        }, 1200);
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
