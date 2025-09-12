import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { AdminAccess } from '@/auth/access.decorator';

import { DeviceDto } from './dto/graphql/device.dto';
import { DeviceService } from './device.service';
import { DeviceInputDto } from './dto/input/device.dto';

@Resolver(() => DeviceDto)
export class DeviceResolver {
	constructor(private readonly deviceService: DeviceService) {}

	@AdminAccess()
	@Query(() => [DeviceDto])
	async devices(
		@Args('name', { type: () => String, nullable: true }) name: string | null,
	) {
		return this.deviceService.findMany(name ?? undefined);
	}

	@AdminAccess()
	@Mutation(() => DeviceDto)
	async saveDevice(
		@Args('id', { type: () => String, nullable: true }) id: string | null,
		@Args('device') device: DeviceInputDto,
	) {
		if (id) {
			return this.deviceService.save(id, device);
		} else {
			return this.deviceService.create(device);
		}
	}

	@AdminAccess()
	@Mutation(() => DeviceDto)
	async deleteDevice(@Args('id') id: string) {
		return this.deviceService.delete(id);
	}
}
