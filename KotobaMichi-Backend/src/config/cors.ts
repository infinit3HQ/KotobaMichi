const DEV_FALLBACK_ORIGINS = ['http://localhost:3000'];

function normalize(origin: string) {
	return origin.trim().replace(/\/+$/, '');
}

/**
 * Origins allowed to call the API with cookies.
 * CORS_ORIGIN is a comma-separated list. APP_URL (the web app) is always allowed.
 * When nothing is configured, development allows the local web app and
 * production allows no cross-origin requests at all.
 */
export function resolveCorsOrigins(env: NodeJS.ProcessEnv): string[] {
	const origins = new Set(
		(env['CORS_ORIGIN'] ?? '').split(',').map(normalize).filter(Boolean)
	);
	const appUrl = env['APP_URL'] ? normalize(env['APP_URL']) : '';
	if (appUrl) origins.add(appUrl);
	if (origins.size > 0) return [...origins];

	const isProd = (env['NODE_ENV'] ?? '').toLowerCase() === 'production';
	return isProd ? [] : [...DEV_FALLBACK_ORIGINS];
}
