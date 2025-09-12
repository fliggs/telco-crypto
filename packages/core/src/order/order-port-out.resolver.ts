import {
	Args,
	Mutation,
	Parent,
	ResolveField,
	Resolver,
} from '@nestjs/graphql';
import { OrderPortOutDetails } from '@prisma/client';

import { AdminAccess } from '@/auth/access.decorator';

import { OrderPortOutService } from './order-port-out.service';
import { OrderPortOutDetailsDto } from './dto/graphql/order-port-out.dto';

@Resolver(() => OrderPortOutDetailsDto)
export class OrderPortOutResolver {
	constructor(private readonly portOutService: OrderPortOutService) {}

	@AdminAccess()
	@Mutation(() => OrderPortOutDetailsDto)
	async markOrderPortOutApproved(
		@Args('id', { type: () => String })
		id: string,
		@Args('approved', { type: () => Boolean })
		approved: boolean,
	): Promise<OrderPortOutDetailsDto> {
		return this.portOutService.markPortOutApproved(id, approved);
	}

	@AdminAccess()
	@ResolveField(() => String, { nullable: true })
	async request(
		@Parent() portOut: OrderPortOutDetails,
	): Promise<string | null> {
		return portOut.request ? JSON.stringify(portOut.request) : null;
	}
}
