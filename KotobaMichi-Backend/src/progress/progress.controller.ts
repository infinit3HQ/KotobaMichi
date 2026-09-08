import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { ProgressService } from './progress.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth/jwt-auth.guard';
import { AuthenticatedRequest } from 'src/auth/types';

@Controller('progress')
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  getUserProgress(@Req() req: AuthenticatedRequest) {
    return this.progressService.getUserProgress(req.user.sub);
  }
}
