import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class OnboardingProgressDto {
	@Field()
	id: string;

	@Field()
	stageName: string;

	@Field(() => Date, { nullable: true })
	startedAt: Date | null;

	@Field(() => Date, { nullable: true })
	completedAt: Date | null;
}
