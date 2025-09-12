import { ApiProperty } from '@nestjs/swagger';
import { DeviceType } from '@prisma/client';
import { Expose } from 'class-transformer';

export class PublicDeviceDto {
	@Expose()
	@ApiProperty({ enum: DeviceType, enumName: 'DeviceType' })
	type: DeviceType;

	@Expose()
	name: string;

	@Expose()
	compatible(): boolean {
		return this.eSimSupport;
	}

	@Expose()
	eSimSupport: boolean;
}
