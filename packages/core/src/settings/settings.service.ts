import { Injectable, NotFoundException } from '@nestjs/common';
import { SettingKey } from '@prisma/client';

import { DbService } from '@/db/db.service';
import { Content } from '@/content/dto/internal/content.dto';
import { ContentInputDto } from '@/content/dto/request/content-input.dto';

@Injectable()
export class SettingsService {
	private cachedTerms: Content;
	private cachedPrivacyPolicy: Content;
	private cachedFaqs: Content;
	private cachedOrderStepRetries: number[];

	constructor(private readonly db: DbService) {}

	async getTermsAndConditions(): Promise<Content> {
		if (!this.cachedTerms) {
			const setting = await this.db.setting.findUnique({
				where: {
					key: SettingKey.TERMS_AND_CONDITIONS,
				},
			});
			if (!setting) {
				throw new NotFoundException(`setting_not_found:terms_and_conditions`);
			}
			this.cachedTerms = setting.value as Content;
		}

		return this.cachedTerms;
	}

	async setTermsAndConditions(content: ContentInputDto): Promise<Content> {
		const setting = await this.db.setting.update({
			where: {
				key: SettingKey.TERMS_AND_CONDITIONS,
			},
			data: {
				value: content,
			},
		});
		this.cachedTerms = setting.value as Content;
		return this.cachedTerms;
	}

	async getPrivacyPolicy(): Promise<Content> {
		if (!this.cachedPrivacyPolicy) {
			const setting = await this.db.setting.findUnique({
				where: {
					key: SettingKey.PRIVACY_POLICY,
				},
			});
			if (!setting) {
				throw new NotFoundException(`setting_not_found:privacy_policy`);
			}
			this.cachedPrivacyPolicy = setting.value as Content;
		}

		return this.cachedPrivacyPolicy;
	}

	async setPrivacyPolicy(content: ContentInputDto): Promise<Content> {
		const setting = await this.db.setting.update({
			where: {
				key: SettingKey.PRIVACY_POLICY,
			},
			data: {
				value: content,
			},
		});
		this.cachedPrivacyPolicy = setting.value as Content;
		return this.cachedPrivacyPolicy;
	}

	async getFaqs(): Promise<Content> {
		if (!this.cachedFaqs) {
			const setting = await this.db.setting.findUnique({
				where: {
					key: SettingKey.FAQ,
				},
			});
			if (!setting) {
				throw new NotFoundException(`setting_not_found:faq`);
			}
			this.cachedFaqs = setting.value as Content;
		}

		return this.cachedFaqs;
	}

	async setFaqs(content: ContentInputDto): Promise<Content> {
		const setting = await this.db.setting.update({
			where: {
				key: SettingKey.FAQ,
			},
			data: {
				value: content,
			},
		});
		this.cachedFaqs = setting.value as Content;
		return this.cachedFaqs;
	}

	async getRetries(): Promise<number[]> {
		if (!this.cachedOrderStepRetries) {
			const setting = await this.db.setting.findUnique({
				where: {
					key: SettingKey.ORDER_STEP_RETRIES,
				},
			});
			if (!setting) {
				throw new NotFoundException(`setting_not_found:order_step_retries`);
			}
			this.cachedOrderStepRetries = (
				setting.value as { default: number[] }
			).default;
		}

		return this.cachedOrderStepRetries;
	}
}
