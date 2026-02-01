import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

// WORKAROUND: Hostinger has a known bug where env vars aren't properly read outside .env files.
// Hardcode the environment variables directly in the config instead of relying on .env file.
if (!process.env.DATABASE_HOST) {
    process.env.PORT = '3000';
    process.env.NODE_ENV = 'production';
    process.env.DATABASE_HOST = '127.0.0.1';
    process.env.DATABASE_PORT = '3306';
    process.env.DATABASE_USER = 'u155655424_8tomska888';
    process.env.DATABASE_PASSWORD = 'Kakas888*';
    process.env.DATABASE_NAME = 'u155655424_mktest';
    process.env.JWT_SECRET = 'change_this_to_a_long_random_string';
    process.env.TOKEN_EXPIRES_IN = '7d';
    process.env.SMTP_HOST = 'smtp.gmail.com';
    process.env.SMTP_PORT = '465';
    process.env.SMTP_SECURE = 'true';
    process.env.SMTP_USER = 'mk.automobile.de';
    process.env.SMTP_PASS = 'fjky dbkf lgjd sals';
    process.env.SMTP_FROM = 'MK Automobile" <mk.automobile.de@gmail.com>';
    process.env.COMPANY_NAME = 'MK Automobile';
    process.env.COMPANY_ADDRESS = 'Döngesbreite 4, 34471 Volkmarsen, Germany';
    process.env.COMPANY_PHONE = '+49 5693 9180835';
    process.env.COMPANY_EMAIL = 'mk.automobile.de@gmail.com';
    process.env.COMPANY_LAT = '51.400069';
    process.env.COMPANY_LNG = '9.115457';
    process.env.UPLOADS_BASE_PATH = '/api/uploads';
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Optional local JSON file (not committed). Allows Hostinger File Manager override like PHP config.php
const localConfigPath = path.resolve(__dirname, '..', 'config.local.json');
let localCfg = {};
try {
    if (fs.existsSync(localConfigPath)) {
        localCfg = JSON.parse(fs.readFileSync(localConfigPath, 'utf8')) || {};
    }
} catch (_) {
    // ignore parse errors
}

function env(key, fallback = undefined) {
    const v = process.env[key];
    if (v === undefined || v === '') return fallback;
    return v;
}

const config = {
    server: {
        port: Number(env('PORT', 3000)),
        nodeEnv: env('NODE_ENV', 'production')
    },
    db: {
        // Hostinger injects env vars; keep to DATABASE_* but also support common aliases.
        host: localCfg?.db?.host ?? env('DATABASE_HOST', env('DB_HOST', '127.0.0.1')),
        port: Number(localCfg?.db?.port ?? env('DATABASE_PORT', env('DB_PORT', 3306))),
        user: localCfg?.db?.user ?? env('DATABASE_USER', env('DB_USER')),
        password: localCfg?.db?.password ?? env('DATABASE_PASSWORD', env('DB_PASSWORD')),
        name: localCfg?.db?.name ?? env('DATABASE_NAME', env('DB_NAME'))
    },
    jwt: {
        // NOTE: do not provide an insecure production fallback. Auth routes enforce this too.
        secret: localCfg?.jwt?.secret ?? env('JWT_SECRET'),
        expiresIn: localCfg?.jwt?.expiresIn ?? env('TOKEN_EXPIRES_IN', '7d')
    },
    smtp: {
        host: localCfg?.smtp?.host ?? env('SMTP_HOST'),
        port: Number(localCfg?.smtp?.port ?? env('SMTP_PORT', 465)),
        secure: String(localCfg?.smtp?.secure ?? env('SMTP_SECURE', 'true')) === 'true',
        user: localCfg?.smtp?.user ?? env('SMTP_USER'),
        pass: localCfg?.smtp?.pass ?? env('SMTP_PASS'),
        from: localCfg?.smtp?.from ?? env('SMTP_FROM')
    },
    company: {
        name: localCfg?.company?.name ?? env('COMPANY_NAME', 'AM Automobile'),
        address: localCfg?.company?.address ?? env('COMPANY_ADDRESS'),
        phone: localCfg?.company?.phone ?? env('COMPANY_PHONE'),
        email: localCfg?.company?.email ?? env('COMPANY_EMAIL'),
        lat: Number(localCfg?.company?.lat ?? env('COMPANY_LAT', 52.52)),
        lng: Number(localCfg?.company?.lng ?? env('COMPANY_LNG', 13.405))
    }
};

export function validateConfig() {
    const missing = [];
    if (!config.db.user) missing.push('DATABASE_USER');
    if (!config.db.password) missing.push('DATABASE_PASSWORD');
    if (!config.db.name) missing.push('DATABASE_NAME');
    return missing;
}

export default config;
