import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Callback guard. A failed Google round-trip returns no user so the controller
 * can send the browser back to the login page. The start route keeps the
 * default guard, which must redirect to Google instead of swallowing that step.
 */
@Injectable()
export class GoogleCallbackGuard extends AuthGuard('google') {
	override handleRequest<TUser = unknown>(
		err: unknown,
		user: TUser,
		_info: unknown,
		_context: ExecutionContext,
		_status?: unknown
	): TUser {
		if (err || !user) return null as TUser;
		return user;
	}
}
