/**
 * Upload local exercise GIFs to Supabase Storage.
 * Usage: node scripts/upload-gifs.cjs
 * 
 * This script is reusable — run it whenever new GIFs are added to public/exercises/.
 * It normalizes filenames (strips accents) for Supabase Storage compatibility.
 */

const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://boiqecrzszyjipdhddkn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvaXFlY3J6c3p5amlwZGhkZGtuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3MDcyNzUsImV4cCI6MjA4NTI4MzI3NX0.p2zEzs2ZLTRCiJjvnOCQku-feAVBNWjo7hQU4SRyBcI';
const BUCKET = 'exercises';
const LOCAL_DIR = path.join(__dirname, '..', 'public', 'exercises');

/** Strip accents and normalize for Supabase Storage keys */
function normalizeKey(str) {
    return str
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove diacritical marks
        .replace(/\s+/g, '-') // Spaces to hyphens
        .toLowerCase();
}

async function uploadFile(filePath, storagePath) {
    const fileContent = fs.readFileSync(filePath);
    const encodedPath = storagePath.split('/').map(p => encodeURIComponent(p)).join('/');
    const url = `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${encodedPath}`;

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'apikey': SUPABASE_ANON_KEY,
            'Content-Type': 'image/gif',
            'x-upsert': 'true',
        },
        body: fileContent,
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`${response.status} ${errorText}`);
    }
    return true;
}

function getAllGifs(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    let files = [];
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            files = files.concat(getAllGifs(fullPath));
        } else if (entry.name.endsWith('.gif')) {
            files.push(fullPath);
        }
    }
    return files;
}

/**
 * Builds a mapping from original local paths to normalized storage paths.
 * Exports as JSON for DB update reference.
 */
function buildMapping(files) {
    const mapping = {};
    for (const filePath of files) {
        const relativePath = path.relative(LOCAL_DIR, filePath).replace(/\\/g, '/');
        const normalizedPath = normalizeKey(relativePath);
        const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${normalizedPath}`;

        // Key: original local path like /exercises/Ombros/arnold-halteres.gif
        mapping[`/exercises/${relativePath}`] = publicUrl;
    }
    return mapping;
}

async function main() {
    console.log('🎬 Uploading exercise GIFs to Supabase Storage...\n');

    const files = getAllGifs(LOCAL_DIR);
    console.log(`Found ${files.length} GIF files to upload.\n`);

    // Build and save mapping for reference
    const mapping = buildMapping(files);
    const mappingPath = path.join(__dirname, 'gif-mapping.json');
    fs.writeFileSync(mappingPath, JSON.stringify(mapping, null, 2));
    console.log(`📋 Mapping saved to ${mappingPath}\n`);

    let uploaded = 0;
    let errors = 0;

    for (const filePath of files) {
        const relativePath = path.relative(LOCAL_DIR, filePath).replace(/\\/g, '/');
        const normalizedPath = normalizeKey(relativePath);

        try {
            await uploadFile(filePath, normalizedPath);
            uploaded++;
            if (uploaded % 10 === 0 || uploaded === files.length) {
                console.log(`  ✅ [${uploaded}/${files.length}] Progress...`);
            }
        } catch (err) {
            errors++;
            console.log(`  ❌ ${normalizedPath}: ${err.message}`);
        }
    }

    console.log(`\n📊 Results: ${uploaded} uploaded, ${errors} errors out of ${files.length} total.`);

    if (uploaded > 0) {
        console.log(`\n🔗 Public URL format:`);
        console.log(`   ${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/<normalized-path>`);
    }
}

main().catch(console.error);
