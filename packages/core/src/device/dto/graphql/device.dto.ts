import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { DeviceType } from '@prisma/client';

registerEnumType(DeviceType, { name: 'DeviceType' });

@ObjectType()
export class DeviceDto {
	@Field()
	id: string;

	@Field(() => DeviceType)
	type: DeviceType;

	@Field()
	name: string;

	@Field()
	eSimSupport: boolean;
}
