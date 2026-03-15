import { defineMiddleware } from 'astro:middleware';

const SITE_PASSWORD = import.meta.env.SITE_PASSWORD || 'viagemgarantida2026';

const PUBLIC_PATHS = ['/login', '/api/login'];

export const onRequest = defineMiddleware(async (context, next) => {
    const { pathname } = context.url;

    // Allow public paths
    if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
        return next();
    }

    // Allow static assets
    if (pathname.match(/\.(css|js|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/)) {
        return next();
    }

    // Check for auth cookie
    const authCookie = context.cookies.get('vg_auth');
    if (authCookie?.value === generateToken(SITE_PASSWORD)) {
        return next();
    }

    // Redirect to login
    return context.redirect('/login');
});

function generateToken(password: string): string {
    // Simple hash for cookie validation
    let hash = 0;
    const str = `vg_${password}_secure`;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0;
    }
    return Math.abs(hash).toString(36);
}
