import { Module } from '@nestjs/common';

import { AddressService } from './address.service';
import { AddressLoader } from './address.loader';
import { AddressResolver } from './address.resolver';

@Module({
	providers: [AddressService, AddressResolver, AddressLoader],
	exports: [AddressService, AddressLoader],
})
export class AddressModule {}
