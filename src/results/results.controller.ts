import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ResultsService } from './results.service';
import { CreateResultDto } from './dto/create-result.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../common/decorators/current-user.decorator';

@ApiTags('results')
@Controller('api/results')
export class ResultsController {
  constructor(private readonly results: ResultsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  create(@CurrentUser() user: CurrentUserPayload, @Body() dto: CreateResultDto) {
    return this.results.createForActor(user, dto);
  }
}

