import { IsString, IsOptional, IsArray, ValidateNested, IsPhoneNumber, MinLength, IsEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class PetDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsString()
  breed?: string;

}

export class UserDto {
  @IsString()
  @IsOptional()
  id?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  surname?: string;

  @IsOptional()
  @IsPhoneNumber()
  phone?: string;

  @IsOptional()
  @MinLength(6, {
    message: 'password must be at least 6 characters long'
  })
  @IsString()
  password?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PetDto)
  pets?: PetDto[];
}
