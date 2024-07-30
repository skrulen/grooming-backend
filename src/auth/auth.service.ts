import { RegisterDto } from './dto/register.dto';
import { UserService } from 'src/user/user.service';
import { BadRequestException, forwardRef, Inject, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { verify } from 'argon2';
import { Response } from 'express';
import { Logger } from '@nestjs/common';
import { UserDto } from 'src/user/dto/user.dto';

@Injectable()
export class AuthService {
  EXPIRE_DAY_REFRESH_TOKEN = 1
  REFRESH_TOKEN_NAME = 'refreshToken'

  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    @Inject(forwardRef(() => UserService))
    private userService: UserService
  ) { }

  async login(dto: LoginDto) {
    const { password, ...user } = await this.validateUser(dto);
    const tokens = this.issueTokens(user.id);

    return {
      user,
      ...tokens,
    }
  }

  async register(dto: RegisterDto) {
    const isPhoneExist = await this.userService.getByPhoneNumber(dto.phone);
    if (isPhoneExist) throw new BadRequestException('User already exists');

    const { password, ...user } = await this.userService.create(dto);

    const tokens = this.issueTokens(user.id);

    return {
      user,
      ...tokens,
    }
  }

  async getNewTokens(refreshToken: string) {
    const result = await this.jwt.verifyAsync(refreshToken)
    if (!result) throw new UnauthorizedException('Invalid refresh token')

    const { password, ...user } = await this.userService.getById(result.id)
    const tokens = this.issueTokens(user.id)

    return {
      user,
      ...tokens,
    }
  }

  private issueTokens(userId: string) {
    const data = { id: userId };

    const accessToken = this.jwt.sign(data, {
      expiresIn: '12h'
    })

    const refreshToken = this.jwt.sign(data, {
      expiresIn: '30d'
    })

    return { accessToken, refreshToken }
  }

  private async validateUser(dto: LoginDto) {
    const user = await this.userService.getByPhoneNumber(dto.phone);
    if (!user) throw new NotFoundException('User not found');

    const isValid = await verify(user.password, dto.password);
    if (!isValid) throw new UnauthorizedException('Invalid password');

    return user;
  }

  async verifyToken(authHeader: string, userId: string) {
    if (!userId) throw new BadRequestException('Invalid id')
    if (!authHeader) {
      throw new UnauthorizedException('Authorization header is missing')
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = this.jwt.verify(token);
      const user = await this.userService.getById(decoded.id);

      if (!user) {
        throw new UnauthorizedException('Invalid token')
      }
  
      if (user.id !== userId) {
        throw new UnauthorizedException('You are not authorized to update this user');
      }
  
      return user;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }

  }

  addRefreshTokenToResponse(res: Response, refreshToken: string) {
    const expiresIn = new Date()
    expiresIn.setDate(expiresIn.getDate() + this.EXPIRE_DAY_REFRESH_TOKEN)

    res.cookie(this.REFRESH_TOKEN_NAME, refreshToken, {
      httpOnly: true,
      domain: 'localhost',
      expires: expiresIn,
      secure: true,
      //lax in prod
      sameSite: 'none',
    })
  }

  removeRefreshTokenToResponse(res: Response) {
    res.cookie(this.REFRESH_TOKEN_NAME, '', {
      httpOnly: true,
      domain: 'localhost',
      expires: new Date(0),
      secure: true,
      //lax in prod
      sameSite: 'none',
    })
  }

}
