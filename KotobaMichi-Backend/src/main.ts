import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { resolveCorsOrigins } from './config/cors';

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
		// Only listed origins may send cookies. An empty list blocks cross-origin calls.
		const origins = resolveCorsOrigins(process.env);
		app.enableCors({
			origin: origins.length > 0 ? origins : false,
			credentials: true,
		});
		if (origins.length > 0) {
			logger.log(`CORS enabled with credentials for: ${origins.join(', ')}`);
		} else {
			logger.error(
				'No CORS_ORIGIN or APP_URL set. Cross-origin requests from the web app will be rejected.'
			);
		}

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
