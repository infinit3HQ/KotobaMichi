import { Module } from '@nestjs/common';
import { DrizzleModule } from '@/db/drizzle.module';
import { EmailModule } from '@/email/email.module';
import { NudgesService } from './nudges.service';

@Module({
	imports: [DrizzleModule, EmailModule],
	providers: [NudgesService],
})
export class NudgesModule {}
