import { RegisterDto } from './../auth/dto/register.dto';
import { UserDto, PetDto } from './dto/user.dto';
import { BadRequestException, forwardRef, Inject, Injectable, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { hash, verify } from 'argon2';
import { AuthService } from 'src/auth/auth.service';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class UserService {

  constructor(private prisma: PrismaService,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService
  ) { }

  getById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        pets: true
      }
    });
  }

  getByPhoneNumber(phone: string) {
    return this.prisma.user.findUnique({
      where: {
        phone,
      }
    });
  }

  async profile(id: string) {
    const userData = await this.getById(id)
    const { password, createdAt, updatedAt, notes, ...profile } = userData

    return profile
  }

  async create(dto: RegisterDto) {
    const { name, surname, phone, password, pets } = dto
    if (!name || !surname || !phone || !password) {
      throw new BadRequestException('Missing required fields')
    }

    if (pets && pets.length !== 0) {
      for (const pet of pets) {
        if (!pet.name || !pet.type || !pet.breed) {
          throw new BadRequestException('Each pet must have name, type, and breed');
        }
      }
    }

    const user = {
      name: name,
      surname: surname,
      phone: phone,
      password: await hash(password),
      pets: {
        create: pets?.map(pet => ({
          name: pet.name,
          type: pet.type,
          breed: pet.breed,
        }))
      }
    }

    return this.prisma.user.create({
      data: user,
      select: {
        id: true,
        name: true,
        surname: true,
        phone: true,
        password: true,
        pets: {
          select: {
            id: true,
            name: true,
            type: true,
            breed: true,
          }
        }
      }
    })
  }

  async update(data: UserDto, id: string) {

    if (data?.password) {
      data.password = await hash(data.password);
    }

    return await this.prisma.user.update({
      where: { id },
      data: {
        name: data?.name,
        surname: data?.surname,
        phone: data?.phone,
        password: data?.password,
      }, select: {
        id: true,
        name: true,
        surname: true,
        phone: true,
        pets: {
          select: {
            id: true,
            name: true,
            type: true,
            breed: true,
          }
        }
      }
    });
  }

  async delete(dto: UserDto) {
    const { id, password } = dto
    if (!id) throw new BadRequestException('Invalid id')
    if (!password) throw new BadRequestException('Incorrect password')
    
    const user = await this.getById(id)

    const isValid = await verify(user.password, password)
    if (!isValid) throw new BadRequestException('Incorrect password')
    
    return await this.prisma.user.delete({where: { id }, include: { pets: true }})
  }

  async validatedUpdate(dto: UserDto) {
    if (dto?.phone) {
      const isPhoneExist = await this.getByPhoneNumber(dto.phone);
      if (isPhoneExist && isPhoneExist.id !== dto.id) throw new BadRequestException('User already exists');
    }

    return await this.update(dto, dto.id)
  }

}
