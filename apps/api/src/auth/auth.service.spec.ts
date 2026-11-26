import { ConflictException } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import type { JwtService } from '@nestjs/jwt';
import type { DbService } from '@/db/drizzle.service';
import type { EmailService } from '@/email/email.service';
import { AuthService } from './auth.service';

type Internals = {
	getUserByEmail: (email: string) => Promise<unknown>;
	issueAndSendEmailVerification: (id: string, email: string) => Promise<void>;
	enforceVerificationRateLimit: (id: string) => Promise<void>;
};

function setup(existing: Record<string, unknown> | null) {
	const inserted: Record<string, unknown>[] = [];
	const db = {
		insert: () => ({
			values: (values: Record<string, unknown>) => ({
				returning: () => {
					inserted.push(values);
					return Promise.resolve([values]);
				},
			}),
		}),
	};
	const service = new AuthService(
		{ db } as unknown as DbService,
		{} as JwtService,
		{ get: () => undefined } as unknown as ConfigService,
		{} as EmailService
	);
	const internals = service as unknown as Internals;
	jest.spyOn(internals, 'getUserByEmail').mockResolvedValue(existing);
	const send = jest
		.spyOn(internals, 'issueAndSendEmailVerification')
		.mockResolvedValue(undefined);
	const limit = jest
		.spyOn(internals, 'enforceVerificationRateLimit')
		.mockResolvedValue(undefined);
	return { service, inserted, send, limit };
}

const dto = { email: 'new@example.test', password: 'secret-123' };

describe('AuthService.register', () => {
	it('creates the account and reports the email as sent', async () => {
		const { service, inserted } = setup(null);
		await expect(service.register(dto)).resolves.toMatchObject({
			emailSent: true,
		});
		expect(inserted).toHaveLength(1);
	});

	it('keeps the account and says so when the verification email fails', async () => {
		const { service, inserted, send } = setup(null);
		send.mockRejectedValue(new Error('getaddrinfo ENOTFOUND smtp.invalid'));
		await expect(service.register(dto)).resolves.toMatchObject({
			emailSent: false,
		});
		expect(inserted).toHaveLength(1);
	});

	it('sends a fresh link instead of a conflict when the email was never verified', async () => {
		const { service, inserted, send, limit } = setup({
			id: 'u1',
			email: dto.email,
			password: 'old-hash',
			isEmailVerified: false,
		});
		await expect(service.register(dto)).resolves.toMatchObject({
			emailSent: true,
		});
		expect(limit).toHaveBeenCalledWith('u1');
		expect(send).toHaveBeenCalledWith('u1', dto.email);
		expect(inserted).toHaveLength(0);
	});

	it('still rejects an email that is already verified', async () => {
		const { service } = setup({
			id: 'u1',
			email: dto.email,
			password: 'hash',
			isEmailVerified: true,
		});
		await expect(service.register(dto)).rejects.toBeInstanceOf(
			ConflictException
		);
	});
});
