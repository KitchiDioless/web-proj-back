import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SelfOrAdminGuard } from '../common/guards/ownership.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../common/decorators/current-user.decorator';

@ApiTags('users')
@Controller('api/users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get()
  list() {
    return this.users.list();
  }

  @Get('by-email')
  getByEmail(@Query('email') email: string) {
    return this.users.getByEmail(email);
  }

  @Get('by-username')
  getByUsername(@Query('username') username: string) {
    return this.users.getByUsername(username);
  }

  @Get(':id')
  getById(@Param('id', ParseIntPipe) id: number) {
    return this.users.getById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  create(@Body() dto: CreateUserDto) {
    return this.users.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, SelfOrAdminGuard)
  @ApiBearerAuth()
  update(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserDto,
  ) {
    return this.users.updateForActor(user, id, dto);
  }

  @Get(':id/results')
  @UseGuards(JwtAuthGuard, SelfOrAdminGuard)
  @ApiBearerAuth()
  results(@Param('id', ParseIntPipe) id: number) {
    return this.users.getResults(id);
  }
}

