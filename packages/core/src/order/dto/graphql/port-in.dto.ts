import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class PortInDto {
	@Field()
	isPortingIn: boolean;

	@Field(() => String, { nullable: true })
	msisdn?: string | null;

	@Field(() => String, { nullable: true })
	accountNumber?: string | null;

	@Field(() => String, { nullable: true })
	password?: string | null;

	@Field(() => String, { nullable: true })
	postalCode?: string | null;
}
