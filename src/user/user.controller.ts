import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthenticationGuard } from 'src/auth/guard/authentication.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/shared/decorator/roles.decorator';
import { Role, User } from '@prisma/client';
import { CheckOwnership } from 'src/shared/decorator/check-owner.decorators';
import { FilterUserDto } from './dto/filter-user.dto';
import { GetUser } from 'src/shared/decorator/user.decorator';

@Controller('user')
@UseGuards(AuthenticationGuard, RolesGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @Roles(Role.SUPER_MANAGER, Role.MANAGER)
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Post('/agent')
  @Roles(Role.SUPER_MANAGER, Role.MANAGER)
  createAgent(@Body() createUserDto: CreateUserDto) {
    return this.userService.createAgent(createUserDto);
  }

  @Get()
  @Roles(Role.SUPER_MANAGER, Role.MANAGER)
  findAll(
    @Query() filterUserDto: FilterUserDto,
    @CheckOwnership([Role.SUPER_MANAGER, Role.MANAGER]) haveAccess: boolean,
  ) {
    if (!haveAccess)
      throw new ForbiddenException('You do not have access to this resource');
    return this.userService.findAll(filterUserDto);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @CheckOwnership([Role.SUPER_MANAGER, Role.MANAGER]) haveAccess: boolean,
  ) {
    if (!haveAccess)
      throw new ForbiddenException('You do not have access to this resource');
    return this.userService.findOneById(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @GetUser() user: User,
  ) {
    return this.userService.update(id, updateUserDto, user);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @GetUser() user: User) {
    return this.userService.remove(id, user);
  }
}
