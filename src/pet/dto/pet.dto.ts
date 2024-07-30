import { IsString, IsOptional, IsArray, ValidateNested, IsPhoneNumber, MinLength, IsEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePetDto {
  @IsString()
  userId: string;

  @IsString()
  type: string;

  @IsString()
  breed: string;

  @IsString()
  name: string;
}

export class UpdatePetDto {
  @IsString()
  userId: string;

  @IsString()
  petId: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsString()
  breed?: string;

  @IsOptional()
  @IsString()
  name?: string;
}