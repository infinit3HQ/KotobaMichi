import { resolveCorsOrigins } from './cors';

describe('resolveCorsOrigins', () => {
	it('combines CORS_ORIGIN and APP_URL without trailing slashes or duplicates', () => {
		expect(
			resolveCorsOrigins({
				CORS_ORIGIN: 'https://a.example/, https://b.example ,',
				APP_URL: 'https://a.example',
			})
		).toEqual(['https://a.example', 'https://b.example']);
	});

	it('allows only APP_URL when CORS_ORIGIN is empty', () => {
		expect(
			resolveCorsOrigins({ CORS_ORIGIN: '', APP_URL: 'https://app.example/' })
		).toEqual(['https://app.example']);
	});

	it('allows no origin in production when nothing is configured', () => {
		expect(resolveCorsOrigins({ NODE_ENV: 'production' })).toEqual([]);
	});

	it('falls back to the local web app in development', () => {
		expect(resolveCorsOrigins({ NODE_ENV: 'development' })).toEqual([
			'http://localhost:3000',
		]);
		expect(resolveCorsOrigins({})).toEqual(['http://localhost:3000']);
	});
});
