import { OrderDirection } from '@common/enums';
import { IsOptional, IsString, IsEnum } from 'class-validator';

export class OrderByInputDto {
  @IsOptional()
  @IsString()
  field?: string;

  @IsOptional()
  @IsEnum(OrderDirection)
  direction?: OrderDirection = OrderDirection.ASC;
}
