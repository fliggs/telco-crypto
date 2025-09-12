import { PhoneNumberSource, PhoneNumberStatus } from '@prisma/client';

import { Paginated } from '@/paginated';
import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';

registerEnumType(PhoneNumberSource, { name: 'PhoneNumberSource' });
registerEnumType(PhoneNumberStatus, { name: 'PhoneNumberStatus' });

@ObjectType()
export class PhoneNumberDto {
	@Field()
	msisdn: string;

	@Field()
	createdAt: Date;

	@Field()
	updatedAt: Date;

	@Field(() => PhoneNumberSource)
	source: PhoneNumberSource;

	@Field(() => PhoneNumberStatus)
	status: PhoneNumberStatus;
}

@ObjectType()
export class PaginatedPhoneNumbers extends Paginated(PhoneNumberDto) {}
