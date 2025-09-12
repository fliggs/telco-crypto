import {
	forwardRef,
	Inject,
	Injectable,
	InternalServerErrorException,
	Logger,
	NotFoundException,
	NotImplementedException,
} from '@nestjs/common';
import { Order, Prisma, Wallet, WalletProvider } from '@prisma/client';
import { isUUID } from 'class-validator';
import { createHash, randomBytes } from 'crypto';

import { DecimalNumber } from '@/decimal.dto';
import { paginate, PaginatedLoad, PaginationArgs } from '@/paginated';
import { DbService } from '@/db/db.service';
import { SubscriptionService } from '@/subscription/subscription.service';

import { WalletProviderSolanaService } from './implementations/solana/solana.service';
import { WalletFilterDto } from './dto/request/wallet-filter.dto';
import { PublicSigningRequestDto } from './dto/response/public-signing-request.dto';

@Injectable()
export class WalletService {
	protected readonly logger = new Logger(WalletService.name);

	constructor(
		private readonly db: DbService,
		@Inject(forwardRef(() => SubscriptionService))
		private readonly subService: SubscriptionService,
		private readonly solana: WalletProviderSolanaService,
	) {}

	async create(
		userId: string,
		provider: WalletProvider,
		address: string,
		isImported: boolean,
		isReadOnly: boolean,
	) {
		return this.db.wallet.create({
			data: {
				userId,
				provider,
				address,
				isImported,
				isReadOnly,
				data: {},
			},
		});
	}

	async update(
		userId: string,
		walletIdOrAddress: string,
		cloudBackupAt?: Date,
		localBackupAt?: Date,
		isReadOnly?: boolean,
	) {
		return this.db.wallet.update({
			where: isUUID(walletIdOrAddress)
				? { id: walletIdOrAddress, userId }
				: { userId_address: { address: walletIdOrAddress, userId } },
			data: {
				cloudBackupAt,
				localBackupAt,
				isReadOnly,
			},
		});
	}

	async findAll() {
		return this.db.wallet.findMany();
	}

	async findAllPaginated(filter?: WalletFilterDto, args?: PaginationArgs) {
		return paginate(
			(take, skip, cursor) =>
				this.db.wallet.findMany({
					where: {
						...(filter?.address
							? { address: { contains: filter.address } }
							: null),
					},
					take,
					skip,
					cursor: cursor ? { id: cursor } : undefined,
				}),
			(item) => item.id,
			args,
		);
	}

	async findOne(id: string) {
		const wallet = await this.db.wallet.findUnique({
			where: {
				id,
			},
		});
		if (!wallet) {
			throw new NotFoundException('wallet_not_found');
		}
		return wallet;
	}

	async findByUser(userId: string, provider?: WalletProvider) {
		return this.db.wallet.findMany({
			where: {
				userId,
				provider,
			},
		});
	}

	async findUserWalletData(provider: WalletProvider, userId: string) {
		return this.db.userWalletData.findUnique({
			where: {
				provider_userId: {
					userId,
					provider,
				},
			},
		});
	}

	async mapByUserIdsPaginated(ids: PaginatedLoad<string, WalletFilterDto>[]) {
		let query = Prisma.sql``;

		for (let i = 0; i < ids.length; i++) {
			const [id, filter, take, skip, cursor] = ids[i];
			const sel = Prisma.sql`SELECT w.* FROM "Wallet" AS w`;
			let where = Prisma.sql`WHERE w."userId" = ${id}::uuid`;
			let join = Prisma.sql``;
			if (filter) {
				if (filter.address) {
					where = Prisma.sql`${where} AND w."address" ILIKE "%${filter.address}%"`;
				}
			}
			if (cursor) {
				if (take < 0) {
					where = Prisma.sql`${where} AND w."updatedAt" >= (SELECT "updatedAt" FROM "Wallet" WHERE "id" = ${cursor}::uuid)`;
				} else {
					where = Prisma.sql`${where} AND w."updatedAt" <= (SELECT "updatedAt" FROM "Wallet" WHERE "id" = ${cursor}::uuid)`;
				}
			}
			const order = Prisma.sql`ORDER BY w."updatedAt" ${Prisma.raw(take < 0 ? 'ASC' : 'DESC')}`;
			const row = Prisma.sql`(${sel} ${join} ${where} ${order} LIMIT ${Math.abs(take)} OFFSET ${skip})`;
			query = i > 0 ? Prisma.sql`${query} UNION ALL ${row}` : row;
		}

		const wallets = await this.db.$queryRaw<Wallet[]>`${query}`;

		const map: Map<string, Wallet[]> = new Map();
		for (const wallet of wallets) {
			let userWallets = map.get(wallet.userId);
			if (!userWallets) {
				userWallets = [];
				map.set(wallet.userId, userWallets);
			}
			userWallets.push(wallet);
		}
		for (const [id, _, take] of ids) {
			if (take < 0) {
				map.get(id)?.reverse();
			}
		}
		return map;
	}

	async cashback(
		provider: WalletProvider,
		order: Order,
		amountInUsd: DecimalNumber,
		description: string,
	): Promise<string | unknown> {
		const wallet = await this.db.wallet.findFirst({
			where: {
				userId: order.userId,
				provider,
			},
			include: {
				user: {
					include: {
						settings: true,
					},
				},
			},
		});
		if (!wallet) {
			this.logger.warn(
				`User ${order.userId} does not have a ${provider} wallet`,
			);
			return `no_wallet:${provider}`;
		}

		let res: unknown = null;
		switch (provider) {
			case WalletProvider.SOLANA: {
				res = await this.solana.payout(
					wallet.user,
					wallet,
					order,
					amountInUsd,
					description,
				);
				break;
			}

			default: {
				throw new NotImplementedException(`cashback_not_supported:${provider}`);
			}
		}

		return res;
	}

	async delete(id: string) {
		return this.db.wallet.delete({
			where: {
				id,
			},
		});
	}

	async generate(
		userId: string,
		walletIdOrAddress: string,
		content: any,
	): Promise<PublicSigningRequestDto> {
		const wallet = await this.db.wallet.findUnique({
			where: isUUID(walletIdOrAddress)
				? { id: walletIdOrAddress, userId }
				: { userId_address: { address: walletIdOrAddress, userId } },
		});
		if (!wallet) {
			throw new NotFoundException('wallet_not_found');
		}

		const nonce = randomBytes(64);

		const hasher = createHash('sha512');
		hasher.update(nonce);
		hasher.update(JSON.stringify(content), 'utf-8');
		const hash = hasher.digest('base64');

		return {
			address: wallet.address,
			message: hash,
		};
	}

	async validate(
		userId: string,
		walletIdOrAddress: string,
		message: string,
		signature: string,
	) {
		const wallet = await this.db.wallet.findUnique({
			where: isUUID(walletIdOrAddress)
				? { id: walletIdOrAddress, userId }
				: { userId_address: { address: walletIdOrAddress, userId } },
		});
		if (!wallet) {
			throw new NotFoundException('wallet_not_found');
		}

		switch (wallet.provider) {
			case WalletProvider.SOLANA: {
				return this.solana.validate(userId, wallet, message, signature);
			}

			default: {
				throw new InternalServerErrorException(
					`unknown_wallet_provider:${wallet.provider}`,
				);
			}
		}
	}

	async createCertificate(userId: string, wallet: Wallet, msisdn: string) {
		switch (wallet.provider) {
			case WalletProvider.SOLANA: {
				return this.solana.createCertificate(userId, wallet, msisdn);
			}

			default: {
				throw new InternalServerErrorException(
					`unknown_wallet_provider:${wallet.provider}`,
				);
			}
		}
	}

	async getTokens(userId: string, walletIdOrAddress: string) {
		const wallet = await this.db.wallet.findUnique({
			where: isUUID(walletIdOrAddress)
				? { id: walletIdOrAddress, userId }
				: { userId_address: { address: walletIdOrAddress, userId } },
		});
		if (!wallet) {
			throw new NotFoundException('wallet_not_found');
		}

		switch (wallet.provider) {
			case WalletProvider.SOLANA: {
				return this.solana.getTokens(userId, wallet);
			}

			default: {
				throw new InternalServerErrorException(
					`unknown_wallet_provider:${wallet.provider}`,
				);
			}
		}
	}

	async getTokenHistory(
		userId: string,
		walletIdOrAddress: string,
		token: string,
		days: number,
	) {
		const wallet = await this.db.wallet.findUnique({
			where: isUUID(walletIdOrAddress)
				? { id: walletIdOrAddress, userId }
				: { userId_address: { address: walletIdOrAddress, userId } },
		});
		if (!wallet) {
			throw new NotFoundException('wallet_not_found');
		}

		switch (wallet.provider) {
			case WalletProvider.SOLANA: {
				return this.solana.getTokenHistory(userId, wallet, token, days);
			}

			default: {
				throw new InternalServerErrorException(
					`unknown_wallet_provider:${wallet.provider}`,
				);
			}
		}
	}

	async getCertificates(userId: string, walletIdOrAddress: string) {
		const wallet = await this.db.wallet.findUnique({
			where: isUUID(walletIdOrAddress)
				? { id: walletIdOrAddress, userId }
				: { userId_address: { address: walletIdOrAddress, userId } },
		});
		if (!wallet) {
			throw new NotFoundException('wallet_not_found');
		}

		const subs = await this.subService.findByUser(userId);
		const nums = subs
			.filter((s) => !!s.phoneNumberMsisdn)
			.map((s) => s.phoneNumberMsisdn!);

		switch (wallet.provider) {
			case WalletProvider.SOLANA: {
				return this.solana.getCertificates(userId, wallet, nums);
			}

			default: {
				throw new InternalServerErrorException(
					`unknown_wallet_provider:${wallet.provider}`,
				);
			}
		}
	}
}
