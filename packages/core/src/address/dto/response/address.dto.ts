import { ApiProperty } from '@nestjs/swagger';
import { AddressType } from '@prisma/client';
import { Expose } from 'class-transformer';

export class AddressDto {
	@Expose()
	id: string;

	@Expose()
	@ApiProperty({ enum: AddressType, enumName: 'AddressType' })
	type: AddressType;

	@Expose()
	name: string | null;

	@Expose()
	line1: string;

	@Expose()
	line2: string;

	@Expose()
	line3: string;

	@Expose()
	line4: string;

	@Expose()
	city: string;

	@Expose()
	postalCode: string;

	@Expose()
	province: string;

	@Expose()
	country: string;
}
