import { Module } from '@nestjs/common';
import { DrizzleModule } from '@/db/drizzle.module';
import { MockExamsController } from './mock-exams.controller';
import { MockExamsService } from './mock-exams.service';

@Module({
	imports: [DrizzleModule],
	controllers: [MockExamsController],
	providers: [MockExamsService],
})
export class MockExamsModule {}
