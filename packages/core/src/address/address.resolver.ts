import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { AddressType } from '@prisma/client';

import { AdminAccess } from '@/auth/access.decorator';

import { AddressDto } from './dto/graphql/address.dto';
import { AddressService } from './address.service';
import { AddressInputDto } from './dto/graphql/address-input.dto';

@Resolver(() => AddressDto)
export class AddressResolver {
	constructor(private readonly addrService: AddressService) {}

	@AdminAccess()
	@Mutation(() => AddressDto)
	async saveAddress(
		@Args('userId', { type: () => String })
		userId: string,
		@Args('type', { type: () => AddressType })
		type: AddressType,
		@Args('address', { type: () => AddressInputDto })
		dto: AddressInputDto,
	): Promise<AddressDto> {
		return this.addrService.update(userId, type, dto);
	}
}
