import { Get, Controller, Body, Delete, Headers, Logger, Patch, Inject, forwardRef } from '@nestjs/common';
import { UserService } from './user.service';
import { UserDto } from './dto/user.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { CurrentUser } from 'src/auth/decorators/user.decorator';
import { AuthService } from 'src/auth/auth.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService
  ) { }

  @Get('profile')
  @Auth()
  async getProfile(
    @CurrentUser('id') id: string,
    @Headers('authorization') authHeader: string
  ) {
    await this.authService.verifyToken(authHeader, id)
    return this.userService.profile(id)
  }

  @Delete('profile')
  @Auth()
  async deleteProfile(
    @Body() dto: UserDto,
    @Headers('authorization') authHeader: string
  ) {
    await this.authService.verifyToken(authHeader, dto?.id)
    return await this.userService.delete(dto);
  }

  @Patch('profile')
  async updateUser(
    @Body() dto: UserDto,
    @Headers('authorization') authHeader: string
  ) {
    await this.authService.verifyToken(authHeader, dto?.id)
    return await this.userService.validatedUpdate(dto)
  }

} 
