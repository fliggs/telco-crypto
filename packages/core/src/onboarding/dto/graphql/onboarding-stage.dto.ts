import { OnboardingStageType } from '@prisma/client';
import { Field, Int, ObjectType, registerEnumType } from '@nestjs/graphql';

import { Content } from '@/content/dto/internal/content.dto';
import { ContentDto } from '@/content/dto/graphql/content.dto';

registerEnumType(OnboardingStageType, { name: 'OnboardingStageType' });

@ObjectType()
export class OnboardingStageDto {
	@Field()
	name: string;

	@Field(() => Int)
	sort: number;

	@Field(() => OnboardingStageType)
	type: OnboardingStageType;

	@Field()
	required: boolean;

	@Field(() => ContentDto)
	content: Content;
}
