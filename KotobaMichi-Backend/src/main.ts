import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';

async function bootstrap() {
	const logger = new Logger('Bootstrap');

	try {
		const app = await NestFactory.create(AppModule, {
			logger: ['error', 'warn', 'log', 'debug', 'verbose'],
		});

		// Google's saved production redirect is /api/auth/google/callback.
		// The API routes live under /v1, so this alias reaches the same handler.
		app.use((req: { url?: string }, _res: unknown, next: () => void) => {
			const url = req.url ?? '';
			if (
				url === '/api/auth/google' ||
				url.startsWith('/api/auth/google/') ||
				url.startsWith('/api/auth/google?')
			) {
				req.url = url.replace('/api/auth/google', '/v1/auth/google');
			}
			next();
		});

		// Enable CORS with credentials for cookie-based auth.
		// APP_URL is the web app, so it stays allowed even when CORS_ORIGIN lists another origin.
		const origins = new Set(
			(process.env['CORS_ORIGIN'] || '')
				.split(',')
				.map((s) => s.trim().replace(/\/$/, ''))
				.filter(Boolean)
		);
		const appUrl = process.env['APP_URL']?.trim().replace(/\/$/, '');
		if (appUrl) origins.add(appUrl);
		app.enableCors({
			origin: origins.size > 0 ? [...origins] : true,
			credentials: true,
		});
		logger.log('CORS enabled with credentials');

		// Cookie parser for reading HttpOnly cookies
		app.use(cookieParser(process.env['COOKIE_SECRET'] || undefined));
		logger.log('Cookie parser enabled');

		// Global validation pipe
		app.useGlobalPipes(
			new ValidationPipe({
				whitelist: true,
				forbidNonWhitelisted: true,
				transform: true,
			})
		);
		logger.log('Global validation pipe configured');

		// Global prefix for API routes
		app.setGlobalPrefix('v1/');
		logger.log('Global API prefix set to: v1/');

		const port = process.env['PORT'] || 3000;
		await app.listen(port);
		logger.log(`Application is running on: http://localhost:${port}`);
	} catch (error) {
		logger.error(
			'Failed to start application',
			error instanceof Error ? error.stack : String(error)
		);
		throw error;
	}
}
bootstrap();
