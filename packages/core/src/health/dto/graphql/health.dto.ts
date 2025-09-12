import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class HealthResultDto {
	@Field()
	status: string;

	@Field({ nullable: true })
	message?: string;
}

@ObjectType()
export class MinVersionDto {
	@Field()
	android: string;

	@Field()
	ios: string;
}

@ObjectType()
export class HealthResultMobileAppDto extends HealthResultDto {
	@Field(() => MinVersionDto)
	minVersion: MinVersionDto;
}

@ObjectType()
export class HealthIndicatorDto {
	@Field(() => HealthResultDto, { nullable: true })
	network?: HealthResultDto;

	@Field(() => HealthResultDto, { nullable: true })
	storage?: HealthResultDto;

	@Field(() => HealthResultDto, { nullable: true })
	memory?: HealthResultDto;

	@Field(() => HealthResultDto, { nullable: true })
	db?: HealthResultDto;

	@Field(() => HealthResultMobileAppDto, { nullable: true })
	mobileApp?: HealthResultMobileAppDto;
}

@ObjectType()
export class HealthDto {
	@Field()
	status: string;

	@Field(() => HealthIndicatorDto)
	info: HealthIndicatorDto;

	@Field(() => HealthIndicatorDto)
	error: HealthIndicatorDto;

	@Field(() => HealthIndicatorDto)
	details: HealthIndicatorDto;
}
