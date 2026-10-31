import {
	Body,
	Controller,
	Get,
	Put,
	Post,
	Query,
	Req,
	UseGuards,
} from '@nestjs/common';
import { Throttle, seconds } from '@nestjs/throttler';
import { JwtAuthGuard } from 'src/auth/jwt-auth/jwt-auth.guard';
import { AuthenticatedRequest } from 'src/auth/types';
import {
	QueueQueryDto,
	ReviewBatchDto,
	ReviewDto,
	SavePlaceDto,
} from './dto/review.dto';
import { LearningService } from './learning.service';

@Controller('learning')
@UseGuards(JwtAuthGuard)
export class LearningController {
	constructor(private readonly learningService: LearningService) {}

	@Get('summary')
	summary(@Req() req: AuthenticatedRequest, @Query('day') day?: string) {
		return this.learningService.summary(req.user.sub, this.day(day));
	}

	@Get('queue')
	queue(@Req() req: AuthenticatedRequest, @Query() query: QueueQueryDto) {
		return this.learningService.queue(req.user.sub, query);
	}

	@Post('reviews')
	@Throttle({ default: { ttl: seconds(60), limit: 240 } })
	review(@Req() req: AuthenticatedRequest, @Body() dto: ReviewDto) {
		return this.learningService.review(req.user.sub, dto);
	}

	@Post('reviews/batch')
	@Throttle({ default: { ttl: seconds(60), limit: 10 } })
	reviewBatch(@Req() req: AuthenticatedRequest, @Body() dto: ReviewBatchDto) {
		return this.learningService.reviewBatch(req.user.sub, dto);
	}

	@Put('place')
	savePlace(@Req() req: AuthenticatedRequest, @Body() dto: SavePlaceDto) {
		return this.learningService.savePlace(req.user.sub, dto);
	}

	private day(value?: string) {
		if (value && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
		return new Date().toISOString().slice(0, 10);
	}
}
