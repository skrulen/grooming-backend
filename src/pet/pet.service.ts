import { UserService } from 'src/user/user.service';
import { CreatePetDto, UpdatePetDto } from './dto/pet.dto';
import { BadRequestException, forwardRef, Inject, Injectable, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';
import { PrismaService } from 'src/prisma.service';
import { UserDto } from 'src/user/dto/user.dto';

@Injectable()
export class PetService {
  constructor(private prisma: PrismaService,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
    private readonly userService: UserService
  ) { }

  async create(dto: CreatePetDto) {
    const { userId, type, breed, name } = dto;
    if (!userId || !type || !breed || !name) {
      throw new BadRequestException('Missing required fields');
    }

    return await this.prisma.pet.create({
      data: {
        ownerId: userId,
        name: name,
        type: type,
        breed: breed,
      }, select: {
        id: true,
        type: true,
        breed: true,
        name: true
      }
    });
  }

  async delete(petId: string) {
    if (!petId) throw new BadRequestException('Invalid pet id')
    return await this.prisma.pet.delete({
      where: { id: petId }
    })
  }

  async update(dto: UpdatePetDto, user: UserDto) {
    if (user.pets.length < 1) throw new BadRequestException('No pets to change')
    if (!dto.petId) throw new BadRequestException('Invalid pet id')

    return await this.prisma.pet.update({
      where: { id: dto.petId },
      data: {
        type: dto?.type,
        breed: dto?.breed,
        name: dto?.name,
      }, select: {
        id: true,
        type: true,
        breed: true,
        name: true
      }
    });
  }

  async validate(dto: any, authHeader: string) {
    const user = await this.authService.verifyToken(authHeader, dto?.userId);
    if (user.id !== dto.userId) {
      throw new UnauthorizedException('You are not authorized to update this user')
    }

    if ('petId' in dto) {
      let petFound = false;
      for (const pet of user.pets) {
        if (pet.id === dto.petId) {
          petFound = true;
          break;
        }
      }

      if (!petFound) {
        throw new BadRequestException('No pet found with such id')
      }
    }

    return user;
  }
}