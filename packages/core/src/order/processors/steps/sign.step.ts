import { OrderRun, WalletProvider } from '@prisma/client';
import { Injectable, InternalServerErrorException } from '@nestjs/common';

import { Step, StepFactory } from '@/order/dto/internal/step.dto';
import { OrderWithDetails, ProcessorResult } from '@/order/order.processor';
import { WalletService } from '@/wallet/wallet.service';
import { DbService } from '@/db/db.service';

interface Details {
	accountNumber: string;
}

export interface SignStepConfig {
	allowMissingWallets: boolean;
	getDetails: (order: OrderWithDetails, run: OrderRun) => Promise<Details>;
}

export class SignStep extends Step<SignStepConfig> {
	public readonly name = 'SIGN';

	constructor(
		config: SignStepConfig,
		private readonly db: DbService,
		private readonly walletService: WalletService,
	) {
		super(config);
	}

	public async run(
		order: OrderWithDetails,
		run: OrderRun,
	): Promise<ProcessorResult> {
		const wallets = await this.walletService.findByUser(
			order.userId,
			WalletProvider.SOLANA,
		);
		const wallet = wallets[0];

		if (wallet) {
			const details = await this.config.getDetails(order, run);

			const signing = await this.db.orderSigningDetails.upsert({
				where: {
					orderId: order.id,
				},
				create: {
					orderId: order.id,
				},
				update: {},
			});

			if (!signing.message) {
				const req = await this.walletService.generate(
					order.userId,
					wallet.address,
					{
						orderId: order.id,
						walletId: wallet.id,
						accountNumber: details.accountNumber,
					},
				);
				await this.db.orderSigningDetails.update({
					where: {
						orderId: order.id,
					},
					data: {
						message: req.message,
						walletId: wallet.id,
					},
				});
			}

			if (!signing.message || !signing.signature || !signing.signedAt) {
				throw new InternalServerErrorException('waiting_for_signature');
			}

			const valid = await this.walletService.validate(
				order.userId,
				wallet.id,
				signing.message,
				signing.signature,
			);
			if (!valid) {
				throw new InternalServerErrorException('invalid_signature');
			}

			return {
				result: signing,
			};
		} else if (this.config.allowMissingWallets) {
			return {
				result: 'no_wallet',
			};
		} else {
			throw new InternalServerErrorException('wallet_not_setup');
		}
	}

	public async abort(
		order: OrderWithDetails,
		run: OrderRun,
	): Promise<ProcessorResult> {}
}

@Injectable()
export class SignStepFactory extends StepFactory<SignStepConfig> {
	constructor(
		private readonly db: DbService,
		private readonly walletService: WalletService,
	) {
		super();
	}

	public create(config: SignStepConfig): SignStep {
		return new SignStep(config, this.db, this.walletService);
	}
}
