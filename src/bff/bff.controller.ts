import { Controller, Get, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { BffService } from './bff.service';

@ApiTags('bff')
@Controller('api/bff')
export class BffController {
  constructor(private readonly bff: BffService) {}

  @Get('home')
  home() {
    return this.bff.home();
  }

  @Get('quiz/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async quizDetails(
    @CurrentUser() user: any,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.bff.quizDetails(user.userId, id);
  }

  @Get('game/:id')
  async gameDetails(@Param('id', ParseIntPipe) id: number) {
    return this.bff.gameDetails(id);
  }
}

