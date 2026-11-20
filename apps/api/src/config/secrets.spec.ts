import { findInsecureSecrets } from './secrets';

const STRONG = 'k7Qm2xV9pL4tR8wZ1cN6bH3jF5sD0gY2';

describe('findInsecureSecrets', () => {
	it('accepts strong secrets in production', () => {
		expect(
			findInsecureSecrets({
				NODE_ENV: 'production',
				JWT_SECRET: STRONG,
				COOKIE_SECRET: 'another-random-value-26chr',
			})
		).toEqual([]);
	});

	it('rejects the .env.example placeholders in production', () => {
		expect(
			findInsecureSecrets({
				NODE_ENV: 'production',
				JWT_SECRET: 'your_super_secret_jwt_key_that_is_very_long',
				COOKIE_SECRET: 'your_super_secret_cookie_key_that_is_very_long',
			})
		).toEqual([
			'JWT_SECRET is a published example value',
			'COOKIE_SECRET is a published example value',
		]);
	});

	it('rejects the docker-compose development default in production', () => {
		expect(
			findInsecureSecrets({
				NODE_ENV: 'production',
				JWT_SECRET: 'dev_super_secret_jwt_key_that_is_very_long',
			})
		).toEqual(['JWT_SECRET is a published example value']);
	});

	it('requires a JWT_SECRET of at least 32 characters in production', () => {
		expect(findInsecureSecrets({ NODE_ENV: 'production' })).toEqual([
			'JWT_SECRET is not set',
		]);
		expect(
			findInsecureSecrets({ NODE_ENV: 'production', JWT_SECRET: 'short' })
		).toEqual(['JWT_SECRET must be at least 32 characters']);
	});

	it('allows an unset COOKIE_SECRET', () => {
		expect(
			findInsecureSecrets({ NODE_ENV: 'production', JWT_SECRET: STRONG })
		).toEqual([]);
	});

	it('does not block development with example values', () => {
		expect(
			findInsecureSecrets({
				NODE_ENV: 'development',
				JWT_SECRET: 'your_super_secret_jwt_key_that_is_very_long',
			})
		).toEqual([]);
		expect(findInsecureSecrets({})).toEqual([]);
	});
});
