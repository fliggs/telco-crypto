import { Injectable, NotFoundException, Scope } from '@nestjs/common';
import { PhoneNumber, PhoneNumberAssignment } from '@prisma/client';
import * as DataLoader from 'dataloader';

import { PaginatedLoad } from '@/paginated';

import { PhoneNumberService } from './phone-number.service';
import { PhoneNumberFilterDto } from './dto/request/phone-number-filter.dto';

@Injectable({ scope: Scope.REQUEST })
export class PhoneNumberLoader {
	constructor(private readonly phoneNumService: PhoneNumberService) {}

	public readonly byMsisdn = new DataLoader<string, PhoneNumber>(
		async (keys: readonly string[]) => {
			const map = await this.phoneNumService.mapByMsisdns([...keys]);
			return keys.map(
				(key) =>
					map.get(key) ?? new NotFoundException('phone_number_not_found'),
			);
		},
	);

	public readonly assignmentsBySubscriptionPaginated = new DataLoader<
		PaginatedLoad<string, PhoneNumberFilterDto>,
		PhoneNumberAssignment[]
	>(async (keys: readonly PaginatedLoad<string, PhoneNumberFilterDto>[]) => {
		const map =
			await this.phoneNumService.mapAssignmentsBySubscriptionPaginated([
				...keys,
			]);
		return keys.map(([key]) => map.get(key) ?? []);
	});
}
