import { Body, Controller, Get, Patch, Post, Headers, Delete, Inject, forwardRef } from "@nestjs/common";
import { PetService } from "./pet.service";
import { UpdatePetDto, CreatePetDto } from "./dto/pet.dto";
import { AuthService } from "src/auth/auth.service";

@Controller('pet')
export class PetController {
  constructor(private readonly petService: PetService) { }

  @Post()
  async createPet(
    @Body() dto: CreatePetDto,
    @Headers('authorization') authHeader: string
  ) {
    await this.petService.validate(dto, authHeader);
    return await this.petService.create(dto);
  }

  @Delete()
  async deletePet(
    @Body() dto: UpdatePetDto,
    @Headers('authorization') authHeader: string
  ) {
    await this.petService.validate(dto, authHeader);
    return await this.petService.delete(dto.petId);
  }

  @Patch()
  async updatePet(
    @Body() dto: UpdatePetDto,
    @Headers('authorization') authHeader: string
  ) {
    const user = await this.petService.validate(dto, authHeader);
    return await this.petService.update(dto, user);
  }
}