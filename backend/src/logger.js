export function logError(tag, err) {
    const msg = err?.message || String(err);

    // In production, keep logs terse (no stack/PII). In non-prod, log full error for debugging.
    if (process.env.NODE_ENV === 'production') {
        console.error(tag, msg);
    } else {
        console.error(tag, err);
    }
}
