import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';

@ObjectType()
export class OrderChangePhoneNumberDetailsDto {
	@Field()
	orderId: string;

	@Field()
	portIn: boolean;

	@Field(() => String, { nullable: true })
	portInMsisdn?: string | null;

	@Field(() => String, { nullable: true })
	portInAccountNumber?: string | null;

	@Field(() => String, { nullable: true })
	portInPassword?: string | null;

	@Field(() => String, { nullable: true })
	portInPostalCode?: string | null;
}
