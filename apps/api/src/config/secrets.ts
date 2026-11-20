type Env = Record<string, string | undefined>;

const MIN_JWT_SECRET_LENGTH = 32;

// Values published in .env.example, docs and the local docker-compose.yml.
// Anyone can read them, so a production server must never run with them.
const PUBLISHED_EXAMPLE_VALUES = new Set([
	'your_super_secret_jwt_key_that_is_very_long',
	'your_super_secret_cookie_key_that_is_very_long',
	'dev_super_secret_jwt_key_that_is_very_long',
	'your-super-secret-jwt-key-minimum-32-characters',
	'dev-cookie-secret',
]);

/** Lists problems with the signing secrets. Only production is checked. */
export function findInsecureSecrets(env: Env): string[] {
	if (env['NODE_ENV'] !== 'production') return [];

	const problems: string[] = [];
	const jwtSecret = env['JWT_SECRET'];
	if (!jwtSecret) {
		problems.push('JWT_SECRET is not set');
	} else if (PUBLISHED_EXAMPLE_VALUES.has(jwtSecret)) {
		problems.push('JWT_SECRET is a published example value');
	} else if (jwtSecret.length < MIN_JWT_SECRET_LENGTH) {
		problems.push(
			`JWT_SECRET must be at least ${MIN_JWT_SECRET_LENGTH} characters`
		);
	}

	const cookieSecret = env['COOKIE_SECRET'];
	if (cookieSecret && PUBLISHED_EXAMPLE_VALUES.has(cookieSecret)) {
		problems.push('COOKIE_SECRET is a published example value');
	}
	return problems;
}
