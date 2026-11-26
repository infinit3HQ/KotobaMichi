import { Module } from '@nestjs/common';
import { DrizzleModule } from '@/db/drizzle.module';
import { LearningModule } from '@/learning/learning.module';
import { MockExamsController } from './mock-exams.controller';
import { MockExamsService } from './mock-exams.service';

@Module({
	imports: [DrizzleModule, LearningModule],
	controllers: [MockExamsController],
	providers: [MockExamsService],
})
export class MockExamsModule {}
