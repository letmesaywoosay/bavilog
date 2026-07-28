/* ==========================================================
   BAVI Admin Panel — admin.js
   All auth, CRUD, file-upload, and dynamic UI logic
   ========================================================== */

'use strict';

// ─── CONFIG ────────────────────────────────────────────────
const PW           = 'bavi2026!';
const STORE_KEY    = 'bavi_admin_data';
const SESSION_KEY  = 'bavi_admin_auth';

// ─── DEFAULT DATA ──────────────────────────────────────────
const DEFAULTS = {
    hero: {
        title:      'BAVIation',
        desc:       "BAVI의 스페셜 EP 앨범 'BAVIation' 발매.<br>몽환적이면서도 세련된 타이틀곡 'Perfect Glitch'를 지금 감상해보세요.",
        trackTitle: 'Perfect Glitch',
        toastMsg:   'Playing: Perfect Glitch (1st Special EP)',
        image:      null
    },
    profile: {
        name:       'BAVI',
        koreanName: '바비',
        role:       'Soloist / Singer-Songwriter',
        quote:      '"우리는 일탈을 통해 성장하는거야."',
        avatar:     null,
        bio: [
            'BAVI(바비)는 정형화된 팝의 틀을 깨는 감각적인 글리치 팝(Glitch Pop)과 위트 있는 얼터너티브 팝을 결합하여 자신만의 독보적인 주파수를 개척해 나가는 싱어송라이터입니다.',
            '허스키함을 완전히 걷어낸, 극도로 맑고 투명하면서도 비몽사몽한 나른함이 묻어나는 20대 초반의 에어리(Airy) 보컬 톤은 청자들에게 마치 디지털 미로 속이나 아늑한 나만의 비밀방(Secret Room)에 누워있는 듯한 묘하고 중독적인 공간감을 선사합니다.',
            '컴퓨터 시스템의 반전이나 오류를 뜻하는 HELLO WORLD, PERFECT GLITCH, EASTER EGG와 같은 키워드를 직접 작사·작곡으로 풀어내며, 차가운 디지털 코드 속에 숨겨진 낭만적인 일탈의 서사를 노래합니다.'
        ],
        info: {
            realName: 'BAVI (박하은)',
            debut:    "2026.07.11 ('BAVIation')",
            genre:    'Glitch-pop, Hyper-pop',
            label:    'VVS Producing'
        },
        tags: ['#Pink', '#Ponytail', '#DreamyVoice', '#MyOwnSpace', '#Tech', '#SmallDeviations'],
        timeline: [
            { date: '2026.07.11', desc: "1st Special EP 'BAVIation' 발매 & 데뷔" },
            { date: '2026.07.17', desc: "싱글 'Just One Minute' 발매 예정" },
            { date: '2026.07.25', desc: "싱글 '안녕, 세상아(Unpressed)' 발매 예정" }
        ]
    },
    discography: { adminAlbums: [] },
    gallery:     { adminPhotos: [] },
    schedule:    { items: [] }
};

// ─── STATE ─────────────────────────────────────────────────
let data         = deepClone(DEFAULTS);
let newTracks    = [];     // tracks for album being created
let newCoverB64  = null;   // base64 cover for album being created

// ─── UTILS ─────────────────────────────────────────────────
function deepClone(obj) { return JSON.parse(JSON.stringify(obj)); }

function deepMerge(target, source) {
    if (!source) return target;
    for (const k of Object.keys(source)) {
        if (source[k] && typeof source[k] === 'object' && !Array.isArray(source[k])) {
            if (!target[k] || typeof target[k] !== 'object') target[k] = {};
            deepMerge(target[k], source[k]);
        } else {
            target[k] = source[k];
        }
    }
    return target;
}

function load() {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return;
    try {
        const parsed = JSON.parse(raw);
        data = deepMerge(deepClone(DEFAULTS), parsed);
    } catch (e) {
        console.warn('Admin data parse error, using defaults');
    }
}

function save() {
    localStorage.setItem(STORE_KEY, JSON.stringify(data));
}

let toastTimer;
function toast(msg, type = 'ok') {
    const el = document.getElementById('toast');
    el.textContent = msg;
    el.className = `toast ${type}`;
    el.classList.remove('hidden');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.add('hidden'), 3200);
}

function fileToB64(file) {
    return new Promise((res, rej) => {
        const r = new FileReader();
        r.onload = e => res(e.target.result);
        r.onerror = rej;
        r.readAsDataURL(file);
    });
}

// Compress image via canvas before storing (max 800px, quality 0.82)
async function compressImage(file, maxPx = 800, quality = 0.82) {
    return new Promise((res) => {
        const img = new Image();
        const url = URL.createObjectURL(file);
        img.onload = () => {
            URL.revokeObjectURL(url);
            let { width: w, height: h } = img;
            if (w > maxPx || h > maxPx) {
                const ratio = Math.min(maxPx / w, maxPx / h);
                w = Math.round(w * ratio);
                h = Math.round(h * ratio);
            }
            const c = document.createElement('canvas');
            c.width = w; c.height = h;
            c.getContext('2d').drawImage(img, 0, 0, w, h);
            res(c.toDataURL('image/jpeg', quality));
        };
        img.src = url;
    });
}

function el(id) { return document.getElementById(id); }
function qs(sel, ctx) { return (ctx || document).querySelector(sel); }

// ─── AUTH ──────────────────────────────────────────────────
function isLoggedIn() {
    return sessionStorage.getItem(SESSION_KEY) === '1';
}

function tryLogin() {
    const pw = el('pwInput').value;
    if (pw === PW) {
        sessionStorage.setItem(SESSION_KEY, '1');
        el('loginWrap').classList.add('hidden');
        el('adminLayout').classList.remove('hidden');
        initDashboard();
    } else {
        el('loginErr').classList.remove('hidden');
        el('pwInput').value = '';
        el('pwInput').focus();
    }
}

function logout() {
    sessionStorage.removeItem(SESSION_KEY);
    el('loginWrap').classList.remove('hidden');
    el('adminLayout').classList.add('hidden');
    el('pwInput').value = '';
    el('loginErr').classList.add('hidden');
}

// ─── NAVIGATION ────────────────────────────────────────────
function switchSection(name) {
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.querySelector(`.nav-btn[data-sec="${name}"]`).classList.add('active');
    el(`sec-${name}`).classList.add('active');
    if (name === 'hero')     renderHeroForm();
    if (name === 'profile')  renderProfileForm();
    if (name === 'disco')    renderDisco();
    if (name === 'gallery')  renderGallery();
    if (name === 'schedule') renderSchedule();
}

// ═══════════════════════════════════════════════════════════
// HERO
// ═══════════════════════════════════════════════════════════
function renderHeroForm() {
    el('h-title').value = data.hero.title || '';
    el('h-desc').value  = data.hero.desc  || '';
    el('h-track').value = data.hero.trackTitle || '';
    el('h-toast').value = data.hero.toastMsg   || '';
    if (data.hero.image) {
        el('heroPrev').src = data.hero.image;
        el('heroPrev').classList.remove('hidden');
        el('heroPh').classList.add('hidden');
        el('heroZone').classList.add('has-file');
    } else {
        el('heroPrev').classList.add('hidden');
        el('heroPh').classList.remove('hidden');
        el('heroZone').classList.remove('has-file');
    }
}

function setupHeroUpload() {
    setupUploadZone('heroZone', 'heroFile', async file => {
        const b64 = await compressImage(file);
        data.hero.image = b64;
        el('heroPrev').src = b64;
        el('heroPrev').classList.remove('hidden');
        el('heroPh').classList.add('hidden');
        el('heroZone').classList.add('has-file');
    });
    el('heroClear').addEventListener('click', () => {
        data.hero.image = null;
        el('heroPrev').classList.add('hidden');
        el('heroPh').classList.remove('hidden');
        el('heroZone').classList.remove('has-file');
        save(); toast('이미지가 초기화되었습니다.', 'info');
    });
    el('saveHero').addEventListener('click', () => {
        data.hero.title      = el('h-title').value.trim();
        data.hero.desc       = el('h-desc').value;
        data.hero.trackTitle = el('h-track').value.trim();
        data.hero.toastMsg   = el('h-toast').value.trim();
        save(); toast('✅ Hero 배너가 저장되었습니다!');
    });
    el('resetHero').addEventListener('click', () => {
        if (!confirm('Hero 배너를 기본값으로 초기화할까요?')) return;
        data.hero = deepClone(DEFAULTS.hero);
        save(); renderHeroForm(); toast('초기화되었습니다.', 'info');
    });
}

// ═══════════════════════════════════════════════════════════
// PROFILE
// ═══════════════════════════════════════════════════════════
function renderProfileForm() {
    el('p-name').value    = data.profile.name       || '';
    el('p-kname').value   = data.profile.koreanName || '';
    el('p-role').value    = data.profile.role       || '';
    el('p-quote').value   = data.profile.quote      || '';
    el('p-realname').value = data.profile.info?.realName || '';
    el('p-debut').value   = data.profile.info?.debut    || '';
    el('p-genre').value   = data.profile.info?.genre    || '';
    el('p-label').value   = data.profile.info?.label    || '';
    if (data.profile.avatar) {
        el('avatarPrev').src = data.profile.avatar;
        el('avatarPrev').classList.remove('hidden');
        el('avatarPh').classList.add('hidden');
    } else {
        el('avatarPrev').classList.add('hidden');
        el('avatarPh').classList.remove('hidden');
    }
    renderBioParagraphs();
    renderTags();
    renderTimeline();
}

function renderBioParagraphs() {
    const c = el('bioParagraphs');
    c.innerHTML = '';
    (data.profile.bio || []).forEach((para, i) => {
        const d = document.createElement('div');
        d.className = 'bio-para';
        d.innerHTML = `
            <textarea rows="3" data-i="${i}">${para}</textarea>
            <button class="btn btn-danger btn-sm" data-del="${i}" title="삭제">✕</button>
        `;
        c.appendChild(d);
    });
    c.querySelectorAll('textarea[data-i]').forEach(ta => {
        ta.addEventListener('input', e => {
            data.profile.bio[+e.target.getAttribute('data-i')] = e.target.value;
        });
    });
    c.querySelectorAll('[data-del]').forEach(btn => {
        btn.addEventListener('click', e => {
            data.profile.bio.splice(+e.target.getAttribute('data-del'), 1);
            renderBioParagraphs();
        });
    });
}

function renderTags() {
    const c = el('tagCloud');
    c.innerHTML = '';
    (data.profile.tags || []).forEach((tag, i) => {
        const span = document.createElement('span');
        span.className = 'tag-pill';
        span.innerHTML = `${tag} <button data-ti="${i}" title="삭제">✕</button>`;
        c.appendChild(span);
    });
    c.querySelectorAll('[data-ti]').forEach(btn => {
        btn.addEventListener('click', e => {
            data.profile.tags.splice(+e.target.getAttribute('data-ti'), 1);
            renderTags();
        });
    });
}

function renderTimeline() {
    const c = el('tlItems');
    c.innerHTML = '';
    (data.profile.timeline || []).forEach((item, i) => {
        const d = document.createElement('div');
        d.className = 'tl-item';
        d.innerHTML = `
            <input type="text" value="${item.date}" data-ti="${i}" data-f="date" placeholder="날짜">
            <input type="text" value="${item.desc}" data-ti="${i}" data-f="desc" placeholder="내용">
            <button class="btn btn-danger btn-sm" data-tdel="${i}">✕</button>
        `;
        c.appendChild(d);
    });
    c.querySelectorAll('input[data-ti]').forEach(inp => {
        inp.addEventListener('input', e => {
            const i = +e.target.getAttribute('data-ti');
            const f = e.target.getAttribute('data-f');
            data.profile.timeline[i][f] = e.target.value;
        });
    });
    c.querySelectorAll('[data-tdel]').forEach(btn => {
        btn.addEventListener('click', e => {
            data.profile.timeline.splice(+e.target.getAttribute('data-tdel'), 1);
            renderTimeline();
        });
    });
}

function setupProfileEvents() {
    setupUploadZone('avatarZone', 'avatarFile', async file => {
        const b64 = await compressImage(file, 400);
        data.profile.avatar = b64;
        el('avatarPrev').src = b64;
        el('avatarPrev').classList.remove('hidden');
        el('avatarPh').classList.add('hidden');
    });
    el('avatarClear').addEventListener('click', () => {
        data.profile.avatar = null;
        el('avatarPrev').classList.add('hidden');
        el('avatarPh').classList.remove('hidden');
        save(); toast('아바타가 초기화되었습니다.', 'info');
    });
    el('addParaBtn').addEventListener('click', () => {
        data.profile.bio.push('');
        renderBioParagraphs();
        // focus last textarea
        const tas = el('bioParagraphs').querySelectorAll('textarea');
        if (tas.length) tas[tas.length - 1].focus();
    });
    el('addTagBtn').addEventListener('click', addTag);
    el('tagInput').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } });
    el('addTlBtn').addEventListener('click', addTimeline);
    el('tlDate').addEventListener('keydown', e => { if (e.key === 'Enter') addTimeline(); });
    el('tlDesc').addEventListener('keydown', e => { if (e.key === 'Enter') addTimeline(); });
    el('saveProfile').addEventListener('click', () => {
        data.profile.name       = el('p-name').value.trim();
        data.profile.koreanName = el('p-kname').value.trim();
        data.profile.role       = el('p-role').value.trim();
        data.profile.quote      = el('p-quote').value.trim();
        data.profile.info = {
            realName: el('p-realname').value.trim(),
            debut:    el('p-debut').value.trim(),
            genre:    el('p-genre').value.trim(),
            label:    el('p-label').value.trim()
        };
        save(); toast('✅ 프로필이 저장되었습니다!');
    });
    el('resetProfile').addEventListener('click', () => {
        if (!confirm('프로필을 기본값으로 복원할까요?')) return;
        data.profile = deepClone(DEFAULTS.profile);
        save(); renderProfileForm(); toast('복원되었습니다.', 'info');
    });
}

function addTag() {
    const inp = el('tagInput');
    let tag = inp.value.trim();
    if (!tag) return;
    if (!tag.startsWith('#')) tag = '#' + tag;
    data.profile.tags.push(tag);
    inp.value = '';
    renderTags();
}

function addTimeline() {
    const d = el('tlDate').value.trim();
    const t = el('tlDesc').value.trim();
    if (!d || !t) { toast('날짜와 내용을 모두 입력해주세요.', 'err'); return; }
    data.profile.timeline.push({ date: d, desc: t });
    el('tlDate').value = ''; el('tlDesc').value = '';
    renderTimeline();
}

// ═══════════════════════════════════════════════════════════
// DISCOGRAPHY
// ═══════════════════════════════════════════════════════════
const BUILT_IN_ALBUMS = [
    { id:'album-3', type:'1st Special EP', name:'BAVIation',           release:'2026.07.11', cover:'../assets/images/album_baviation.jpg' },
    { id:'album-4', type:'Single',         name:'Just One Minute',     release:'2026.07.17', cover:'../assets/images/album_just_one_minute.png' },
    { id:'album-5', type:'Single',         name:'안녕, 세상아(Unpressed)', release:'2026.07.25', cover:'../assets/images/album_annyeong_sesanga.jpg' }
];

function renderDisco() {
    // Built-in
    el('existingAlbums').innerHTML = BUILT_IN_ALBUMS.map(a => `
        <div class="album-row">
            <img class="album-thumb" src="${a.cover}" alt="${a.name}" onerror="this.style.display='none'">
            <div class="album-meta">
                <div class="atype">${a.type}</div>
                <div class="aname">${a.name}</div>
                <div class="adate">${a.release}</div>
            </div>
            <span class="badge-default">내장</span>
        </div>
    `).join('');

    // Admin albums
    renderAdminAlbums();
}

function renderAdminAlbums() {
    const c = el('adminAlbums');
    const albums = data.discography.adminAlbums || [];
    if (!albums.length) { c.innerHTML = '<div class="empty">등록된 앨범이 없습니다.</div>'; return; }
    c.innerHTML = albums.map((a, i) => `
        <div class="album-row">
            ${a.cover ? `<img class="album-thumb" src="${a.cover}" alt="${a.name}">` : '<div class="album-thumb-ph">💿</div>'}
            <div class="album-meta">
                <div class="atype">${a.type}</div>
                <div class="aname">${a.name}</div>
                <div class="adate">${a.release} · ${(a.tracks||[]).length}트랙</div>
            </div>
            <button class="btn btn-danger btn-sm" data-adel="${i}">🗑️ 삭제</button>
        </div>
    `).join('');
    c.querySelectorAll('[data-adel]').forEach(btn => {
        btn.addEventListener('click', e => {
            if (!confirm('이 앨범을 삭제할까요?')) return;
            data.discography.adminAlbums.splice(+e.target.getAttribute('data-adel'), 1);
            save(); renderAdminAlbums(); toast('앨범이 삭제되었습니다.', 'info');
        });
    });
}

function renderTrackList() {
    const c = el('trackList');
    c.innerHTML = '';
    newTracks.forEach((t, i) => {
        const d = document.createElement('div');
        d.className = 'track-item';
        d.innerHTML = `
            <div class="track-top">
                <span class="track-n">${i+1}</span>
                <input type="text" placeholder="트랙 제목" value="${t.title}" data-ti="${i}" data-f="title" style="flex:1;">
                <input type="text" class="track-dur" placeholder="길이 (3:04)" value="${t.duration}" data-ti="${i}" data-f="duration">
                <label class="track-lbl">
                    <input type="checkbox" ${t.isTitle?'checked':''} data-tci="${i}"> 타이틀
                </label>
                <button class="btn btn-danger btn-xs" data-trdel="${i}">✕</button>
            </div>
            <div class="track-urls">
                <input type="text" placeholder="음원 경로  예: assets/audio/Single_.../BAVI_....wav" value="${t.url}" data-ti="${i}" data-f="url">
                <input type="text" placeholder="가사 경로  예: assets/audio/...txt  (선택)" value="${t.lyricsUrl}" data-ti="${i}" data-f="lyricsUrl">
            </div>
        `;
        c.appendChild(d);
    });
    c.querySelectorAll('input[data-f]').forEach(inp => {
        inp.addEventListener('input', e => {
            newTracks[+e.target.getAttribute('data-ti')][e.target.getAttribute('data-f')] = e.target.value;
        });
    });
    c.querySelectorAll('input[data-tci]').forEach(cb => {
        cb.addEventListener('change', e => {
            newTracks[+e.target.getAttribute('data-tci')].isTitle = e.target.checked;
        });
    });
    c.querySelectorAll('[data-trdel]').forEach(btn => {
        btn.addEventListener('click', e => {
            newTracks.splice(+e.target.getAttribute('data-trdel'), 1);
            renderTrackList();
        });
    });
}

function setupDiscoEvents() {
    el('toggleAddAlbum').addEventListener('click', () => {
        const card = el('addAlbumCard');
        const show = card.classList.contains('hidden');
        card.classList.toggle('hidden');
        if (show) {
            // reset form
            el('al-name').value = ''; el('al-release').value = ''; el('al-desc').value = '';
            el('coverPrev').classList.add('hidden'); el('coverPh').classList.remove('hidden');
            el('coverZone').classList.remove('has-file');
            newTracks = [{ title:'', duration:'', url:'', lyricsUrl:'', isTitle:true }];
            newCoverB64 = null;
            renderTrackList();
        }
    });
    setupUploadZone('coverZone', 'coverFile', async file => {
        newCoverB64 = await compressImage(file);
        el('coverPrev').src = newCoverB64;
        el('coverPrev').classList.remove('hidden');
        el('coverPh').classList.add('hidden');
        el('coverZone').classList.add('has-file');
    });
    el('addTrackBtn').addEventListener('click', () => {
        newTracks.push({ title:'', duration:'', url:'', lyricsUrl:'', isTitle:false });
        renderTrackList();
    });
    el('saveAlbumBtn').addEventListener('click', saveAlbum);
    el('cancelAlbumBtn').addEventListener('click', () => {
        el('addAlbumCard').classList.add('hidden');
    });
}

function saveAlbum() {
    const name = el('al-name').value.trim();
    if (!name) { toast('앨범 제목을 입력해주세요.', 'err'); return; }
    const album = {
        id:      `admin-${Date.now()}`,
        type:    el('al-type').value,
        name,
        release: el('al-release').value.trim(),
        desc:    el('al-desc').value.trim(),
        cover:   newCoverB64 || null,
        tracks:  newTracks.filter(t => t.title.trim())
    };
    data.discography.adminAlbums.push(album);
    save();
    el('addAlbumCard').classList.add('hidden');
    renderAdminAlbums();
    toast('✅ 앨범이 등록되었습니다!');
}

// ═══════════════════════════════════════════════════════════
// GALLERY
// ═══════════════════════════════════════════════════════════
function renderGallery() {
    const photos = data.gallery.adminPhotos || [];
    const c = el('galGrid');
    if (!photos.length) { c.innerHTML = '<div class="empty">등록된 사진이 없습니다.</div>'; return; }
    c.innerHTML = photos.map((p, i) => `
        <div class="gal-item">
            <img src="${p.src}" alt="${p.caption||''}">
            <div class="gal-ov">
                <span class="gal-cat">${p.category}</span>
                <button class="btn btn-danger btn-xs" data-gdel="${i}">✕</button>
            </div>
        </div>
    `).join('');
    c.querySelectorAll('[data-gdel]').forEach(btn => {
        btn.addEventListener('click', e => {
            data.gallery.adminPhotos.splice(+e.target.getAttribute('data-gdel'), 1);
            save(); renderGallery(); toast('사진이 삭제되었습니다.', 'info');
        });
    });
}

function setupGalleryEvents() {
    setupUploadZone('galleryZone', 'galleryFile', async (file) => {
        const b64 = await compressImage(file, 1200, 0.85);
        data.gallery.adminPhotos.push({
            id:       `g-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,
            src:      b64,
            category: el('g-cat').value,
            caption:  el('g-caption').value.trim(),
            filename: file.name
        });
        save(); renderGallery();
    }, true); // multiple = true
    el('galleryFile').setAttribute('multiple', '');
}

// ═══════════════════════════════════════════════════════════
// SCHEDULE
// ═══════════════════════════════════════════════════════════
function renderSchedule() {
    const c = el('schList');
    const items = data.schedule.items || [];
    if (!items.length) { c.innerHTML = '<div class="empty">등록된 일정이 없습니다.</div>'; return; }
    c.innerHTML = items.map((s, i) => `
        <div class="sch-item">
            <span class="sch-date">${s.date}</span>
            <span class="sch-desc">${s.desc}</span>
            ${s.status ? `<span class="sch-status s-${s.status}">${s.status==='upcoming'?'예정':'완료'}</span>` : ''}
            <button class="btn btn-danger btn-xs" data-sdel="${i}">✕</button>
        </div>
    `).join('');
    c.querySelectorAll('[data-sdel]').forEach(btn => {
        btn.addEventListener('click', e => {
            data.schedule.items.splice(+e.target.getAttribute('data-sdel'), 1);
            save(); renderSchedule(); toast('일정이 삭제되었습니다.', 'info');
        });
    });
}

function setupScheduleEvents() {
    el('addSchBtn').addEventListener('click', () => {
        const d = el('sch-date').value.trim();
        const t = el('sch-desc').value.trim();
        if (!d || !t) { toast('날짜와 내용을 입력해주세요.', 'err'); return; }
        data.schedule.items.push({ date:d, desc:t, status:el('sch-status').value });
        save();
        el('sch-date').value=''; el('sch-desc').value=''; el('sch-status').value='';
        renderSchedule(); toast('✅ 일정이 추가되었습니다!');
    });
}

// ═══════════════════════════════════════════════════════════
// SHARED UPLOAD ZONE HELPER
// ═══════════════════════════════════════════════════════════
function setupUploadZone(zoneId, fileId, onFile, multiple = false) {
    const zone  = el(zoneId);
    const input = el(fileId);
    if (!zone || !input) return;

    zone.addEventListener('click', e => {
        if (e.target === input) return;
        input.click();
    });
    zone.addEventListener('dragover',  e => { e.preventDefault(); zone.classList.add('drag-over'); });
    zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
    zone.addEventListener('drop', async e => {
        e.preventDefault(); zone.classList.remove('drag-over');
        const files = [...e.dataTransfer.files].filter(f => f.type.startsWith('image/'));
        if (multiple) { for (const f of files) await onFile(f); }
        else if (files[0]) await onFile(files[0]);
    });
    input.addEventListener('change', async e => {
        const files = [...e.target.files];
        if (multiple) { for (const f of files) await onFile(f); }
        else if (files[0]) await onFile(files[0]);
        input.value = '';
    });
}

// ═══════════════════════════════════════════════════════════
// DASHBOARD INIT
// ═══════════════════════════════════════════════════════════
function initDashboard() {
    load();

    // Nav
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => switchSection(btn.getAttribute('data-sec')));
    });

    setupHeroUpload();
    setupProfileEvents();
    setupDiscoEvents();
    setupGalleryEvents();
    setupScheduleEvents();

    // Logout
    el('logoutBtn').addEventListener('click', logout);

    // Render initial section
    switchSection('hero');
}

// ═══════════════════════════════════════════════════════════
// ENTRY POINT
// ═══════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
    if (isLoggedIn()) {
        el('loginWrap').classList.add('hidden');
        el('adminLayout').classList.remove('hidden');
        initDashboard();
    }

    el('loginBtn').addEventListener('click', tryLogin);
    el('pwInput').addEventListener('keydown', e => { if (e.key === 'Enter') tryLogin(); });
});
