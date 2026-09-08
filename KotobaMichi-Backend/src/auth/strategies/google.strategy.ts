import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
	constructor(
		configService: ConfigService,
		private authService: AuthService
	) {
		const clientID = configService.get<string>('GOOGLE_CLIENT_ID') || 'placeholder_google_client_id';
		const clientSecret = configService.get<string>('GOOGLE_CLIENT_SECRET') || 'placeholder_google_client_secret';
		const callbackURL = configService.get<string>('GOOGLE_CALLBACK_URL') || 'http://localhost:3000/v1/auth/google/callback';

		super({
			clientID,
			clientSecret,
			callbackURL,
			scope: ['email', 'profile'],
		});
	}

	async validate(
		_accessToken: string,
		_refreshToken: string,
		profile: any,
		done: VerifyCallback
	): Promise<any> {
		const { id, emails, displayName, photos } = profile;

		const email = emails?.[0]?.value;
		if (!email) {
			return done(new Error('No email found in Google profile'), false);
		}

		try {
			// Use the auth service to find or create user
			const user = await this.authService.validateOAuthUser({
				email,
				googleId: id,
				name: displayName,
				picture: photos?.[0]?.value,
			});

			done(null, user);
		} catch (error) {
			done(error, false);
		}
	}
}
