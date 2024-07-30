import { IsString, IsOptional, IsArray, ValidateNested, IsPhoneNumber, MinLength, IsEmpty } from 'class-validator';
import { Type } from 'class-transformer';

class PetDto {
  @IsString()
  name: string;

  @IsString()
  type: string;

  @IsString()
  breed: string;
}

export class RegisterDto {
  @IsString()
  name: string;

  @IsString()
  surname: string;

  @IsPhoneNumber()
  phone: string;

  @MinLength(6, {
    message: 'password must be at least 6 characters long'
  })
  @IsString()
  password: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PetDto)
  pets?: PetDto[];
}
