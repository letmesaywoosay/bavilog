/* ==========================================================================
   BAVI Official Website - Taste Labs Inspired Application Logic
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    
    // Initialize Lucide Icons
    if (window.lucide) {
        lucide.createIcons();
    }

    // ==========================================================================
    // 1. Lenis Smooth Scrolling Engine
    // ==========================================================================
    let lenis;
    if (window.Lenis) {
        lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            touchMultiplier: 2,
            infinite: false
        });

        function raf(time) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);
    }

    // ==========================================================================
    // 2. Taste Labs Scramble Text Engine
    // ==========================================================================
    const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_#@$&';
    
    function scrambleElement(element) {
        const originalText = element.getAttribute('data-scramble') || element.textContent.trim();
        let iteration = 0;
        clearInterval(element._scrambleInterval);
        
        element._scrambleInterval = setInterval(() => {
            element.textContent = originalText
                .split('')
                .map((char, index) => {
                    if (index < iteration || char === ' ') {
                        return originalText[index];
                    }
                    return CHARS[Math.floor(Math.random() * CHARS.length)];
                })
                .join('');
            
            if (iteration >= originalText.length) {
                clearInterval(element._scrambleInterval);
            }
            iteration += 1 / 2;
        }, 30);
    }

    document.querySelectorAll('[data-scramble]').forEach(el => {
        el.addEventListener('mouseenter', () => scrambleElement(el));
    });

    // ==========================================================================
    // 3. Core State & Data
    // ==========================================================================
    const heroBanner = {
        title: 'BAVIation PART 2',
        desc: "정형화된 팝의 틀을 깨는 글리치 팝과 극도로 맑은 에어리 보컬.<br>몽환적이면서도 세련된 타이틀곡 'Perfect Glitch'의 새로운 주파수를 경험해보세요.",
        trackTitle: 'Perfect Glitch',
        toastMsg: 'Playing Title: Perfect Glitch (1st Special EP)',
        image: null
    };

    const albumData = {
        'album-3': {
            name: 'BAVIation',
            type: '1st Special EP',
            release: '2026.07.11',
            desc: '바비(BAVI)의 독보적인 예술성과 다채로운 음악 스펙트럼을 모은 스페셜 EP 앨범 "BAVIation"입니다.',
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
            desc: '바비(BAVI)의 청량하면서도 위트 있는 음악적 시도를 담아낸 싱글 "Just One Minute"입니다.',
            cover: 'assets/images/album_just_one_minute.png',
            tracks: [
                { id: 'track-4-1', title: 'Just One Minute', duration: '2:59', isTitle: true, url: 'assets/audio/Single_Just One Minute/BAVI_Just One Minute.wav', lyricsUrl: 'assets/audio/Single_Just One Minute/BAVI_Just One Minute.txt' }
            ]
        },
        'album-5': {
            name: '안녕, 세상아(Unpressed)',
            type: 'Single',
            release: '2026.07.25',
            desc: '바비(BAVI)의 새로운 싱글 "안녕, 세상아(Unpressed)"입니다.',
            cover: 'assets/images/album_annyeong_sesanga.jpg',
            tracks: [
                { id: 'track-5-1', title: '안녕, 세상아', duration: '', isTitle: true, url: 'assets/audio/Single_Annyeong Sesanga/BAVI_Annyeong Sesanga.wav', lyricsUrl: 'assets/audio/Single_Annyeong Sesanga/BAVI_Annyeong Sesanga.txt' }
            ]
        }
    };

    // Flatten playlist
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

    // Elements
    const audioElement = document.getElementById('audioElement');
    const playerBar = document.getElementById('playerBar');
    const playerAlbumImg = document.getElementById('playerAlbumImg');
    const playerSongTitle = document.getElementById('playerSongTitle');
    const playerSongArtist = document.getElementById('playerSongArtist');
    const playerBtnPlay = document.getElementById('playerBtnPlay');
    const playerBtnPrev = document.getElementById('playerBtnPrev');
    const playerBtnNext = document.getElementById('playerBtnNext');
    const playIcon = document.getElementById('playIcon');
    const progressBar = document.getElementById('progressBar');
    const progressBarWrapper = document.getElementById('progressBarWrapper');
    const currentTimeLabel = document.getElementById('currentTimeLabel');
    const durationLabel = document.getElementById('durationLabel');

    // Custom Cursor & Glow
    const bgGlow = document.getElementById('bgGlow');
    const customCursor = document.getElementById('customCursor');

    window.addEventListener('mousemove', (e) => {
        if (bgGlow) {
            bgGlow.style.left = e.clientX + 'px';
            bgGlow.style.top = e.clientY + 'px';
        }
        if (customCursor) {
            customCursor.style.left = e.clientX + 'px';
            customCursor.style.top = e.clientY + 'px';
        }
    });

    document.querySelectorAll('a, button, .album-card, .gallery-item, .btn-filter, .carousel-card-item').forEach(elem => {
        elem.addEventListener('mouseenter', () => customCursor?.classList.add('hovered'));
        elem.addEventListener('mouseleave', () => customCursor?.classList.remove('hovered'));
    });

    // ==========================================================================
    // 4. 3D Coverflow Album Deck Engine (Matching Reference Image)
    // ==========================================================================
    const coverflowCards = document.querySelectorAll('.coverflow-card');
    const coverflowViewport = document.getElementById('coverflowViewport');
    const coverflowPrev = document.getElementById('coverflowPrev');
    const coverflowNext = document.getElementById('coverflowNext');
    const coverflowInfoTitle = document.getElementById('coverflowInfoTitle');
    const coverflowInfoType = document.getElementById('coverflowInfoType');
    const coverflowInfoDate = document.getElementById('coverflowInfoDate');

    let activeIndex = 0;
    const totalCards = coverflowCards.length;

    function updateCoverflow(newIndex) {
        if (totalCards === 0) return;
        activeIndex = (newIndex + totalCards) % totalCards;

        coverflowCards.forEach((card, idx) => {
            const diff = idx - activeIndex;
            const absDiff = Math.abs(diff);

            if (diff === 0) {
                // Active Center Card
                card.style.transform = `translateX(0px) translateZ(140px) rotateY(0deg) scale(1.15)`;
                card.style.opacity = '1';
                card.style.zIndex = '100';
                card.style.filter = 'none';
                card.classList.add('active');

                // Update text display
                if (coverflowInfoTitle) coverflowInfoTitle.textContent = card.getAttribute('data-title');
                if (coverflowInfoType) coverflowInfoType.textContent = card.getAttribute('data-type');
                if (coverflowInfoDate) coverflowInfoDate.textContent = card.getAttribute('data-date');
            } else if (diff < 0) {
                // Left stacked cards (rotated inward)
                const spacing = diff * 70 - 130;
                const depth = absDiff * -100;
                const rotation = Math.min(65, 45 + absDiff * 5);
                const opacity = Math.max(0.15, 1 - absDiff * 0.22);
                
                card.style.transform = `translateX(${spacing}px) translateZ(${depth}px) rotateY(${rotation}deg) scale(0.9)`;
                card.style.opacity = opacity.toString();
                card.style.zIndex = (50 - absDiff).toString();
                card.style.filter = `blur(${Math.min(3, absDiff * 0.8)}px)`;
                card.classList.remove('active');
            } else {
                // Right stacked cards (rotated inward)
                const spacing = diff * 70 + 130;
                const depth = absDiff * -100;
                const rotation = -Math.min(65, 45 + absDiff * 5);
                const opacity = Math.max(0.15, 1 - absDiff * 0.22);

                card.style.transform = `translateX(${spacing}px) translateZ(${depth}px) rotateY(${rotation}deg) scale(0.9)`;
                card.style.opacity = opacity.toString();
                card.style.zIndex = (50 - absDiff).toString();
                card.style.filter = `blur(${Math.min(3, absDiff * 0.8)}px)`;
                card.classList.remove('active');
            }
        });
    }

    // Initialize Coverflow
    updateCoverflow(0);

    // Controls
    coverflowPrev?.addEventListener('click', () => updateCoverflow(activeIndex - 1));
    coverflowNext?.addEventListener('click', () => updateCoverflow(activeIndex + 1));

    // Click on card to jump to center
    coverflowCards.forEach((card, idx) => {
        card.addEventListener('click', () => updateCoverflow(idx));
    });

    // Wheel Scroll & Drag Gestures
    coverflowViewport?.addEventListener('wheel', (e) => {
        if (Math.abs(e.deltaX) > 30 || Math.abs(e.deltaY) > 30) {
            if (e.deltaX > 0 || e.deltaY > 0) updateCoverflow(activeIndex + 1);
            else updateCoverflow(activeIndex - 1);
        }
    }, { passive: true });

    let isDrag = false;
    let startX = 0;

    coverflowViewport?.addEventListener('mousedown', (e) => {
        isDrag = true;
        startX = e.clientX;
    });

    window.addEventListener('mouseup', () => isDrag = false);

    coverflowViewport?.addEventListener('mousemove', (e) => {
        if (!isDrag) return;
        const diffX = e.clientX - startX;
        if (Math.abs(diffX) > 60) {
            if (diffX < 0) updateCoverflow(activeIndex + 1);
            else updateCoverflow(activeIndex - 1);
            isDrag = false;
        }
    });

    // Touch Swipe
    let touchStartX = 0;
    coverflowViewport?.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
    }, { passive: true });

    coverflowViewport?.addEventListener('touchend', (e) => {
        const touchEndX = e.changedTouches[0].clientX;
        const diffX = touchEndX - touchStartX;
        if (Math.abs(diffX) > 40) {
            if (diffX < 0) updateCoverflow(activeIndex + 1);
            else updateCoverflow(activeIndex - 1);
        }
    }, { passive: true });

    // ==========================================================================
    // 5. Audio Player Functions
    // ==========================================================================
    function formatTime(seconds) {
        if (isNaN(seconds) || seconds === 0) return "0:00";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }

    function loadSong(index) {
        if (index < 0 || index >= playlist.length) return;
        currentTrackIndex = index;
        const track = playlist[currentTrackIndex];

        audioElement.src = track.url;
        playerSongTitle.textContent = track.title;
        playerSongArtist.textContent = `${track.albumName} · BAVI`;
        playerAlbumImg.src = track.albumImg || 'assets/images/album_baviation.jpg';

        playerBar.classList.add('active');
        playAudio();
    }

    function playAudio() {
        audioElement.play().then(() => {
            isPlaying = true;
            playIcon.setAttribute('data-lucide', 'pause');
            lucide.createIcons();
        }).catch(err => console.warn('Audio play error:', err));
    }

    function pauseAudio() {
        audioElement.pause();
        isPlaying = false;
        playIcon.setAttribute('data-lucide', 'play');
        lucide.createIcons();
    }

    playerBtnPlay?.addEventListener('click', () => {
        if (isPlaying) pauseAudio();
        else playAudio();
    });

    playerBtnPrev?.addEventListener('click', () => {
        currentTrackIndex = (currentTrackIndex - 1 + playlist.length) % playlist.length;
        loadSong(currentTrackIndex);
    });

    playerBtnNext?.addEventListener('click', () => {
        currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
        loadSong(currentTrackIndex);
    });

    audioElement.addEventListener('timeupdate', () => {
        if (!audioElement.duration) return;
        const pct = (audioElement.currentTime / audioElement.duration) * 100;
        progressBar.style.width = `${pct}%`;
        currentTimeLabel.textContent = formatTime(audioElement.currentTime);
        durationLabel.textContent = formatTime(audioElement.duration);
    });

    progressBarWrapper?.addEventListener('click', (e) => {
        const rect = progressBarWrapper.getBoundingClientRect();
        const pct = (e.clientX - rect.left) / rect.width;
        audioElement.currentTime = pct * audioElement.duration;
    });

    // Hero Play Button
    const heroPlayBtn = document.getElementById('heroPlayBtn');
    heroPlayBtn?.addEventListener('click', () => {
        const trackIdx = playlist.findIndex(t => t.title === heroBanner.trackTitle);
        if (trackIdx !== -1) loadSong(trackIdx);
        else loadSong(0);
    });

    // Hover Play Buttons on album cards
    document.querySelectorAll('.btn-icon-play').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const trackUrl = btn.getAttribute('data-track-url');
            const trackIdx = playlist.findIndex(t => t.url === trackUrl);
            if (trackIdx !== -1) loadSong(trackIdx);
            else loadSong(0);
        });
    });

    // Modal popup
    const albumModal = document.getElementById('albumModal');
    const modalCloseBtn = document.getElementById('modalCloseBtn');

    document.querySelectorAll('.btn-album-details').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const card = btn.closest('.album-card');
            const albumId = card.getAttribute('data-album-id');
            const album = albumData[albumId];
            if (!album) return;

            document.getElementById('modalAlbumImg').src = album.cover;
            document.getElementById('modalAlbumType').textContent = album.type;
            document.getElementById('modalAlbumName').textContent = album.name;
            document.getElementById('modalAlbumDesc').textContent = album.desc;

            const modalTracklist = document.getElementById('modalTracklist');
            modalTracklist.innerHTML = '';

            album.tracks.forEach((track, index) => {
                const item = document.createElement('div');
                item.style.cssText = 'display:flex; align-items:center; justify-content:space-between; padding:12px 16px; background:rgba(255,255,255,0.04); border-radius:12px; border:1px solid rgba(255,255,255,0.08);';
                item.innerHTML = `
                    <span style="font-weight:700; color:var(--accent-cyan);">${String(index + 1).padStart(2, '0')}</span>
                    <span style="flex:1; margin:0 16px; font-weight:600;">${track.title} ${track.isTitle ? '<span style="font-size:0.7rem; color:var(--accent-pink); margin-left:6px;">[TITLE]</span>' : ''}</span>
                    <span style="color:var(--text-grey); font-size:0.85rem; margin-right:16px;">${track.duration}</span>
                    <button class="btn-play-track" data-url="${track.url}" style="background:var(--accent-violet); width:32px; height:32px; border-radius:50%; display:flex; align-items:center; justify-content:center; cursor:pointer;">
                        <i data-lucide="play" style="width:14px; height:14px; fill:#fff;"></i>
                    </button>
                `;
                modalTracklist.appendChild(item);
            });

            lucide.createIcons();

            modalTracklist.querySelectorAll('.btn-play-track').forEach(pBtn => {
                pBtn.addEventListener('click', () => {
                    const url = pBtn.getAttribute('data-url');
                    const idx = playlist.findIndex(t => t.url === url);
                    if (idx !== -1) loadSong(idx);
                });
            });

            albumModal.classList.add('active');
        });
    });

    modalCloseBtn?.addEventListener('click', () => albumModal.classList.remove('active'));
    albumModal?.addEventListener('click', (e) => {
        if (e.target === albumModal) albumModal.classList.remove('active');
    });

    // ==========================================================================
    // 6. Gallery Filtering
    // ==========================================================================
    const filterBtns = document.querySelectorAll('.btn-filter');
    const galleryItems = document.querySelectorAll('.gallery-item');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const filter = btn.getAttribute('data-filter');

            galleryItems.forEach(item => {
                if (filter === 'all' || item.getAttribute('data-category') === filter) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });

    // ==========================================================================
    // 7. Taste Labs Copy Email to Clipboard
    // ==========================================================================
    const copyEmailBtn = document.getElementById('copyEmailBtn');
    const copyEmailTxt = document.getElementById('copyEmailTxt');

    copyEmailBtn?.addEventListener('click', () => {
        navigator.clipboard.writeText('hello@bavilog.com').then(() => {
            if (copyEmailTxt) {
                const original = copyEmailTxt.textContent;
                copyEmailTxt.textContent = 'COPIED TO CLIPBOARD!';
                setTimeout(() => copyEmailTxt.textContent = original, 2500);
            }
        });
    });

    // Mobile Hamburger Toggle
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const navMobile = document.getElementById('navMobile');

    hamburgerBtn?.addEventListener('click', () => {
        navMobile?.classList.toggle('active');
    });

    document.querySelectorAll('.nav-mobile-link').forEach(link => {
        link.addEventListener('click', () => navMobile?.classList.remove('active'));
    });

    // ==========================================================================
    // 8. Admin Overrides Sync (from localStorage)
    // ==========================================================================
    (function applyAdminOverrides() {
        let ad;
        try { ad = JSON.parse(localStorage.getItem('bavi_admin_data') || 'null'); } catch(e) { return; }
        if (!ad) return;

        // HERO
        if (ad.hero) {
            const h = ad.hero;
            if (h.title) { const el = document.getElementById('heroTitle'); if (el) el.innerHTML = `<span class="is-grey">DECODING THE SOUNDSCAPE</span><br>${h.title}`; }
            if (h.desc) { const el = document.getElementById('heroDesc'); if (el) el.innerHTML = h.desc; }
            if (h.trackTitle) heroBanner.trackTitle = h.trackTitle;
            if (h.image) { const el = document.getElementById('heroImg'); if (el) el.src = h.image; }
        }

        // PROFILE
        if (ad.profile) {
            const p = ad.profile;
            if (p.avatar) { const av = document.querySelector('.bio-avatar'); if (av) av.src = p.avatar; }
            if (p.name) { const h3 = document.querySelector('.bio-title h3'); if (h3) h3.innerHTML = `${p.name} <span class="korean-name">(${p.koreanName||''})</span>`; }
            if (p.role) { const r = document.querySelector('.bio-tag'); if (r) r.textContent = p.role; }
            
            const bioBody = document.querySelector('.bio-body');
            if (bioBody && (p.quote || (p.bio && p.bio.length))) {
                bioBody.innerHTML = '';
                if (p.quote) { const q = document.createElement('p'); q.className = 'bio-quote'; q.textContent = p.quote; bioBody.appendChild(q); }
                (p.bio||[]).forEach(text => { const par = document.createElement('p'); par.className = 'bio-paragraph'; par.textContent = text; bioBody.appendChild(par); });
            }
        }
    })();

});
