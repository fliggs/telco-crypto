import {
	Args,
	Mutation,
	Parent,
	Query,
	ResolveField,
	Resolver,
} from '@nestjs/graphql';
import { Wallet, WalletProvider } from '@prisma/client';

import { PaginationArgs } from '@/paginated';
import { AdminAccess } from '@/auth/access.decorator';

import { PaginatedWallets, WalletDto } from './dto/graphql/wallet.dto';
import { WalletService } from './wallet.service';
import { WalletFilterDto } from './dto/request/wallet-filter.dto';
import { TokenBalanceDto } from './dto/graphql/token-balance.dto';

@Resolver(() => WalletDto)
export class WalletResolver {
	constructor(private readonly walletService: WalletService) {}

	@AdminAccess()
	@Query(() => PaginatedWallets)
	async wallets(
		@Args('filter', { type: () => WalletFilterDto, nullable: true })
		filter?: WalletFilterDto,
		@Args('pagination', { type: () => PaginationArgs, nullable: true })
		pagination?: PaginationArgs,
	): Promise<PaginatedWallets> {
		return this.walletService.findAllPaginated(filter, pagination);
	}

	@AdminAccess()
	@Query(() => WalletDto)
	async wallet(
		@Args('id', { type: () => String })
		id: string,
	): Promise<WalletDto> {
		return this.walletService.findOne(id);
	}

	@AdminAccess()
	@Mutation(() => WalletDto)
	async createWallet(
		@Args('userId') userId: string,
		@Args('provider') provider: WalletProvider,
		@Args('address') address: string,
		@Args('isImported') isImported: boolean,
		@Args('isReadOnly') isReadOnly: boolean,
	): Promise<WalletDto> {
		return this.walletService.create(
			userId,
			provider,
			address,
			isImported,
			isReadOnly,
		);
	}

	@AdminAccess()
	@Mutation(() => WalletDto)
	async deleteWallet(@Args('id') id: string): Promise<WalletDto> {
		return this.walletService.delete(id);
	}

	@AdminAccess()
	@ResolveField(() => [TokenBalanceDto])
	async tokens(@Parent() wallet: Wallet): Promise<TokenBalanceDto[]> {
		return this.walletService.getTokens(wallet.userId, wallet.id);
	}
}
