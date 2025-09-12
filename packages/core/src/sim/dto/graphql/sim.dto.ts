import { SimStatus, SimType } from '@prisma/client';
import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';

import { Paginated } from '@/paginated';

registerEnumType(SimType, { name: 'SimType' });
registerEnumType(SimStatus, { name: 'SimStatus' });

@ObjectType()
export class SimDto {
	@Field()
	iccid: string;

	@Field()
	createdAt: Date;

	@Field(() => SimType)
	type: SimType;

	@Field(() => SimStatus)
	status: SimStatus;

	@Field(() => String, { nullable: true })
	pin: string | null;

	@Field(() => String, { nullable: true })
	puk: string | null;

	@Field(() => String, { nullable: true })
	pin2: string | null;

	@Field(() => String, { nullable: true })
	puk2: string | null;
}

@ObjectType()
export class PaginatedSims extends Paginated(SimDto) {}
