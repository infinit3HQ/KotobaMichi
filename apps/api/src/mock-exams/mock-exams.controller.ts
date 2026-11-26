import {
	Body,
	Controller,
	Get,
	Param,
	Post,
	Put,
	Req,
	UseGuards,
} from '@nestjs/common';
import { Throttle, seconds } from '@nestjs/throttler';
import { JwtAuthGuard } from '@/auth/jwt-auth/jwt-auth.guard';
import { SaveMockAttemptDto } from './dto/save-mock-attempt.dto';
import { MockExamsService } from './mock-exams.service';

interface AuthenticatedRequest {
	user: {
		userId: string;
		email: string;
		role: string;
	};
}

@Controller('mock-exams')
@UseGuards(JwtAuthGuard)
export class MockExamsController {
	constructor(private readonly mockExams: MockExamsService) {}

	@Get('attempts')
	list(@Req() req: AuthenticatedRequest) {
		return this.mockExams.list(req.user.userId);
	}

	@Get(':examId')
	forExam(@Param('examId') examId: string, @Req() req: AuthenticatedRequest) {
		return this.mockExams.forExam(req.user.userId, examId);
	}

	@Put(':examId')
	save(
		@Param('examId') examId: string,
		@Body() dto: SaveMockAttemptDto,
		@Req() req: AuthenticatedRequest
	) {
		return this.mockExams.save(req.user.userId, examId, dto);
	}

	@Post(':examId/mistakes')
	@Throttle({ default: { ttl: seconds(60), limit: 10 } })
	addMistakes(
		@Param('examId') examId: string,
		@Req() req: AuthenticatedRequest
	) {
		return this.mockExams.addMistakes(req.user.userId, examId);
	}

	@Post(':examId/finish')
	finish(
		@Param('examId') examId: string,
		@Body() dto: SaveMockAttemptDto,
		@Req() req: AuthenticatedRequest
	) {
		return this.mockExams.finish(req.user.userId, examId, dto);
	}
}
