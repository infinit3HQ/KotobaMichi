import { Module } from '@nestjs/common';
import { DrizzleModule } from 'src/db/drizzle.module';
import { LearningController } from './learning.controller';
import { LearningService } from './learning.service';

@Module({
	imports: [DrizzleModule],
	controllers: [LearningController],
	providers: [LearningService],
})
export class LearningModule {}
