const fs = require('fs');
const path = require('path');

// Target directories and output JSON file
const BASE_IMAGE_DIR = path.join(__dirname, 'assets', 'images');
const OUTPUT_JSON_FILE = path.join(BASE_IMAGE_DIR, 'gallery-data.json');
const CATEGORIES = ['CONCEPT', 'STAGE', 'BEHIND'];
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];

// Ensure target directories exist
function ensureDirectories() {
    if (!fs.existsSync(BASE_IMAGE_DIR)) {
        fs.mkdirSync(BASE_IMAGE_DIR, { recursive: true });
    }
    CATEGORIES.forEach(category => {
        const dir = path.join(BASE_IMAGE_DIR, category);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    });
}

// Clean up filename to make it a beautiful title
function cleanTitle(filename) {
    const ext = path.extname(filename);
    let base = path.basename(filename, ext);
    // Replace dashes and underscores with spaces
    base = base.replace(/[-_]/g, ' ');
    // Remove duplicate spaces
    base = base.replace(/\s+/g, ' ');
    // Trim spaces
    return base.trim();
}

// Scan directories and build gallery metadata JSON
function buildGalleryMetadata() {
    console.log('\n[Watcher] Scanning gallery folders...');
    const galleryItems = [];

    CATEGORIES.forEach(category => {
        const dirPath = path.join(BASE_IMAGE_DIR, category);
        if (!fs.existsSync(dirPath)) return;

        try {
            const files = fs.readdirSync(dirPath);
            files.forEach(file => {
                const ext = path.extname(file).toLowerCase();
                if (IMAGE_EXTENSIONS.includes(ext)) {
                    // Normalize slash direction for web compatibility (forward slash)
                    const webSrc = `assets/images/${category}/${file}`;
                    const title = cleanTitle(file);
                    galleryItems.push({
                        src: webSrc,
                        title: title,
                        category: category
                    });
                }
            });
        } catch (err) {
            console.error(`[Watcher] Error reading category folder ${category}:`, err);
        }
    });

    try {
        fs.writeFileSync(OUTPUT_JSON_FILE, JSON.stringify(galleryItems, null, 4), 'utf8');
        console.log(`[Watcher] Updated metadata database with ${galleryItems.length} items.`);
        console.log(`[Watcher] Database location: ${OUTPUT_JSON_FILE}`);
    } catch (err) {
        console.error('[Watcher] Failed to write gallery-data.json:', err);
    }
}

// Debounce helper to avoid double executions during file operations
let debounceTimeout = null;
function triggerBuild() {
    if (debounceTimeout) {
        clearTimeout(debounceTimeout);
    }
    debounceTimeout = setTimeout(() => {
        buildGalleryMetadata();
    }, 200);
}

// Initialize and watch folders
function startWatcher() {
    ensureDirectories();
    // Run initial build
    buildGalleryMetadata();

    console.log('[Watcher] Starting folder watcher for categories: ' + CATEGORIES.join(', '));

    CATEGORIES.forEach(category => {
        const dirPath = path.join(BASE_IMAGE_DIR, category);
        
        fs.watch(dirPath, { recursive: false }, (eventType, filename) => {
            if (filename) {
                const ext = path.extname(filename).toLowerCase();
                // Trigger only if it's an image or if a file was deleted
                if (IMAGE_EXTENSIONS.includes(ext) || !fs.existsSync(path.join(dirPath, filename))) {
                    console.log(`[Watcher] Change detected: ${eventType} in category ${category} (file: ${filename})`);
                    triggerBuild();
                }
            } else {
                // Generic folder watch fallback
                triggerBuild();
            }
        });
    });

    console.log('[Watcher] Monitoring folders for new images... Press Ctrl+C to exit.');
}

// Run watch
startWatcher();
