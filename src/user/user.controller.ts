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
  UploadedFile,
  UseInterceptors,
  HttpStatus,
  ParseFilePipeBuilder,
  HttpCode,
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
import { FileInterceptor } from '@nestjs/platform-express';
import { ActivateDto } from './dto/activate.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('/agent')
  @UseGuards(AuthenticationGuard, RolesGuard)
  @Roles(Role.SUPER_MANAGER, Role.MANAGER)
  createAgent(@Body() createUserDto: CreateUserDto, @GetUser() user: User) {
    createUserDto.organizationId = user.organizationId;

    return this.userService.createAgent(createUserDto);
  }

  @Post('/agent/csv')
  @UseGuards(AuthenticationGuard, RolesGuard)
  @Roles(Role.SUPER_MANAGER, Role.MANAGER)
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 1024 * 1024 * 5, // 5MB
      },
    }),
  )
  createAgentCsv(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: 'csv',
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    file: Express.Multer.File,
    @GetUser() user: User,
  ) {
    return this.userService.readCsv(file, user.organizationId);
  }

  @Post('/agent/excel')
  @UseGuards(AuthenticationGuard, RolesGuard)
  @Roles(Role.SUPER_MANAGER, Role.MANAGER)
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 1024 * 1024 * 5, // 5MB
      },
    }),
  )
  createAgentExcel(
    @UploadedFile(
      new ParseFilePipeBuilder().build({
        errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      }),
    )
    file: Express.Multer.File,
    @GetUser() user: User,
  ) {
    return this.userService.readExcelSheet(file, user.organizationId);
  }

  @Post('/activate')
  @HttpCode(HttpStatus.OK)
  activateUser(@Body() activateDto: ActivateDto) {
    return this.userService.activateUser(
      activateDto.token,
      activateDto.password,
    );
  }

  @Post('/manager')
  @UseGuards(AuthenticationGuard, RolesGuard)
  @Roles(Role.SUPER_MANAGER)
  async createManager(
    @Body() createUserDto: CreateUserDto,
    @GetUser() user: User,
  ) {
    createUserDto.organizationId = user.organizationId;

    return this.userService.createManager(createUserDto);
  }

  @Get()
  @UseGuards(AuthenticationGuard, RolesGuard)
  @Roles(Role.SUPER_MANAGER, Role.MANAGER)
  findAll(
    @Query() filterUserDto: FilterUserDto,
    @CheckOwnership([Role.SUPER_MANAGER, Role.MANAGER]) haveAccess: boolean,
  ) {
    if (!haveAccess)
      throw new ForbiddenException('You do not have access to this resource');
    return this.userService.findAll(filterUserDto);
  }

  @Get('/agent')
  @UseGuards(AuthenticationGuard, RolesGuard)
  @Roles(Role.SUPER_MANAGER, Role.MANAGER)
  findAllAgent(@GetUser() user: User) {
    return this.userService.findAllAgent(user.organizationId);
  }

  @Get(':id')
  @UseGuards(AuthenticationGuard, RolesGuard)
  findOne(
    @Param('id') id: string,
    @CheckOwnership([Role.SUPER_MANAGER, Role.MANAGER]) haveAccess: boolean,
  ) {
    if (!haveAccess)
      throw new ForbiddenException('You do not have access to this resource');
    return this.userService.findOneById(id);
  }

  @Patch(':id')
  @UseGuards(AuthenticationGuard, RolesGuard)
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @GetUser() user: User,
  ) {
    return this.userService.update(id, updateUserDto, user);
  }

  @Delete(':id')
  @UseGuards(AuthenticationGuard, RolesGuard)
  remove(@Param('id') id: string, @GetUser() user: User) {
    return this.userService.remove(id, user);
  }
}
