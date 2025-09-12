import { OrderRun, WalletProvider } from '@prisma/client';
import {
	forwardRef,
	Inject,
	Injectable,
	InternalServerErrorException,
} from '@nestjs/common';

import { Step, StepFactory } from '@/order/dto/internal/step.dto';
import { OrderWithDetails, ProcessorResult } from '@/order/order.processor';
import { SubscriptionService } from '@/subscription/subscription.service';
import { WalletService } from '@/wallet/wallet.service';

export class CertificatesStep extends Step {
	public readonly name = 'CERTIFICATES';

	constructor(
		config: unknown,
		private readonly subService: SubscriptionService,
		private readonly walletService: WalletService,
	) {
		super(config);
	}

	public async run(
		order: OrderWithDetails,
		run: OrderRun,
	): Promise<ProcessorResult> {
		const sub = await this.subService.findOneSimple(order.subscriptionId!);

		if (sub.parentId) {
			return {
				result: 'not_eligible',
			};
		}

		if (!sub.phoneNumberMsisdn) {
			throw new InternalServerErrorException('missing_phone_number');
		}

		const wallets = await this.walletService.findByUser(
			order.userId,
			WalletProvider.SOLANA,
		);
		const wallet = wallets[0];

		if (wallet) {
			const cert = await this.walletService.createCertificate(
				order.userId,
				wallet,
				sub.phoneNumberMsisdn,
			);
			return {
				result: cert,
			};
		} else {
			return {
				result: 'wallet_not_setup',
			};
		}
	}

	public async abort(
		order: OrderWithDetails,
		run: OrderRun,
	): Promise<ProcessorResult> {}
}

@Injectable()
export class CertificatesStepFactory extends StepFactory<unknown> {
	constructor(
		@Inject(forwardRef(() => SubscriptionService))
		private readonly subService: SubscriptionService,
		private readonly walletService: WalletService,
	) {
		super();
	}

	public create(config: unknown): CertificatesStep {
		return new CertificatesStep(config, this.subService, this.walletService);
	}
}
