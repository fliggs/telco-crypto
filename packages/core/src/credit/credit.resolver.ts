import { Args, Mutation, Resolver } from '@nestjs/graphql';

import { AdminAccess } from '@/auth/access.decorator';

import { CreditDto } from './dto/graphql/credit.dto';
import { CreditService } from './credit.service';
import { CreateCreditDto } from './dto/request/create-credit.dto';

@Resolver(() => CreditDto)
export class CreditResolver {
	constructor(private readonly creditService: CreditService) {}

	@AdminAccess()
	@Mutation(() => CreditDto)
	async createCredit(
		@Args('credit', { type: () => CreateCreditDto })
		dto: CreateCreditDto,
	): Promise<CreditDto> {
		return this.creditService.create(dto);
	}
}
