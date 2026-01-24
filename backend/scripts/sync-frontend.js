import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs-extra';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
    const backendDir = path.resolve(__dirname, '..');
    const frontendDist = path.resolve(backendDir, '..', 'frontend', 'dist');
    const publicDir = path.resolve(backendDir, 'public');
    const uploadsDir = path.resolve(publicDir, 'uploads');

    try {
        const exists = await fs.pathExists(frontendDist);
        if (!exists) {
            console.log(`[sync-frontend] Skipped: frontend build not found at ${frontendDist}`);
            return;
        }

        await fs.ensureDir(publicDir);

        // IMPORTANT: do NOT wipe the entire public directory.
        // `public/uploads` stores user-uploaded media and must survive deploys.
        // Instead, remove everything except `uploads/`, then copy the built SPA.
        const entries = await fs.readdir(publicDir).catch(() => []);
        for (const entry of entries) {
            if (entry === 'uploads') continue;
            await fs.remove(path.join(publicDir, entry));
        }

        await fs.copy(frontendDist, publicDir, {
            overwrite: true,
            errorOnExist: false,
            filter: (src) => {
                // extra safety: never copy an uploads dir from the frontend build
                const base = path.basename(src);
                return base !== 'uploads';
            }
        });

        console.log(`[sync-frontend] Synced ${frontendDist} -> ${publicDir}`);
    } catch (err) {
        console.error('[sync-frontend] Error:', err);
        process.exitCode = 1;
    }
}

main();
