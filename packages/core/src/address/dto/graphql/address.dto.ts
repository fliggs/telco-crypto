import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { AddressType } from '@prisma/client';

registerEnumType(AddressType, { name: 'AddressType' });

@ObjectType()
export class AddressDto {
	@Field()
	id: string;

	@Field(() => AddressType)
	type: AddressType;

	@Field()
	line1: string;

	@Field()
	line2: string;

	@Field()
	line3: string;

	@Field()
	line4: string;

	@Field()
	city: string;

	@Field()
	postalCode: string;

	@Field()
	province: string;

	@Field()
	country: string;
}
