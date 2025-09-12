import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { AdminAccess } from '@/auth/access.decorator';
import { ContentDto } from '@/content/dto/graphql/content.dto';
import { ContentInputDto } from '@/content/dto/request/content-input.dto';

import { SettingsService } from './settings.service';

@Resolver()
export class SettingsResolver {
	constructor(private readonly settingsService: SettingsService) {}

	@AdminAccess()
	@Query(() => ContentDto)
	async termsAndConditions(): Promise<ContentDto> {
		return this.settingsService.getTermsAndConditions();
	}

	@AdminAccess()
	@Mutation(() => ContentDto)
	async changeTermsAndConditions(
		@Args('content', { type: () => ContentInputDto }) content: ContentInputDto,
	): Promise<ContentDto> {
		return this.settingsService.setTermsAndConditions(content);
	}

	@AdminAccess()
	@Query(() => ContentDto)
	async privacyPolicy(): Promise<ContentDto> {
		return this.settingsService.getPrivacyPolicy();
	}

	@AdminAccess()
	@Mutation(() => ContentDto)
	async changePrivacyPolicy(
		@Args('content', { type: () => ContentInputDto }) content: ContentInputDto,
	): Promise<ContentDto> {
		return this.settingsService.setPrivacyPolicy(content);
	}

	@AdminAccess()
	@Query(() => ContentDto)
	async faqs(): Promise<ContentDto> {
		return this.settingsService.getFaqs();
	}

	@AdminAccess()
	@Mutation(() => ContentDto)
	async changeFaqs(
		@Args('content', { type: () => ContentInputDto }) content: ContentInputDto,
	): Promise<ContentDto> {
		return this.settingsService.setFaqs(content);
	}

	@AdminAccess()
	@Query(() => [Number])
	async orderStepRetries(): Promise<number[]> {
		return this.settingsService.getRetries();
	}
}
